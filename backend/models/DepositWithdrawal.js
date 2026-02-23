const mongoose = require('mongoose');
const { DW_STATUS, CURRENCIES, PAYMENT_METHODS, TRANSACTION_TYPES } = require('../utils/constants');
const { generateTransactionId } = require('../utils/helpers');

/**
 * Deposit/Withdrawal Request Schema
 */
const depositWithdrawalSchema = new mongoose.Schema(
  {
    requestId: {
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
      min: 0,
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
      enum: Object.values(DW_STATUS),
      default: DW_STATUS.PENDING,
    },
    // Payment method details
    paymentMethod: {
      type: String,
      enum: Object.values(PAYMENT_METHODS),
      required: true,
    },
    // For UPI deposits
    upiId: {
      type: String,
      default: null,
    },
    upiTransactionId: {
      type: String,
      default: null,
    },
    upiScreenshot: {
      type: String,
      default: null,
    },
    // For bank withdrawals
    bankDetail: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BankDetail',
      default: null,
    },
    // For blockchain deposits/withdrawals
    blockchainNetwork: {
      type: String,
      default: null,
    },
    walletAddress: {
      type: String,
      default: null,
    },
    blockchainTxHash: {
      type: String,
      default: null,
    },
    blockchainConfirmations: {
      type: Number,
      default: 0,
    },
    // Processing details
    processedAt: {
      type: Date,
      default: null,
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    rejectedAt: {
      type: Date,
      default: null,
    },
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: null,
    },
    adminNotes: {
      type: String,
      default: null,
    },
    // Linked transaction
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
      default: null,
    },
    metadata: {
      ipAddress: String,
      userAgent: String,
      deviceInfo: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
depositWithdrawalSchema.index({ requestId: 1 });
depositWithdrawalSchema.index({ user: 1, createdAt: -1 });
depositWithdrawalSchema.index({ type: 1, status: 1 });
depositWithdrawalSchema.index({ currency: 1, status: 1 });
depositWithdrawalSchema.index({ status: 1, createdAt: 1 });
depositWithdrawalSchema.index({ blockchainTxHash: 1 });

// Pre-save middleware to generate request ID
depositWithdrawalSchema.pre('save', function (next) {
  if (this.isNew && !this.requestId) {
    const prefix = this.type === TRANSACTION_TYPES.DEPOSIT ? 'DEP' : 'WDR';
    this.requestId = `${prefix}${generateTransactionId().substring(3)}`;
  }
  if (this.isNew) {
    this.netAmount = this.amount - this.fee;
  }
  next();
});

// Method to approve request
depositWithdrawalSchema.methods.approve = async function (adminId, notes = null) {
  this.status = DW_STATUS.APPROVED;
  this.approvedAt = new Date();
  this.approvedBy = adminId;
  if (notes) this.adminNotes = notes;
  return this.save();
};

// Method to reject request
depositWithdrawalSchema.methods.reject = async function (adminId, reason, notes = null) {
  this.status = DW_STATUS.REJECTED;
  this.rejectedAt = new Date();
  this.rejectedBy = adminId;
  this.rejectionReason = reason;
  if (notes) this.adminNotes = notes;
  return this.save();
};

// Method to mark as completed
depositWithdrawalSchema.methods.complete = async function (transactionId = null) {
  this.status = DW_STATUS.COMPLETED;
  this.completedAt = new Date();
  if (transactionId) this.transaction = transactionId;
  return this.save();
};

// Method to mark as processing
depositWithdrawalSchema.methods.markProcessing = async function () {
  this.status = DW_STATUS.PROCESSING;
  this.processedAt = new Date();
  return this.save();
};

// Static method to get pending requests
depositWithdrawalSchema.statics.getPendingRequests = async function (type, options = {}) {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;
  
  const query = { type, status: DW_STATUS.PENDING };
  
  const [requests, total] = await Promise.all([
    this.find(query)
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'firstName lastName email')
      .lean(),
    this.countDocuments(query),
  ]);
  
  return {
    requests,
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

// Static method to get user's requests
depositWithdrawalSchema.statics.getUserRequests = async function (userId, options = {}) {
  const { type, page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;
  
  const query = { user: userId };
  if (type) query.type = type;
  
  const [requests, total] = await Promise.all([
    this.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    this.countDocuments(query),
  ]);
  
  return {
    requests,
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

module.exports = mongoose.model('DepositWithdrawal', depositWithdrawalSchema);
