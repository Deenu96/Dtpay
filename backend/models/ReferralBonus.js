const mongoose = require('mongoose');
const { TRANSACTION_STATUS, CURRENCIES } = require('../utils/constants');
const { generateTransactionId } = require('../utils/helpers');

/**
 * Referral Bonus Schema
 */
const referralBonusSchema = new mongoose.Schema(
  {
    bonusId: {
      type: String,
      unique: true,
      required: true,
    },
    referrer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    referred: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    trade: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trade',
      required: true,
    },
    level: {
      type: Number,
      required: true,
    },
    baseAmount: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
    bonusAmount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      enum: Object.values(CURRENCIES),
      default: CURRENCIES.USDT,
    },
    status: {
      type: String,
      enum: Object.values(TRANSACTION_STATUS),
      default: TRANSACTION_STATUS.PENDING,
    },
    creditedAt: {
      type: Date,
      default: null,
    },
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
      default: null,
    },
    metadata: {
      tradeAmount: Number,
      tradePrice: Number,
      referralCode: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
referralBonusSchema.index({ bonusId: 1 });
referralBonusSchema.index({ referrer: 1, status: 1 });
referralBonusSchema.index({ referred: 1 });
referralBonusSchema.index({ trade: 1 });
referralBonusSchema.index({ createdAt: -1 });

// Pre-save middleware to generate bonus ID
referralBonusSchema.pre('save', function (next) {
  if (this.isNew && !this.bonusId) {
    this.bonusId = `REF${generateTransactionId().substring(3)}`;
  }
  next();
});

// Method to mark as credited
referralBonusSchema.methods.markAsCredited = async function (transactionId) {
  this.status = TRANSACTION_STATUS.COMPLETED;
  this.creditedAt = new Date();
  this.transaction = transactionId;
  return this.save();
};

// Static method to get user's referral bonuses
referralBonusSchema.statics.getUserBonuses = async function (userId, options = {}) {
  const { status, page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;
  
  const query = { referrer: userId };
  if (status) query.status = status;
  
  const [bonuses, total] = await Promise.all([
    this.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('referred', 'firstName lastName')
      .populate('trade', 'tradeId amount')
      .lean(),
    this.countDocuments(query),
  ]);
  
  return {
    bonuses,
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

// Static method to get total bonus earned
referralBonusSchema.statics.getTotalBonusEarned = async function (userId) {
  const result = await this.aggregate([
    {
      $match: {
        referrer: new mongoose.Types.ObjectId(userId),
        status: TRANSACTION_STATUS.COMPLETED,
      },
    },
    {
      $group: {
        _id: '$currency',
        total: { $sum: '$bonusAmount' },
        count: { $sum: 1 },
      },
    },
  ]);
  
  return result;
};

module.exports = mongoose.model('ReferralBonus', referralBonusSchema);
