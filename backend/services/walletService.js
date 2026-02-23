const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const { TRANSACTION_TYPES, TRANSACTION_STATUS, CURRENCIES } = require('../utils/constants');
const logger = require('../utils/logger');

/**
 * Wallet Service - Handles all wallet operations
 */

/**
 * Get or create wallet for user
 * @param {String} userId - User ID
 * @returns {Object} Wallet document
 */
const getOrCreateWallet = async (userId) => {
  return Wallet.getOrCreate(userId);
};

/**
 * Get wallet balance
 * @param {String} userId - User ID
 * @returns {Object} Wallet balance
 */
const getWalletBalance = async (userId) => {
  const wallet = await getOrCreateWallet(userId);
  return {
    USDT: wallet.balances.USDT,
    INR: wallet.balances.INR,
    lastUpdated: wallet.lastUpdated,
  };
};

/**
 * Lock amount for trade
 * @param {String} userId - User ID
 * @param {String} currency - Currency to lock
 * @param {Number} amount - Amount to lock
 * @param {Object} session - MongoDB session for transaction
 * @returns {Object} Updated wallet
 */
const lockAmount = async (userId, currency, amount, session = null) => {
  const options = session ? { session } : {};
  
  const wallet = await Wallet.findOne({ user: userId }, null, options);
  if (!wallet) {
    throw new Error('Wallet not found');
  }

  if (wallet.balances[currency].available < amount) {
    throw new Error(`Insufficient ${currency} balance`);
  }

  wallet.balances[currency].available -= amount;
  wallet.balances[currency].locked += amount;
  wallet.lastUpdated = new Date();

  await wallet.save(options);
  return wallet;
};

/**
 * Unlock amount
 * @param {String} userId - User ID
 * @param {String} currency - Currency to unlock
 * @param {Number} amount - Amount to unlock
 * @param {Object} session - MongoDB session for transaction
 * @returns {Object} Updated wallet
 */
const unlockAmount = async (userId, currency, amount, session = null) => {
  const options = session ? { session } : {};
  
  const wallet = await Wallet.findOne({ user: userId }, null, options);
  if (!wallet) {
    throw new Error('Wallet not found');
  }

  if (wallet.balances[currency].locked < amount) {
    throw new Error(`Insufficient locked ${currency} balance`);
  }

  wallet.balances[currency].locked -= amount;
  wallet.balances[currency].available += amount;
  wallet.lastUpdated = new Date();

  await wallet.save(options);
  return wallet;
};

/**
 * Deduct locked amount (for completed trades)
 * @param {String} userId - User ID
 * @param {String} currency - Currency to deduct
 * @param {Number} amount - Amount to deduct
 * @param {Object} session - MongoDB session for transaction
 * @returns {Object} Updated wallet
 */
const deductLockedAmount = async (userId, currency, amount, session = null) => {
  const options = session ? { session } : {};
  
  const wallet = await Wallet.findOne({ user: userId }, null, options);
  if (!wallet) {
    throw new Error('Wallet not found');
  }

  if (wallet.balances[currency].locked < amount) {
    throw new Error(`Insufficient locked ${currency} balance`);
  }

  wallet.balances[currency].locked -= amount;
  wallet.balances[currency].total -= amount;
  wallet.lastUpdated = new Date();

  await wallet.save(options);
  return wallet;
};

/**
 * Add balance to wallet
 * @param {String} userId - User ID
 * @param {String} currency - Currency to add
 * @param {Number} amount - Amount to add
 * @param {Object} session - MongoDB session for transaction
 * @returns {Object} Updated wallet
 */
const addBalance = async (userId, currency, amount, session = null) => {
  const options = session ? { session } : {};
  
  const wallet = await Wallet.findOne({ user: userId }, null, options);
  if (!wallet) {
    throw new Error('Wallet not found');
  }

  wallet.balances[currency].available += amount;
  wallet.lastUpdated = new Date();

  await wallet.save(options);
  return wallet;
};

/**
 * Deduct balance from wallet
 * @param {String} userId - User ID
 * @param {String} currency - Currency to deduct
 * @param {Number} amount - Amount to deduct
 * @param {Object} session - MongoDB session for transaction
 * @returns {Object} Updated wallet
 */
const deductBalance = async (userId, currency, amount, session = null) => {
  const options = session ? { session } : {};
  
  const wallet = await Wallet.findOne({ user: userId }, null, options);
  if (!wallet) {
    throw new Error('Wallet not found');
  }

  if (wallet.balances[currency].available < amount) {
    throw new Error(`Insufficient ${currency} balance`);
  }

  wallet.balances[currency].available -= amount;
  wallet.lastUpdated = new Date();

  await wallet.save(options);
  return wallet;
};

/**
 * Create transaction record
 * @param {Object} data - Transaction data
 * @param {Object} session - MongoDB session for transaction
 * @returns {Object} Created transaction
 */
const createTransaction = async (data, session = null) => {
  const options = session ? { session } : {};
  
  const transaction = new Transaction({
    ...data,
    status: data.status || TRANSACTION_STATUS.COMPLETED,
  });

  await transaction.save(options);
  return transaction;
};

/**
 * Process deposit
 * @param {String} userId - User ID
 * @param {String} currency - Currency
 * @param {Number} amount - Amount
 * @param {Object} metadata - Additional metadata
 * @param {Object} session - MongoDB session
 * @returns {Object} Result with wallet and transaction
 */
const processDeposit = async (userId, currency, amount, metadata = {}, session = null) => {
  const wallet = await addBalance(userId, currency, amount, session);
  
  const balanceBefore = wallet.balances[currency].available - amount;
  
  const transaction = await createTransaction({
    user: userId,
    type: TRANSACTION_TYPES.DEPOSIT,
    currency,
    amount,
    fee: 0,
    netAmount: amount,
    balanceBefore,
    balanceAfter: wallet.balances[currency].available,
    description: `Deposit of ${amount} ${currency}`,
    metadata,
    status: TRANSACTION_STATUS.COMPLETED,
  }, session);

  return { wallet, transaction };
};

/**
 * Process withdrawal
 * @param {String} userId - User ID
 * @param {String} currency - Currency
 * @param {Number} amount - Amount
 * @param {Number} fee - Withdrawal fee
 * @param {Object} metadata - Additional metadata
 * @param {Object} session - MongoDB session
 * @returns {Object} Result with wallet and transaction
 */
const processWithdrawal = async (userId, currency, amount, fee = 0, metadata = {}, session = null) => {
  const totalDeduction = amount + fee;
  const wallet = await deductBalance(userId, currency, totalDeduction, session);
  
  const balanceBefore = wallet.balances[currency].available + totalDeduction;
  
  const transaction = await createTransaction({
    user: userId,
    type: TRANSACTION_TYPES.WITHDRAWAL,
    currency,
    amount,
    fee,
    netAmount: amount,
    balanceBefore,
    balanceAfter: wallet.balances[currency].available,
    description: `Withdrawal of ${amount} ${currency}`,
    metadata,
    status: TRANSACTION_STATUS.COMPLETED,
  }, session);

  return { wallet, transaction };
};

/**
 * Process trade transfer
 * @param {String} fromUserId - Sender user ID
 * @param {String} toUserId - Receiver user ID
 * @param {String} currency - Currency
 * @param {Number} amount - Amount
 * @param {Object} tradeData - Trade related data
 * @param {Object} session - MongoDB session
 * @returns {Object} Result with transactions
 */
const processTradeTransfer = async (fromUserId, toUserId, currency, amount, tradeData, session = null) => {
  // Deduct from sender
  const fromWallet = await deductLockedAmount(fromUserId, currency, amount, session);
  
  const fromBalanceBefore = fromWallet.balances[currency].available + fromWallet.balances[currency].locked;
  
  const fromTransaction = await createTransaction({
    user: fromUserId,
    type: TRANSACTION_TYPES.TRADE,
    currency,
    amount: -amount,
    fee: 0,
    netAmount: -amount,
    balanceBefore: fromBalanceBefore,
    balanceAfter: fromWallet.balances[currency].available + fromWallet.balances[currency].locked,
    description: `Trade sent: ${amount} ${currency}`,
    metadata: {
      tradeId: tradeData.tradeId,
      counterparty: toUserId,
    },
  }, session);

  // Add to receiver
  const toWallet = await addBalance(toUserId, currency, amount, session);
  
  const toBalanceBefore = toWallet.balances[currency].available - amount;
  
  const toTransaction = await createTransaction({
    user: toUserId,
    type: TRANSACTION_TYPES.TRADE,
    currency,
    amount,
    fee: 0,
    netAmount: amount,
    balanceBefore: toBalanceBefore,
    balanceAfter: toWallet.balances[currency].available,
    description: `Trade received: ${amount} ${currency}`,
    metadata: {
      tradeId: tradeData.tradeId,
      counterparty: fromUserId,
    },
  }, session);

  return {
    fromTransaction,
    toTransaction,
  };
};

/**
 * Process referral bonus
 * @param {String} referrerId - Referrer user ID
 * @param {String} referredId - Referred user ID
 * @param {Number} amount - Bonus amount
 * @param {Number} level - Referral level
 * @param {Object} tradeData - Trade related data
 * @param {Object} session - MongoDB session
 * @returns {Object} Result with transaction
 */
const processReferralBonus = async (referrerId, referredId, amount, level, tradeData, session = null) => {
  const wallet = await addBalance(referrerId, CURRENCIES.USDT, amount, session);
  
  const balanceBefore = wallet.balances[CURRENCIES.USDT].available - amount;
  
  const transaction = await createTransaction({
    user: referrerId,
    type: TRANSACTION_TYPES.REFERRAL_BONUS,
    currency: CURRENCIES.USDT,
    amount,
    fee: 0,
    netAmount: amount,
    balanceBefore,
    balanceAfter: wallet.balances[CURRENCIES.USDT].available,
    description: `Level ${level} referral bonus: ${amount} USDT`,
    metadata: {
      referredId,
      level,
      tradeId: tradeData.tradeId,
    },
  }, session);

  return { wallet, transaction };
};

/**
 * Adjust wallet balance (admin only)
 * @param {String} userId - User ID
 * @param {String} currency - Currency
 * @param {Number} amount - Amount (positive or negative)
 * @param {String} reason - Reason for adjustment
 * @param {String} adminId - Admin ID
 * @param {Object} session - MongoDB session
 * @returns {Object} Result with wallet and transaction
 */
const adjustBalance = async (userId, currency, amount, reason, adminId, session = null) => {
  const options = session ? { session } : {};
  
  const wallet = await Wallet.findOne({ user: userId }, null, options);
  if (!wallet) {
    throw new Error('Wallet not found');
  }

  const balanceBefore = wallet.balances[currency].available;
  
  wallet.balances[currency].available += amount;
  
  if (wallet.balances[currency].available < 0) {
    throw new Error('Adjustment would result in negative balance');
  }
  
  wallet.lastUpdated = new Date();
  await wallet.save(options);

  const transaction = await createTransaction({
    user: userId,
    type: TRANSACTION_TYPES.ADJUSTMENT,
    currency,
    amount,
    fee: 0,
    netAmount: amount,
    balanceBefore,
    balanceAfter: wallet.balances[currency].available,
    description: `Balance adjustment: ${amount > 0 ? '+' : ''}${amount} ${currency}`,
    metadata: {
      reason,
      adminId,
    },
    processedBy: adminId,
  }, session);

  return { wallet, transaction };
};

/**
 * Lock wallet
 * @param {String} userId - User ID
 * @param {String} reason - Lock reason
 * @returns {Object} Updated wallet
 */
const lockWallet = async (userId, reason) => {
  const wallet = await Wallet.findOne({ user: userId });
  if (!wallet) {
    throw new Error('Wallet not found');
  }

  wallet.isLocked = true;
  wallet.lockReason = reason;
  wallet.lastUpdated = new Date();

  await wallet.save();
  return wallet;
};

/**
 * Unlock wallet
 * @param {String} userId - User ID
 * @returns {Object} Updated wallet
 */
const unlockWallet = async (userId) => {
  const wallet = await Wallet.findOne({ user: userId });
  if (!wallet) {
    throw new Error('Wallet not found');
  }

  wallet.isLocked = false;
  wallet.lockReason = null;
  wallet.lastUpdated = new Date();

  await wallet.save();
  return wallet;
};

module.exports = {
  getOrCreateWallet,
  getWalletBalance,
  lockAmount,
  unlockAmount,
  deductLockedAmount,
  addBalance,
  deductBalance,
  createTransaction,
  processDeposit,
  processWithdrawal,
  processTradeTransfer,
  processReferralBonus,
  adjustBalance,
  lockWallet,
  unlockWallet,
};
