const Order = require('../models/Order');
const Trade = require('../models/Trade');
const Wallet = require('../models/Wallet');
const UPIPayment = require('../models/UPIPayment');
const mongoose = require('mongoose');
const { ORDER_TYPES, ORDER_STATUS, TRADE_STATUS, CURRENCIES } = require('../utils/constants');
const walletService = require('./walletService');
const notificationService = require('./notificationService');
const referralService = require('./referralService');
const logger = require('../utils/logger');

/**
 * Order Matching Service - Handles order matching and trade execution
 */

/**
 * Find matching orders for a given order
 * @param {String} type - Order type (buy/sell)
 * @param {Number} amount - Amount to match
 * @param {Number} price - Price to match
 * @param {String} excludeUserId - User ID to exclude (order creator)
 * @returns {Array} Matching orders
 */
const findMatchingOrders = async (type, amount, price, excludeUserId) => {
  return Order.findMatchingOrders(type, amount, price, { excludeUserId });
};

/**
 * Accept an order and create a trade
 * @param {String} orderId - Order ID to accept
 * @param {String} takerId - User ID accepting the order
 * @param {Number} amount - Amount to trade
 * @returns {Object} Created trade
 */
const acceptOrder = async (orderId, takerId, amount) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Get order
    const order = await Order.findById(orderId).session(session);
    if (!order) {
      throw new Error('Order not found');
    }

    // Validate order status
    if (order.status !== ORDER_STATUS.ACTIVE) {
      throw new Error('Order is not active');
    }

    // Validate amount
    if (amount < order.minAmount || amount > order.maxAmount) {
      throw new Error(`Amount must be between ${order.minAmount} and ${order.maxAmount}`);
    }

    if (amount > order.remainingAmount) {
      throw new Error('Amount exceeds remaining order amount');
    }

    // Prevent self-trading
    if (order.user.toString() === takerId) {
      throw new Error('Cannot accept your own order');
    }

    // Determine buyer and seller
    const isBuyOrder = order.type === ORDER_TYPES.BUY;
    const buyerId = isBuyOrder ? order.user : takerId;
    const sellerId = isBuyOrder ? takerId : order.user;

    // Get seller's wallet and check balance
    const sellerWallet = await Wallet.findOne({ user: sellerId }).session(session);
    if (!sellerWallet || sellerWallet.balances.USDT.available < amount) {
      throw new Error('Seller has insufficient USDT balance');
    }

    // Lock seller's USDT in escrow
    await walletService.lockAmount(sellerId, CURRENCIES.USDT, amount, session);

    // Get payment details for buyer to pay
    const sellerUPIs = await UPIPayment.getUserUPIs(sellerId);
    const paymentUPI = sellerUPIs.find(u => u.isDefault) || sellerUPIs[0];

    if (!paymentUPI && order.paymentMethods.includes('upi')) {
      throw new Error('Seller has no active UPI account');
    }

    // Calculate total value
    const totalValue = amount * order.price;

    // Create trade
    const trade = await Trade.create([{
      order: orderId,
      orderType: order.type,
      maker: order.user,
      taker: takerId,
      buyer: buyerId,
      seller: sellerId,
      amount,
      price: order.price,
      totalValue,
      currency: order.currencyTo,
      paymentMethod: paymentUPI ? 'upi' : 'bank_transfer',
      paymentDetails: paymentUPI ? {
        upiId: paymentUPI.upiId,
        accountHolderName: paymentUPI.accountHolderName,
        qrCodeUrl: paymentUPI.qrCodeUrl,
      } : {},
      paymentWindowExpiresAt: new Date(Date.now() + order.paymentTimeLimit * 60 * 1000),
    }], { session });

    // Update order
    await order.updateRemainingAmount(amount);
    if (order.remainingAmount <= amount) {
      order.status = ORDER_STATUS.MATCHED;
      await order.save({ session });
    }

    await session.commitTransaction();

    // Send notifications (outside transaction)
    await notificationService.sendTradeNotification(buyerId, 'trade_started', trade[0]);
    await notificationService.sendTradeNotification(sellerId, 'trade_started', trade[0]);

    logger.info(`Trade created: ${trade[0].tradeId} for order ${order.orderId}`);

    return {
      success: true,
      trade: trade[0],
    };
  } catch (error) {
    await session.abortTransaction();
    logger.error('Error accepting order:', error);
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Confirm payment for a trade
 * @param {String} tradeId - Trade ID
 * @param {String} userId - User confirming payment (buyer)
 * @param {String} paymentReference - Payment reference/transaction ID
 * @param {String} paymentProof - Payment proof image URL (optional)
 * @returns {Object} Updated trade
 */
const confirmPayment = async (tradeId, userId, paymentReference, paymentProof = null) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const trade = await Trade.findById(tradeId).session(session);
    if (!trade) {
      throw new Error('Trade not found');
    }

    // Verify user is buyer
    if (trade.buyer.toString() !== userId) {
      throw new Error('Only buyer can confirm payment');
    }

    // Mark as paid
    await trade.markAsPaid(paymentReference, paymentProof);

    await session.commitTransaction();

    // Notify seller
    await notificationService.sendTradeNotification(trade.seller, 'payment_received', trade);

    logger.info(`Payment confirmed for trade: ${trade.tradeId}`);

    return {
      success: true,
      trade,
    };
  } catch (error) {
    await session.abortTransaction();
    logger.error('Error confirming payment:', error);
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Confirm payment receipt and release USDT
 * @param {String} tradeId - Trade ID
 * @param {String} userId - User confirming receipt (seller)
 * @returns {Object} Updated trade
 */
const confirmRelease = async (tradeId, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const trade = await Trade.findById(tradeId).session(session);
    if (!trade) {
      throw new Error('Trade not found');
    }

    // Verify user is seller
    if (trade.seller.toString() !== userId) {
      throw new Error('Only seller can confirm release');
    }

    // Confirm payment
    await trade.confirmPayment(userId);

    // Transfer USDT from seller (locked) to buyer
    await walletService.deductLockedAmount(trade.seller, CURRENCIES.USDT, trade.amount, session);
    await walletService.addBalance(trade.buyer, CURRENCIES.USDT, trade.amount, session);

    // Create transaction records
    await walletService.createTransaction({
      user: trade.seller,
      type: 'trade',
      currency: CURRENCIES.USDT,
      amount: -trade.amount,
      fee: 0,
      netAmount: -trade.amount,
      balanceBefore: 0, // Will be calculated
      balanceAfter: 0, // Will be calculated
      description: `USDT sold in trade ${trade.tradeId}`,
      metadata: { tradeId: trade._id },
    }, session);

    await walletService.createTransaction({
      user: trade.buyer,
      type: 'trade',
      currency: CURRENCIES.USDT,
      amount: trade.amount,
      fee: 0,
      netAmount: trade.amount,
      balanceBefore: 0,
      balanceAfter: 0,
      description: `USDT bought in trade ${trade.tradeId}`,
      metadata: { tradeId: trade._id },
    }, session);

    // Complete trade
    await trade.complete();

    await session.commitTransaction();

    // Process referral bonuses (outside transaction)
    try {
      await referralService.processTradeReferralBonus(
        trade._id,
        trade.buyer,
        trade.seller,
        trade.amount
      );
    } catch (refError) {
      logger.error('Error processing referral bonus:', refError);
      // Don't fail the trade if referral processing fails
    }

    // Notify both parties
    await notificationService.sendTradeNotification(trade.buyer, 'trade_completed', trade);
    await notificationService.sendTradeNotification(trade.seller, 'trade_completed', trade);

    logger.info(`Trade completed: ${trade.tradeId}`);

    return {
      success: true,
      trade,
    };
  } catch (error) {
    await session.abortTransaction();
    logger.error('Error confirming release:', error);
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Cancel a trade
 * @param {String} tradeId - Trade ID
 * @param {String} userId - User cancelling
 * @param {String} reason - Cancellation reason
 * @returns {Object} Updated trade
 */
const cancelTrade = async (tradeId, userId, reason = null) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const trade = await Trade.findById(tradeId).session(session);
    if (!trade) {
      throw new Error('Trade not found');
    }

    // Verify user is part of trade
    if (trade.buyer.toString() !== userId && trade.seller.toString() !== userId) {
      throw new Error('You are not part of this trade');
    }

    // Unlock seller's USDT
    if (trade.status === TRADE_STATUS.PENDING) {
      await walletService.unlockAmount(trade.seller, CURRENCIES.USDT, trade.amount, session);
    }

    // Cancel trade
    await trade.cancel(userId, reason);

    await session.commitTransaction();

    // Notify both parties
    await notificationService.sendTradeNotification(trade.buyer, 'trade_cancelled', trade);
    await notificationService.sendTradeNotification(trade.seller, 'trade_cancelled', trade);

    logger.info(`Trade cancelled: ${trade.tradeId}`);

    return {
      success: true,
      trade,
    };
  } catch (error) {
    await session.abortTransaction();
    logger.error('Error cancelling trade:', error);
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Raise a dispute
 * @param {String} tradeId - Trade ID
 * @param {String} userId - User raising dispute
 * @param {String} reason - Dispute reason
 * @returns {Object} Updated trade
 */
const raiseDispute = async (tradeId, userId, reason) => {
  try {
    const trade = await Trade.findById(tradeId);
    if (!trade) {
      throw new Error('Trade not found');
    }

    // Verify user is part of trade
    if (trade.buyer.toString() !== userId && trade.seller.toString() !== userId) {
      throw new Error('You are not part of this trade');
    }

    await trade.raiseDispute(userId, reason);

    // Notify admins
    await notificationService.notifyAdmins('dispute_raised', {
      tradeId: trade._id,
      tradeIdStr: trade.tradeId,
      raisedBy: userId,
      reason,
    });

    // Notify both parties
    await notificationService.sendTradeNotification(trade.buyer, 'dispute_raised', trade);
    await notificationService.sendTradeNotification(trade.seller, 'dispute_raised', trade);

    logger.info(`Dispute raised for trade: ${trade.tradeId}`);

    return {
      success: true,
      trade,
    };
  } catch (error) {
    logger.error('Error raising dispute:', error);
    throw error;
  }
};

/**
 * Resolve a dispute (admin only)
 * @param {String} tradeId - Trade ID
 * @param {String} adminId - Admin ID
 * @param {String} resolution - Resolution description
 * @param {String} winnerId - Winner user ID (null for cancellation)
 * @returns {Object} Updated trade
 */
const resolveDispute = async (tradeId, adminId, resolution, winnerId = null) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const trade = await Trade.findById(tradeId).session(session);
    if (!trade) {
      throw new Error('Trade not found');
    }

    if (winnerId) {
      // Winner gets the USDT
      if (winnerId === trade.buyer.toString()) {
        // Buyer wins - transfer USDT to buyer
        await walletService.deductLockedAmount(trade.seller, CURRENCIES.USDT, trade.amount, session);
        await walletService.addBalance(trade.buyer, CURRENCIES.USDT, trade.amount, session);
      } else {
        // Seller wins - unlock USDT back to seller
        await walletService.unlockAmount(trade.seller, CURRENCIES.USDT, trade.amount, session);
      }
    } else {
      // No winner - unlock USDT back to seller
      await walletService.unlockAmount(trade.seller, CURRENCIES.USDT, trade.amount, session);
    }

    await trade.resolveDispute(adminId, resolution, winnerId);

    await session.commitTransaction();

    // Notify both parties
    await notificationService.sendTradeNotification(trade.buyer, 'dispute_resolved', trade);
    await notificationService.sendTradeNotification(trade.seller, 'dispute_resolved', trade);

    logger.info(`Dispute resolved for trade: ${trade.tradeId}`);

    return {
      success: true,
      trade,
    };
  } catch (error) {
    await session.abortTransaction();
    logger.error('Error resolving dispute:', error);
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Get order book
 * @param {String} type - Order type (buy/sell)
 * @returns {Array} Order book
 */
const getOrderBook = async (type) => {
  return Order.getOrderBook(type);
};

/**
 * Auto-cancel expired trades
 */
const autoCancelExpiredTrades = async () => {
  try {
    const expiredTrades = await Trade.find({
      status: TRADE_STATUS.PENDING,
      paymentWindowExpiresAt: { $lt: new Date() },
    });

    for (const trade of expiredTrades) {
      try {
        await cancelTrade(trade._id, null, 'Payment window expired');
        logger.info(`Auto-cancelled expired trade: ${trade.tradeId}`);
      } catch (error) {
        logger.error(`Error auto-cancelling trade ${trade.tradeId}:`, error);
      }
    }

    return expiredTrades.length;
  } catch (error) {
    logger.error('Error in auto-cancel expired trades:', error);
    throw error;
  }
};

module.exports = {
  findMatchingOrders,
  acceptOrder,
  confirmPayment,
  confirmRelease,
  cancelTrade,
  raiseDispute,
  resolveDispute,
  getOrderBook,
  autoCancelExpiredTrades,
};
