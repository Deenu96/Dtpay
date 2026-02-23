const Trade = require('../models/Trade');
const { asyncHandler, APIError } = require('../middleware/errorHandler');
const { ERROR_CODES, TRADE_STATUS } = require('../utils/constants');
const orderMatchingService = require('../services/orderMatchingService');
const { emitToUser } = require('../config/socket');
const logger = require('../utils/logger');

/**
 * Trade Controller - Handles trade operations
 */

/**
 * Get user's trades
 * GET /api/trades
 */
const getMyTrades = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { status, page = 1, limit = 20 } = req.query;

  const query = {
    $or: [{ maker: userId }, { taker: userId }],
  };

  if (status) query.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [trades, total] = await Promise.all([
    Trade.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('maker', 'firstName lastName')
      .populate('taker', 'firstName lastName')
      .populate('buyer', 'firstName lastName')
      .populate('seller', 'firstName lastName')
      .lean(),
    Trade.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: {
      trades,
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
 * Get trade by ID
 * GET /api/trades/:id
 */
const getTradeById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  const trade = await Trade.findById(id)
    .populate('maker', 'firstName lastName')
    .populate('taker', 'firstName lastName')
    .populate('buyer', 'firstName lastName')
    .populate('seller', 'firstName lastName')
    .populate('order', 'orderId type');

  if (!trade) {
    throw new APIError('Trade not found', 404, ERROR_CODES.NOT_FOUND);
  }

  // Verify user is part of trade
  if (trade.maker._id.toString() !== userId && trade.taker._id.toString() !== userId) {
    throw new APIError('You are not authorized to view this trade', 403, ERROR_CODES.FORBIDDEN);
  }

  res.json({
    success: true,
    data: trade,
  });
});

/**
 * Confirm payment (buyer)
 * POST /api/trades/:id/confirm-payment
 */
const confirmPayment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { paymentReference } = req.body;
  const userId = req.userId;

  const result = await orderMatchingService.confirmPayment(id, userId, paymentReference);

  // Notify counterparty
  const trade = result.trade;
  const counterpartyId = trade.buyer.toString() === userId ? trade.seller : trade.buyer;
  emitToUser(counterpartyId.toString(), 'trade:payment_confirmed', {
    tradeId: trade._id,
    tradeIdStr: trade.tradeId,
  });

  res.json({
    success: true,
    message: 'Payment confirmed successfully',
    data: result.trade,
  });
});

/**
 * Confirm release (seller)
 * POST /api/trades/:id/confirm-release
 */
const confirmRelease = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  const result = await orderMatchingService.confirmRelease(id, userId);

  // Notify counterparty
  const trade = result.trade;
  const counterpartyId = trade.buyer.toString() === userId ? trade.seller : trade.buyer;
  emitToUser(counterpartyId.toString(), 'trade:completed', {
    tradeId: trade._id,
    tradeIdStr: trade.tradeId,
  });

  res.json({
    success: true,
    message: 'USDT released successfully. Trade completed.',
    data: result.trade,
  });
});

/**
 * Cancel trade
 * POST /api/trades/:id/cancel
 */
const cancelTrade = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const userId = req.userId;

  const result = await orderMatchingService.cancelTrade(id, userId, reason);

  // Notify counterparty
  const trade = result.trade;
  const counterpartyId = trade.buyer.toString() === userId ? trade.seller : trade.buyer;
  emitToUser(counterpartyId.toString(), 'trade:cancelled', {
    tradeId: trade._id,
    tradeIdStr: trade.tradeId,
    reason,
  });

  res.json({
    success: true,
    message: 'Trade cancelled successfully',
    data: result.trade,
  });
});

/**
 * Raise dispute
 * POST /api/trades/:id/dispute
 */
const raiseDispute = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const userId = req.userId;

  const result = await orderMatchingService.raiseDispute(id, userId, reason);

  // Notify counterparty
  const trade = result.trade;
  const counterpartyId = trade.buyer.toString() === userId ? trade.seller : trade.buyer;
  emitToUser(counterpartyId.toString(), 'trade:dispute_raised', {
    tradeId: trade._id,
    tradeIdStr: trade.tradeId,
    reason,
  });

  res.json({
    success: true,
    message: 'Dispute raised successfully. An admin will review your case.',
    data: result.trade,
  });
});

/**
 * Add chat message
 * POST /api/trades/:id/chat
 */
const addChatMessage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;
  const userId = req.userId;

  const trade = await Trade.findById(id);
  if (!trade) {
    throw new APIError('Trade not found', 404, ERROR_CODES.NOT_FOUND);
  }

  // Verify user is part of trade
  if (trade.buyer.toString() !== userId && trade.seller.toString() !== userId) {
    throw new APIError('You are not authorized to chat in this trade', 403, ERROR_CODES.FORBIDDEN);
  }

  await trade.addChatMessage(userId, message);

  // Notify counterparty
  const counterpartyId = trade.buyer.toString() === userId ? trade.seller : trade.buyer;
  emitToUser(counterpartyId.toString(), 'trade:chat_message', {
    tradeId: trade._id,
    message: {
      sender: userId,
      message,
      createdAt: new Date(),
    },
  });

  res.json({
    success: true,
    message: 'Message sent',
  });
});

/**
 * Get active trades
 * GET /api/trades/active
 */
const getActiveTrades = asyncHandler(async (req, res) => {
  const userId = req.userId;

  const trades = await Trade.getUserActiveTrades(userId);

  res.json({
    success: true,
    data: trades,
  });
});

module.exports = {
  getMyTrades,
  getTradeById,
  confirmPayment,
  confirmRelease,
  cancelTrade,
  raiseDispute,
  addChatMessage,
  getActiveTrades,
};
