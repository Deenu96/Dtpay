const mongoose = require('mongoose');
const { TRADE_STATUS, PAYMENT_METHODS, CURRENCIES } = require('../utils/constants');
const { generateTradeId } = require('../utils/helpers');

/**
 * Trade Schema - Individual trades between users
 */
const tradeSchema = new mongoose.Schema(
  {
    tradeId: {
      type: String,
      unique: true,
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    orderType: {
      type: String,
      enum: ['buy', 'sell'],
      required: true,
    },
    // Maker = order creator, Taker = order acceptor
    maker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    taker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    totalValue: {
      type: Number,
      required: true,
    },
    tradingFee: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      enum: Object.values(CURRENCIES),
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PAYMENT_METHODS),
      required: true,
    },
    paymentDetails: {
      upiId: { type: String },
      bankAccount: { type: String },
      bankName: { type: String },
      ifscCode: { type: String },
      accountHolderName: { type: String },
      qrCodeUrl: { type: String },
    },
    status: {
      type: String,
      enum: Object.values(TRADE_STATUS),
      default: TRADE_STATUS.PENDING,
    },
    paymentWindowExpiresAt: {
      type: Date,
      required: true,
    },
    paidAt: {
      type: Date,
      default: null,
    },
    paymentProof: {
      type: String,
      default: null,
    },
    paymentReference: {
      type: String,
      default: null,
    },
    confirmedAt: {
      type: Date,
      default: null,
    },
    confirmedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    cancellationReason: {
      type: String,
      default: null,
    },
    disputedAt: {
      type: Date,
      default: null,
    },
    disputedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    disputeReason: {
      type: String,
      default: null,
    },
    disputeResolvedAt: {
      type: Date,
      default: null,
    },
    disputeResolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    disputeResolution: {
      type: String,
      default: null,
    },
    disputeWinner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    chatMessages: [
      {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        message: String,
        createdAt: { type: Date, default: Date.now },
        isSystem: { type: Boolean, default: false },
      },
    ],
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
tradeSchema.index({ tradeId: 1 });
tradeSchema.index({ order: 1 });
tradeSchema.index({ maker: 1, status: 1 });
tradeSchema.index({ taker: 1, status: 1 });
tradeSchema.index({ buyer: 1, status: 1 });
tradeSchema.index({ seller: 1, status: 1 });
tradeSchema.index({ status: 1, createdAt: -1 });
tradeSchema.index({ paymentWindowExpiresAt: 1 });
tradeSchema.index({ disputedAt: 1 });

// Pre-save middleware to generate trade ID
tradeSchema.pre('save', function (next) {
  if (this.isNew && !this.tradeId) {
    this.tradeId = generateTradeId();
    this.totalValue = this.amount * this.price;
  }
  next();
});

// Method to mark as paid
tradeSchema.methods.markAsPaid = async function (paymentReference = null, paymentProof = null) {
  if (this.status !== TRADE_STATUS.PENDING) {
    throw new Error('Trade must be in pending status to mark as paid');
  }
  
  if (new Date() > this.paymentWindowExpiresAt) {
    throw new Error('Payment window has expired');
  }
  
  this.status = TRADE_STATUS.PAID;
  this.paidAt = new Date();
  this.paymentReference = paymentReference;
  this.paymentProof = paymentProof;
  
  return this.save();
};

// Method to confirm payment and release
tradeSchema.methods.confirmPayment = async function (userId) {
  if (this.status !== TRADE_STATUS.PAID) {
    throw new Error('Trade must be in paid status to confirm');
  }
  
  this.status = TRADE_STATUS.CONFIRMED;
  this.confirmedAt = new Date();
  this.confirmedBy = userId;
  
  return this.save();
};

// Method to complete trade
tradeSchema.methods.complete = async function () {
  if (this.status !== TRADE_STATUS.CONFIRMED) {
    throw new Error('Trade must be in confirmed status to complete');
  }
  
  this.status = TRADE_STATUS.COMPLETED;
  this.completedAt = new Date();
  
  return this.save();
};

// Method to cancel trade
tradeSchema.methods.cancel = async function (userId, reason = null) {
  if (![TRADE_STATUS.PENDING, TRADE_STATUS.PAID].includes(this.status)) {
    throw new Error('Cannot cancel trade in current status');
  }
  
  this.status = TRADE_STATUS.CANCELLED;
  this.cancelledAt = new Date();
  this.cancelledBy = userId;
  this.cancellationReason = reason;
  
  return this.save();
};

// Method to raise dispute
tradeSchema.methods.raiseDispute = async function (userId, reason) {
  if (![TRADE_STATUS.PENDING, TRADE_STATUS.PAID].includes(this.status)) {
    throw new Error('Cannot dispute trade in current status');
  }
  
  this.status = TRADE_STATUS.DISPUTED;
  this.disputedAt = new Date();
  this.disputedBy = userId;
  this.disputeReason = reason;
  
  return this.save();
};

// Method to resolve dispute
tradeSchema.methods.resolveDispute = async function (adminId, resolution, winnerId) {
  if (this.status !== TRADE_STATUS.DISPUTED) {
    throw new Error('Trade must be in disputed status to resolve');
  }
  
  this.status = winnerId ? TRADE_STATUS.COMPLETED : TRADE_STATUS.CANCELLED;
  this.disputeResolvedAt = new Date();
  this.disputeResolvedBy = adminId;
  this.disputeResolution = resolution;
  this.disputeWinner = winnerId;
  
  if (winnerId) {
    this.completedAt = new Date();
  } else {
    this.cancelledAt = new Date();
    this.cancelledBy = adminId;
  }
  
  return this.save();
};

// Method to add chat message
tradeSchema.methods.addChatMessage = async function (senderId, message, isSystem = false) {
  this.chatMessages.push({
    sender: senderId,
    message,
    isSystem,
    createdAt: new Date(),
  });
  
  return this.save();
};

// Static method to get active trades for user
tradeSchema.statics.getUserActiveTrades = async function (userId) {
  return this.find({
    $or: [{ maker: userId }, { taker: userId }],
    status: { $in: [TRADE_STATUS.PENDING, TRADE_STATUS.PAID, TRADE_STATUS.DISPUTED] },
  }).sort({ createdAt: -1 });
};

// Static method to get trade history for user
tradeSchema.statics.getUserTradeHistory = async function (userId, options = {}) {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;
  
  const [trades, total] = await Promise.all([
    this.find({
      $or: [{ maker: userId }, { taker: userId }],
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('maker', 'firstName lastName')
      .populate('taker', 'firstName lastName')
      .lean(),
    this.countDocuments({
      $or: [{ maker: userId }, { taker: userId }],
    }),
  ]);
  
  return {
    trades,
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

module.exports = mongoose.model('Trade', tradeSchema);
