const mongoose = require('mongoose');
const { TRANSACTION_TYPES, TRANSACTION_STATUS, CURRENCIES } = require('../utils/constants');
const { generateTransactionId } = require('../utils/helpers');

/**
 * Transaction Schema - Records all financial transactions
 */
const transactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      unique: true,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(TRANSACTION_TYPES),
      required: true,
    },
    currency: {
      type: String,
      enum: Object.values(CURRENCIES),
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    fee: {
      type: Number,
      default: 0,
    },
    netAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(TRANSACTION_STATUS),
      default: TRANSACTION_STATUS.PENDING,
    },
    balanceBefore: {
      type: Number,
      required: true,
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    metadata: {
      orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
      tradeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trade' },
      depositWithdrawId: { type: mongoose.Schema.Types.ObjectId },
      referralBonusId: { type: mongoose.Schema.Types.ObjectId, ref: 'ReferralBonus' },
      upiTransactionId: { type: String },
      blockchainTxHash: { type: String },
      adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      reason: { type: String },
      additionalInfo: { type: mongoose.Schema.Types.Mixed },
    },
    processedAt: {
      type: Date,
      default: null,
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
transactionSchema.index({ transactionId: 1 });
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ type: 1, status: 1 });
transactionSchema.index({ currency: 1, status: 1 });
transactionSchema.index({ createdAt: -1 });
transactionSchema.index({ 'metadata.orderId': 1 });
transactionSchema.index({ 'metadata.tradeId': 1 });

// Pre-save middleware to generate transaction ID
transactionSchema.pre('save', function (next) {
  if (this.isNew && !this.transactionId) {
    this.transactionId = generateTransactionId();
  }
  next();
});

// Static method to create transaction
transactionSchema.statics.createTransaction = async function (data) {
  const transaction = new this({
    ...data,
    transactionId: generateTransactionId(),
  });
  
  return transaction.save();
};

// Static method to get user transactions with pagination
transactionSchema.statics.getUserTransactions = async function (userId, options = {}) {
  const { page = 1, limit = 20, type, status, currency, startDate, endDate } = options;
  
  const query = { user: userId };
  
  if (type) query.type = type;
  if (status) query.status = status;
  if (currency) query.currency = currency;
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }
  
  const skip = (page - 1) * limit;
  
  const [transactions, total] = await Promise.all([
    this.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    this.countDocuments(query),
  ]);
  
  return {
    transactions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
};

module.exports = mongoose.model('Transaction', transactionSchema);
