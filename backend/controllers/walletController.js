const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const { asyncHandler, APIError } = require('../middleware/errorHandler');
const { ERROR_CODES } = require('../utils/constants');
const walletService = require('../services/walletService');
const logger = require('../utils/logger');

/**
 * Wallet Controller - Handles wallet operations
 */

/**
 * Get wallet balance
 * GET /api/wallet/balance
 */
const getBalance = asyncHandler(async (req, res) => {
  const userId = req.userId;

  const balance = await walletService.getWalletBalance(userId);

  res.json({
    success: true,
    data: balance,
  });
});

/**
 * Get transaction history
 * GET /api/wallet/transactions
 */
const getTransactions = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { page = 1, limit = 20, type, status, currency, startDate, endDate } = req.query;

  const result = await Transaction.getUserTransactions(userId, {
    page: parseInt(page),
    limit: parseInt(limit),
    type,
    status,
    currency,
    startDate,
    endDate,
  });

  res.json({
    success: true,
    data: result,
  });
});

/**
 * Get transaction by ID
 * GET /api/wallet/transaction/:id
 */
const getTransactionById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  const transaction = await Transaction.findOne({
    _id: id,
    user: userId,
  });

  if (!transaction) {
    throw new APIError('Transaction not found', 404, ERROR_CODES.NOT_FOUND);
  }

  res.json({
    success: true,
    data: transaction,
  });
});

/**
 * Get wallet summary/stats
 * GET /api/wallet/summary
 */
const getWalletSummary = asyncHandler(async (req, res) => {
  const userId = req.userId;

  const wallet = await Wallet.findOne({ user: userId });
  
  // Get transaction stats
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  const [depositStats, withdrawalStats, tradeStats] = await Promise.all([
    Transaction.aggregate([
      {
        $match: {
          user: new require('mongoose').Types.ObjectId(userId),
          type: 'deposit',
          status: 'completed',
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: '$currency',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]),
    Transaction.aggregate([
      {
        $match: {
          user: new require('mongoose').Types.ObjectId(userId),
          type: 'withdrawal',
          status: 'completed',
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: '$currency',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]),
    Transaction.aggregate([
      {
        $match: {
          user: new require('mongoose').Types.ObjectId(userId),
          type: 'trade',
          status: 'completed',
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: '$currency',
          totalVolume: { $sum: { $abs: '$amount' } },
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  res.json({
    success: true,
    data: {
      balance: wallet ? {
        USDT: wallet.balances.USDT,
        INR: wallet.balances.INR,
      } : null,
      last30Days: {
        deposits: depositStats,
        withdrawals: withdrawalStats,
        trades: tradeStats,
      },
    },
  });
});

module.exports = {
  getBalance,
  getTransactions,
  getTransactionById,
  getWalletSummary,
};
