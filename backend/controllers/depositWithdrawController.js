const DepositWithdrawal = require('../models/DepositWithdrawal');
const BankDetail = require('../models/BankDetail');
const { asyncHandler, APIError } = require('../middleware/errorHandler');
const { ERROR_CODES, DW_STATUS, TRANSACTION_TYPES, CURRENCIES } = require('../utils/constants');
const walletService = require('../services/walletService');
const notificationService = require('../services/notificationService');
const { emitToUser } = require('../config/socket');
const logger = require('../utils/logger');
const cloudinary = require('cloudinary').v2;

/**
 * Deposit/Withdrawal Controller - Handles deposit and withdrawal operations
 */

/**
 * Deposit INR via UPI
 * POST /api/deposit/upi
 */
const depositUPI = asyncHandler(async (req, res) => {
  const { amount, upiTransactionId } = req.body;
  const userId = req.userId;

  // Handle screenshot upload if provided
  let upiScreenshot = null;
  if (req.file) {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'deposits/screenshots',
    });
    upiScreenshot = result.secure_url;
  }

  // Create deposit request
  const deposit = await DepositWithdrawal.create({
    user: userId,
    type: TRANSACTION_TYPES.DEPOSIT,
    currency: CURRENCIES.INR,
    amount: parseFloat(amount),
    fee: 0,
    paymentMethod: 'upi',
    upiTransactionId,
    upiScreenshot,
    status: DW_STATUS.PENDING,
    metadata: {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    },
  });

  // Notify admins
  await notificationService.notifyAdmins('deposit_request', {
    depositId: deposit._id,
    requestId: deposit.requestId,
    userId,
    amount,
  });

  logger.info(`Deposit request created: ${deposit.requestId} by user ${userId}`);

  res.status(201).json({
    success: true,
    message: 'Deposit request submitted. It will be processed after verification.',
    data: {
      requestId: deposit.requestId,
      amount: deposit.amount,
      status: deposit.status,
      createdAt: deposit.createdAt,
    },
  });
});

/**
 * Withdraw INR to bank account
 * POST /api/withdraw/bank
 */
const withdrawBank = asyncHandler(async (req, res) => {
  const { amount, bankDetailId } = req.body;
  const userId = req.userId;

  // Verify bank account belongs to user
  const bankDetail = await BankDetail.findOne({
    _id: bankDetailId,
    user: userId,
    isActive: true,
  });

  if (!bankDetail) {
    throw new APIError('Bank account not found', 404, ERROR_CODES.NOT_FOUND);
  }

  // Check if user has sufficient balance
  const wallet = await walletService.getOrCreateWallet(userId);
  if (wallet.balances.INR.available < parseFloat(amount)) {
    throw new APIError('Insufficient INR balance', 400, ERROR_CODES.INSUFFICIENT_BALANCE);
  }

  // Calculate fee (example: 0.5% with min 10 INR)
  const fee = Math.max(parseFloat(amount) * 0.005, 10);

  // Create withdrawal request
  const withdrawal = await DepositWithdrawal.create({
    user: userId,
    type: TRANSACTION_TYPES.WITHDRAWAL,
    currency: CURRENCIES.INR,
    amount: parseFloat(amount),
    fee,
    paymentMethod: 'bank_transfer',
    bankDetail: bankDetailId,
    status: DW_STATUS.PENDING,
    metadata: {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    },
  });

  // Lock the withdrawal amount
  await walletService.lockAmount(userId, CURRENCIES.INR, parseFloat(amount) + fee);

  // Notify admins
  await notificationService.notifyAdmins('withdrawal_request', {
    withdrawalId: withdrawal._id,
    requestId: withdrawal.requestId,
    userId,
    amount,
    fee,
  });

  logger.info(`Withdrawal request created: ${withdrawal.requestId} by user ${userId}`);

  res.status(201).json({
    success: true,
    message: 'Withdrawal request submitted. It will be processed after approval.',
    data: {
      requestId: withdrawal.requestId,
      amount: withdrawal.amount,
      fee: withdrawal.fee,
      netAmount: withdrawal.netAmount,
      status: withdrawal.status,
      createdAt: withdrawal.createdAt,
    },
  });
});

/**
 * Deposit USDT (blockchain - placeholder)
 * POST /api/deposit/usdt
 */
const depositUSDT = asyncHandler(async (req, res) => {
  const { amount, blockchainNetwork, txHash } = req.body;
  const userId = req.userId;

  // Create deposit request
  const deposit = await DepositWithdrawal.create({
    user: userId,
    type: TRANSACTION_TYPES.DEPOSIT,
    currency: CURRENCIES.USDT,
    amount: parseFloat(amount),
    fee: 0,
    paymentMethod: 'blockchain',
    blockchainNetwork,
    blockchainTxHash: txHash,
    status: DW_STATUS.PENDING,
    metadata: {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    },
  });

  logger.info(`USDT deposit request created: ${deposit.requestId} by user ${userId}`);

  res.status(201).json({
    success: true,
    message: 'USDT deposit request submitted. It will be credited after blockchain confirmation.',
    data: {
      requestId: deposit.requestId,
      amount: deposit.amount,
      status: deposit.status,
      createdAt: deposit.createdAt,
    },
  });
});

/**
 * Withdraw USDT (blockchain - placeholder)
 * POST /api/withdraw/usdt
 */
const withdrawUSDT = asyncHandler(async (req, res) => {
  const { amount, blockchainNetwork, walletAddress } = req.body;
  const userId = req.userId;

  // Check if user has sufficient balance
  const wallet = await walletService.getOrCreateWallet(userId);
  if (wallet.balances.USDT.available < parseFloat(amount)) {
    throw new APIError('Insufficient USDT balance', 400, ERROR_CODES.INSUFFICIENT_BALANCE);
  }

  // Calculate fee (example: 1 USDT)
  const fee = 1;

  // Create withdrawal request
  const withdrawal = await DepositWithdrawal.create({
    user: userId,
    type: TRANSACTION_TYPES.WITHDRAWAL,
    currency: CURRENCIES.USDT,
    amount: parseFloat(amount),
    fee,
    paymentMethod: 'blockchain',
    blockchainNetwork,
    walletAddress,
    status: DW_STATUS.PENDING,
    metadata: {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    },
  });

  // Lock the withdrawal amount
  await walletService.lockAmount(userId, CURRENCIES.USDT, parseFloat(amount) + fee);

  logger.info(`USDT withdrawal request created: ${withdrawal.requestId} by user ${userId}`);

  res.status(201).json({
    success: true,
    message: 'USDT withdrawal request submitted. It will be processed after approval.',
    data: {
      requestId: withdrawal.requestId,
      amount: withdrawal.amount,
      fee: withdrawal.fee,
      netAmount: withdrawal.netAmount,
      status: withdrawal.status,
      createdAt: withdrawal.createdAt,
    },
  });
});

/**
 * Get deposit/withdrawal history
 * GET /api/deposit-withdraw/history
 */
const getHistory = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { type, page = 1, limit = 20 } = req.query;

  const result = await DepositWithdrawal.getUserRequests(userId, {
    type,
    page: parseInt(page),
    limit: parseInt(limit),
  });

  res.json({
    success: true,
    data: result,
  });
});

/**
 * Get request by ID
 * GET /api/deposit-withdraw/:id
 */
const getRequestById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  const request = await DepositWithdrawal.findOne({
    _id: id,
    user: userId,
  }).populate('bankDetail', 'accountNumber bankName ifscCode');

  if (!request) {
    throw new APIError('Request not found', 404, ERROR_CODES.NOT_FOUND);
  }

  res.json({
    success: true,
    data: request,
  });
});

module.exports = {
  depositUPI,
  withdrawBank,
  depositUSDT,
  withdrawUSDT,
  getHistory,
  getRequestById,
};
