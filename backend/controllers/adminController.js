const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Order = require('../models/Order');
const Trade = require('../models/Trade');
const KYCVerification = require('../models/KYCVerification');
const DepositWithdrawal = require('../models/DepositWithdrawal');
const Referral = require('../models/Referral');
const AdminLog = require('../models/AdminLog');
const { asyncHandler, APIError } = require('../middleware/errorHandler');
const { ERROR_CODES, KYC_STATUS, DW_STATUS, USER_ROLES } = require('../utils/constants');
const walletService = require('../services/walletService');
const orderMatchingService = require('../services/orderMatchingService');
const notificationService = require('../services/notificationService');
const { emitToUser } = require('../config/socket');
const logger = require('../utils/logger');

/**
 * Admin Controller - Handles admin operations
 */

// ==================== USER MANAGEMENT ====================

/**
 * Get all users
 * GET /api/admin/users
 */
const getUsers = asyncHandler(async (req, res) => {
  const { search, status, kycStatus, page = 1, limit = 20 } = req.query;

  const query = {};
  if (search) {
    query.$or = [
      { email: { $regex: search, $options: 'i' } },
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
    ];
  }
  if (status === 'active') query.isActive = true;
  if (status === 'inactive') query.isActive = false;
  if (status === 'banned') query.isBanned = true;
  if (kycStatus) query.kycStatus = kycStatus;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [users, total] = await Promise.all([
    User.find(query)
      .select('-password -refreshTokens -twoFactorSecret')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    User.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    },
  });
});

/**
 * Get user by ID
 * GET /api/admin/users/:id
 */
const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id)
    .select('-password -refreshTokens -twoFactorSecret');

  if (!user) {
    throw new APIError('User not found', 404, ERROR_CODES.NOT_FOUND);
  }

  // Get user's wallet
  const wallet = await Wallet.findOne({ user: id });

  // Get user's KYC
  const kyc = await KYCVerification.findOne({ user: id });

  res.json({
    success: true,
    data: {
      user,
      wallet,
      kyc,
    },
  });
});

/**
 * Update user status (ban/unban)
 * PUT /api/admin/users/:id/status
 */
const updateUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isActive, isBanned, banReason } = req.body;
  const adminId = req.userId;

  const user = await User.findById(id);
  if (!user) {
    throw new APIError('User not found', 404, ERROR_CODES.NOT_FOUND);
  }

  // Prevent banning admins
  if (isBanned && (user.role === USER_ROLES.ADMIN || user.role === USER_ROLES.SUPERADMIN)) {
    throw new APIError('Cannot ban admin users', 403, ERROR_CODES.FORBIDDEN);
  }

  const previousValues = { isActive: user.isActive, isBanned: user.isBanned };

  if (isActive !== undefined) user.isActive = isActive;
  if (isBanned !== undefined) {
    user.isBanned = isBanned;
    user.banReason = isBanned ? banReason : null;
  }

  await user.save();

  // Log admin action
  await AdminLog.logAction({
    admin: adminId,
    action: isBanned ? 'BAN_USER' : isActive === false ? 'DEACTIVATE_USER' : 'UPDATE_USER_STATUS',
    entityType: 'user',
    entityId: id,
    description: `Updated user status for ${user.email}`,
    previousValues,
    newValues: { isActive: user.isActive, isBanned: user.isBanned },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  // Notify user
  emitToUser(id, 'account:status_changed', {
    isActive: user.isActive,
    isBanned: user.isBanned,
    banReason: user.banReason,
  });

  logger.info(`User status updated: ${id} by admin ${adminId}`);

  res.json({
    success: true,
    message: 'User status updated successfully',
    data: user,
  });
});

// ==================== KYC MANAGEMENT ====================

/**
 * Get pending KYC verifications
 * GET /api/admin/kyc/pending
 */
const getPendingKYC = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const result = await KYCVerification.getPendingKYCs({
    page: parseInt(page),
    limit: parseInt(limit),
  });

  res.json({
    success: true,
    data: result,
  });
});

/**
 * Verify KYC
 * POST /api/admin/kyc/:id/verify
 */
const verifyKYC = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, reason, notes } = req.body;
  const adminId = req.userId;

  const kyc = await KYCVerification.findById(id);
  if (!kyc) {
    throw new APIError('KYC record not found', 404, ERROR_CODES.NOT_FOUND);
  }

  if (status === 'verified') {
    await kyc.approve(adminId, notes);
  } else if (status === 'rejected') {
    if (!reason) {
      throw new APIError('Rejection reason is required', 400, ERROR_CODES.VALIDATION_ERROR);
    }
    await kyc.reject(adminId, reason, notes);
  }

  // Log admin action
  await AdminLog.logAction({
    admin: adminId,
    action: status === 'verified' ? 'VERIFY_KYC' : 'REJECT_KYC',
    entityType: 'kyc',
    entityId: id,
    description: `${status === 'verified' ? 'Approved' : 'Rejected'} KYC for user ${kyc.user}`,
    newValues: { status, reason, notes },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  // Notify user
  const user = await User.findById(kyc.user);
  sendKYCStatusEmail(user.email, user.firstName, status, reason);

  emitToUser(kyc.user.toString(), 'kyc:status_changed', {
    status,
    reason,
  });

  logger.info(`KYC ${status}: ${id} by admin ${adminId}`);

  res.json({
    success: true,
    message: `KYC ${status === 'verified' ? 'approved' : 'rejected'} successfully`,
    data: kyc,
  });
});

// ==================== ORDER MANAGEMENT ====================

/**
 * Get all orders
 * GET /api/admin/orders
 */
const getOrders = asyncHandler(async (req, res) => {
  const { status, type, page = 1, limit = 20 } = req.query;

  const query = {};
  if (status) query.status = status;
  if (type) query.type = type;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [orders, total] = await Promise.all([
    Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'firstName lastName email')
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
      },
    },
  });
});

// ==================== TRADE MANAGEMENT ====================

/**
 * Get all trades
 * GET /api/admin/trades
 */
const getTrades = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;

  const query = {};
  if (status) query.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [trades, total] = await Promise.all([
    Trade.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('maker', 'firstName lastName email')
      .populate('taker', 'firstName lastName email')
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
      },
    },
  });
});

/**
 * Resolve trade dispute
 * POST /api/admin/trades/:id/resolve
 */
const resolveDispute = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { resolution, winnerId } = req.body;
  const adminId = req.userId;

  const result = await orderMatchingService.resolveDispute(id, adminId, resolution, winnerId);

  // Log admin action
  await AdminLog.logAction({
    admin: adminId,
    action: 'RESOLVE_DISPUTE',
    entityType: 'trade',
    entityId: id,
    description: `Resolved dispute for trade ${id}`,
    newValues: { resolution, winnerId },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  logger.info(`Dispute resolved: ${id} by admin ${adminId}`);

  res.json({
    success: true,
    message: 'Dispute resolved successfully',
    data: result.trade,
  });
});

// ==================== DEPOSIT/WITHDRAWAL MANAGEMENT ====================

/**
 * Get pending deposits
 * GET /api/admin/deposits
 */
const getPendingDeposits = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const result = await DepositWithdrawal.getPendingRequests('deposit', {
    page: parseInt(page),
    limit: parseInt(limit),
  });

  res.json({
    success: true,
    data: result,
  });
});

/**
 * Approve deposit
 * POST /api/admin/deposits/:id/approve
 */
const approveDeposit = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { notes } = req.body;
  const adminId = req.userId;

  const deposit = await DepositWithdrawal.findById(id);
  if (!deposit) {
    throw new APIError('Deposit not found', 404, ERROR_CODES.NOT_FOUND);
  }

  if (deposit.status !== DW_STATUS.PENDING) {
    throw new APIError('Deposit is not pending', 400, ERROR_CODES.INVALID_OPERATION);
  }

  // Process deposit
  const { transaction } = await walletService.processDeposit(
    deposit.user,
    deposit.currency,
    deposit.amount,
    {
      depositWithdrawId: deposit._id,
      upiTransactionId: deposit.upiTransactionId,
    }
  );

  // Update deposit status
  await deposit.approve(adminId, notes);
  await deposit.complete(transaction._id);

  // Log admin action
  await AdminLog.logAction({
    admin: adminId,
    action: 'APPROVE_DEPOSIT',
    entityType: 'deposit',
    entityId: id,
    description: `Approved deposit ${deposit.requestId}`,
    newValues: { status: DW_STATUS.COMPLETED },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  // Notify user
  await notificationService.sendDepositWithdrawalNotification(
    deposit.user,
    'deposit',
    deposit
  );

  emitToUser(deposit.user.toString(), 'deposit:completed', {
    requestId: deposit.requestId,
    amount: deposit.amount,
  });

  logger.info(`Deposit approved: ${id} by admin ${adminId}`);

  res.json({
    success: true,
    message: 'Deposit approved successfully',
    data: deposit,
  });
});

/**
 * Reject deposit
 * POST /api/admin/deposits/:id/reject
 */
const rejectDeposit = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const adminId = req.userId;

  const deposit = await DepositWithdrawal.findById(id);
  if (!deposit) {
    throw new APIError('Deposit not found', 404, ERROR_CODES.NOT_FOUND);
  }

  await deposit.reject(adminId, reason);

  // Log admin action
  await AdminLog.logAction({
    admin: adminId,
    action: 'REJECT_DEPOSIT',
    entityType: 'deposit',
    entityId: id,
    description: `Rejected deposit ${deposit.requestId}`,
    newValues: { status: DW_STATUS.REJECTED, reason },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  // Notify user
  emitToUser(deposit.user.toString(), 'deposit:rejected', {
    requestId: deposit.requestId,
    reason,
  });

  logger.info(`Deposit rejected: ${id} by admin ${adminId}`);

  res.json({
    success: true,
    message: 'Deposit rejected',
    data: deposit,
  });
});

/**
 * Get pending withdrawals
 * GET /api/admin/withdrawals
 */
const getPendingWithdrawals = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const result = await DepositWithdrawal.getPendingRequests('withdrawal', {
    page: parseInt(page),
    limit: parseInt(limit),
  });

  res.json({
    success: true,
    data: result,
  });
});

/**
 * Approve withdrawal
 * POST /api/admin/withdrawals/:id/approve
 */
const approveWithdrawal = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { notes } = req.body;
  const adminId = req.userId;

  const withdrawal = await DepositWithdrawal.findById(id);
  if (!withdrawal) {
    throw new APIError('Withdrawal not found', 404, ERROR_CODES.NOT_FOUND);
  }

  if (withdrawal.status !== DW_STATUS.PENDING) {
    throw new APIError('Withdrawal is not pending', 400, ERROR_CODES.INVALID_OPERATION);
  }

  // Deduct locked amount
  const totalDeduction = withdrawal.amount + withdrawal.fee;
  await walletService.deductLockedAmount(
    withdrawal.user,
    withdrawal.currency,
    totalDeduction
  );

  // Create transaction record
  const { transaction } = await walletService.processWithdrawal(
    withdrawal.user,
    withdrawal.currency,
    withdrawal.amount,
    withdrawal.fee,
    {
      depositWithdrawId: withdrawal._id,
      bankDetailId: withdrawal.bankDetail,
    }
  );

  // Update withdrawal status
  await withdrawal.approve(adminId, notes);
  await withdrawal.complete(transaction._id);

  // Log admin action
  await AdminLog.logAction({
    admin: adminId,
    action: 'APPROVE_WITHDRAWAL',
    entityType: 'withdrawal',
    entityId: id,
    description: `Approved withdrawal ${withdrawal.requestId}`,
    newValues: { status: DW_STATUS.COMPLETED },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  // Notify user
  await notificationService.sendDepositWithdrawalNotification(
    withdrawal.user,
    'withdrawal',
    withdrawal
  );

  emitToUser(withdrawal.user.toString(), 'withdrawal:completed', {
    requestId: withdrawal.requestId,
    amount: withdrawal.amount,
  });

  logger.info(`Withdrawal approved: ${id} by admin ${adminId}`);

  res.json({
    success: true,
    message: 'Withdrawal approved successfully',
    data: withdrawal,
  });
});

/**
 * Reject withdrawal
 * POST /api/admin/withdrawals/:id/reject
 */
const rejectWithdrawal = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const adminId = req.userId;

  const withdrawal = await DepositWithdrawal.findById(id);
  if (!withdrawal) {
    throw new APIError('Withdrawal not found', 404, ERROR_CODES.NOT_FOUND);
  }

  // Unlock the locked amount
  const totalDeduction = withdrawal.amount + withdrawal.fee;
  await walletService.unlockAmount(
    withdrawal.user,
    withdrawal.currency,
    totalDeduction
  );

  await withdrawal.reject(adminId, reason);

  // Log admin action
  await AdminLog.logAction({
    admin: adminId,
    action: 'REJECT_WITHDRAWAL',
    entityType: 'withdrawal',
    entityId: id,
    description: `Rejected withdrawal ${withdrawal.requestId}`,
    newValues: { status: DW_STATUS.REJECTED, reason },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  // Notify user
  emitToUser(withdrawal.user.toString(), 'withdrawal:rejected', {
    requestId: withdrawal.requestId,
    reason,
  });

  logger.info(`Withdrawal rejected: ${id} by admin ${adminId}`);

  res.json({
    success: true,
    message: 'Withdrawal rejected',
    data: withdrawal,
  });
});

// ==================== WALLET MANAGEMENT ====================

/**
 * Get user wallet
 * GET /api/admin/wallets/:userId
 */
const getUserWallet = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const wallet = await Wallet.findOne({ user: userId });
  if (!wallet) {
    throw new APIError('Wallet not found', 404, ERROR_CODES.NOT_FOUND);
  }

  res.json({
    success: true,
    data: wallet,
  });
});

/**
 * Adjust wallet balance
 * POST /api/admin/wallets/:userId/adjust
 */
const adjustWallet = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { currency, amount, reason } = req.body;
  const adminId = req.userId;

  const { wallet, transaction } = await walletService.adjustBalance(
    userId,
    currency,
    parseFloat(amount),
    reason,
    adminId
  );

  // Log admin action
  await AdminLog.logAction({
    admin: adminId,
    action: 'ADJUST_WALLET',
    entityType: 'wallet',
    entityId: userId,
    description: `Adjusted wallet balance for user ${userId}`,
    newValues: { currency, amount, reason },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  // Notify user
  emitToUser(userId, 'wallet:balance_adjusted', {
    currency,
    amount,
    reason,
    newBalance: wallet.balances[currency].available,
  });

  logger.info(`Wallet adjusted: ${userId} by admin ${adminId}`);

  res.json({
    success: true,
    message: 'Wallet balance adjusted successfully',
    data: { wallet, transaction },
  });
});

// ==================== REFERRAL MANAGEMENT ====================

/**
 * Get referral statistics
 * GET /api/admin/referrals
 */
const getReferralStats = asyncHandler(async (req, res) => {
  const stats = await Referral.aggregate([
    {
      $group: {
        _id: '$level',
        totalReferrals: { $sum: 1 },
        totalVolume: { $sum: '$totalVolume' },
        totalBonus: { $sum: '$totalBonusEarned' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const totalUsersReferred = await Referral.distinct('referred').length;
  const totalReferrers = await Referral.distinct('referrer').length;

  res.json({
    success: true,
    data: {
      byLevel: stats,
      totalUsersReferred,
      totalReferrers,
    },
  });
});

// ==================== DASHBOARD STATS ====================

/**
 * Get dashboard statistics
 * GET /api/admin/stats
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalUsers,
    newUsersToday,
    pendingKYC,
    activeOrders,
    pendingTrades,
    pendingDeposits,
    pendingWithdrawals,
    totalVolume30Days,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ createdAt: { $gte: today } }),
    KYCVerification.countDocuments({ status: KYC_STATUS.PENDING }),
    Order.countDocuments({ status: 'active' }),
    Trade.countDocuments({ status: { $in: ['pending', 'paid', 'disputed'] } }),
    DepositWithdrawal.countDocuments({ type: 'deposit', status: DW_STATUS.PENDING }),
    DepositWithdrawal.countDocuments({ type: 'withdrawal', status: DW_STATUS.PENDING }),
    Trade.aggregate([
      {
        $match: {
          status: 'completed',
          completedAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: null,
          totalVolume: { $sum: '$amount' },
          totalTrades: { $sum: 1 },
        },
      },
    ]),
  ]);

  res.json({
    success: true,
    data: {
      users: {
        total: totalUsers,
        newToday: newUsersToday,
      },
      kyc: {
        pending: pendingKYC,
      },
      orders: {
        active: activeOrders,
      },
      trades: {
        pending: pendingTrades,
      },
      deposits: {
        pending: pendingDeposits,
      },
      withdrawals: {
        pending: pendingWithdrawals,
      },
      volume30Days: totalVolume30Days[0] || { totalVolume: 0, totalTrades: 0 },
    },
  });
});

// ==================== ADMIN LOGS ====================

/**
 * Get admin logs
 * GET /api/admin/logs
 */
const getAdminLogs = asyncHandler(async (req, res) => {
  const { admin, action, entityType, page = 1, limit = 50 } = req.query;

  const filters = {};
  if (admin) filters.admin = admin;
  if (action) filters.action = action;
  if (entityType) filters.entityType = entityType;

  const result = await AdminLog.getAllLogs(filters, {
    page: parseInt(page),
    limit: parseInt(limit),
  });

  res.json({
    success: true,
    data: result,
  });
});

module.exports = {
  // User Management
  getUsers,
  getUserById,
  updateUserStatus,
  
  // KYC Management
  getPendingKYC,
  verifyKYC,
  
  // Order Management
  getOrders,
  
  // Trade Management
  getTrades,
  resolveDispute,
  
  // Deposit/Withdrawal Management
  getPendingDeposits,
  approveDeposit,
  rejectDeposit,
  getPendingWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
  
  // Wallet Management
  getUserWallet,
  adjustWallet,
  
  // Referral Management
  getReferralStats,
  
  // Dashboard
  getDashboardStats,
  
  // Logs
  getAdminLogs,
};
