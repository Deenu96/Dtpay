const Order = require('../models/Order');
const Wallet = require('../models/Wallet');
const { asyncHandler, APIError } = require('../middleware/errorHandler');
const { ERROR_CODES, ORDER_TYPES, ORDER_STATUS, CURRENCIES, TRADING_LIMITS } = require('../utils/constants');
const walletService = require('../services/walletService');
const orderMatchingService = require('../services/orderMatchingService');
const { emitToPublic } = require('../config/socket');
const logger = require('../utils/logger');

/**
 * Order Controller - Handles P2P order operations
 */

/**
 * List orders with filters
 * GET /api/orders
 */
const listOrders = asyncHandler(async (req, res) => {
  const { type, status = 'active', page = 1, limit = 20, minAmount, maxAmount, paymentMethod } = req.query;

  const query = {};
  
  if (type) query.type = type;
  if (status) query.status = status;
  if (minAmount) query.remainingAmount = { $gte: parseFloat(minAmount) };
  if (maxAmount) {
    query.remainingAmount = query.remainingAmount || {};
    query.remainingAmount.$lte = parseFloat(maxAmount);
  }
  if (paymentMethod) query.paymentMethods = paymentMethod;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [orders, total] = await Promise.all([
    Order.find(query)
      .sort({ isFeatured: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'firstName lastName')
      .lean(),
    Order.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: {
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
        hasNext: parseInt(page) * parseInt(limit) < total,
        hasPrev: parseInt(page) > 1,
      },
    },
  });
});

/**
 * Get order book
 * GET /api/orders/orderbook
 */
const getOrderBook = asyncHandler(async (req, res) => {
  const { type } = req.query;

  if (!type || !['buy', 'sell'].includes(type)) {
    throw new APIError('Order type (buy/sell) is required', 400, ERROR_CODES.VALIDATION_ERROR);
  }

  const orders = await orderMatchingService.getOrderBook(type);

  res.json({
    success: true,
    data: {
      type,
      orders,
      count: orders.length,
    },
  });
});

/**
 * Create a new order
 * POST /api/orders
 */
const createOrder = asyncHandler(async (req, res) => {
  const {
    type,
    amount,
    price,
    currencyFrom,
    currencyTo,
    paymentMethods,
    minAmount,
    maxAmount,
    paymentTimeLimit,
    terms,
    autoReply,
  } = req.body;

  const userId = req.userId;

  // Validate amount limits
  if (amount < TRADING_LIMITS.MIN_ORDER_AMOUNT_USDT || amount > TRADING_LIMITS.MAX_ORDER_AMOUNT_USDT) {
    throw new APIError(
      `Amount must be between ${TRADING_LIMITS.MIN_ORDER_AMOUNT_USDT} and ${TRADING_LIMITS.MAX_ORDER_AMOUNT_USDT} USDT`,
      400,
      ERROR_CODES.VALIDATION_ERROR
    );
  }

  // For sell orders, check if user has sufficient balance
  if (type === ORDER_TYPES.SELL) {
    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet || wallet.balances.USDT.available < amount) {
      throw new APIError('Insufficient USDT balance', 400, ERROR_CODES.INSUFFICIENT_BALANCE);
    }
  }

  // Create order
  const order = await Order.create({
    user: userId,
    type,
    amount,
    price,
    currencyFrom,
    currencyTo,
    paymentMethods,
    minAmount: minAmount || TRADING_LIMITS.MIN_ORDER_AMOUNT_USDT,
    maxAmount: maxAmount || amount,
    paymentTimeLimit: paymentTimeLimit || 30,
    terms,
    autoReply,
  });

  // For sell orders, lock the amount
  if (type === ORDER_TYPES.SELL) {
    await walletService.lockAmount(userId, CURRENCIES.USDT, amount);
  }

  // Emit order book update
  emitToPublic('orderbook:update', {
    type: 'new_order',
    order: {
      id: order._id,
      orderId: order.orderId,
      type: order.type,
      price: order.price,
      amount: order.amount,
      remainingAmount: order.remainingAmount,
    },
  });

  logger.info(`Order created: ${order.orderId} by user ${userId}`);

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: order,
  });
});

/**
 * Get order by ID
 * GET /api/orders/:id
 */
const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const order = await Order.findById(id)
    .populate('user', 'firstName lastName createdAt');

  if (!order) {
    throw new APIError('Order not found', 404, ERROR_CODES.NOT_FOUND);
  }

  res.json({
    success: true,
    data: order,
  });
});

/**
 * Cancel an order
 * PUT /api/orders/:id/cancel
 */
const cancelOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const userId = req.userId;

  const order = await Order.findById(id);

  if (!order) {
    throw new APIError('Order not found', 404, ERROR_CODES.NOT_FOUND);
  }

  // Verify user owns the order
  if (order.user.toString() !== userId) {
    throw new APIError('You can only cancel your own orders', 403, ERROR_CODES.FORBIDDEN);
  }

  // Check if order can be cancelled
  if (order.status !== ORDER_STATUS.ACTIVE) {
    throw new APIError('Only active orders can be cancelled', 400, ERROR_CODES.INVALID_OPERATION);
  }

  // Cancel order
  await order.cancel(userId, reason);

  // Unlock funds for sell orders
  if (order.type === ORDER_TYPES.SELL) {
    await walletService.unlockAmount(userId, CURRENCIES.USDT, order.remainingAmount);
  }

  // Emit order book update
  emitToPublic('orderbook:update', {
    type: 'cancelled_order',
    orderId: order.orderId,
  });

  logger.info(`Order cancelled: ${order.orderId} by user ${userId}`);

  res.json({
    success: true,
    message: 'Order cancelled successfully',
    data: order,
  });
});

/**
 * Accept an order (create trade)
 * POST /api/orders/:id/accept
 */
const acceptOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;
  const userId = req.userId;

  const result = await orderMatchingService.acceptOrder(id, userId, amount);

  // Emit order book update
  emitToPublic('orderbook:update', {
    type: 'order_accepted',
    orderId: result.trade.order,
    tradeId: result.trade._id,
  });

  res.json({
    success: true,
    message: 'Order accepted successfully',
    data: result.trade,
  });
});

/**
 * Get my orders
 * GET /api/orders/my-orders
 */
const getMyOrders = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { status, page = 1, limit = 20 } = req.query;

  const query = { user: userId };
  if (status) query.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [orders, total] = await Promise.all([
    Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Order.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: {
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
        hasNext: parseInt(page) * parseInt(limit) < total,
        hasPrev: parseInt(page) > 1,
      },
    },
  });
});

module.exports = {
  listOrders,
  getOrderBook,
  createOrder,
  getOrderById,
  cancelOrder,
  acceptOrder,
  getMyOrders,
};
