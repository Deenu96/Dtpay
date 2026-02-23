const mongoose = require('mongoose');
const { REFERRAL_LEVELS } = require('../utils/constants');

/**
 * Referral Relationship Schema
 */
const referralSchema = new mongoose.Schema(
  {
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
    level: {
      type: Number,
      enum: Object.values(REFERRAL_LEVELS),
      required: true,
    },
    referralCode: {
      type: String,
      required: true,
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
    firstTradeAt: {
      type: Date,
      default: null,
    },
    totalTrades: {
      type: Number,
      default: 0,
    },
    totalVolume: {
      type: Number,
      default: 0,
    },
    totalBonusEarned: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure unique referral relationship
referralSchema.index({ referrer: 1, referred: 1 }, { unique: true });
referralSchema.index({ referrer: 1, level: 1 });
referralSchema.index({ referred: 1 });
referralSchema.index({ referralCode: 1 });

// Static method to get referrer chain for a user
referralSchema.statics.getReferrerChain = async function (userId) {
  const chain = [];
  let currentUserId = userId;
  let level = 1;
  
  while (level <= 3) {
    const referral = await this.findOne({
      referred: currentUserId,
      level: 1, // Direct referral only
    }).populate('referrer', '_id');
    
    if (!referral) break;
    
    chain.push({
      userId: referral.referrer._id,
      level,
      referralCode: referral.referralCode,
    });
    
    currentUserId = referral.referrer._id;
    level++;
  }
  
  return chain;
};

// Static method to get referrals by user
referralSchema.statics.getUserReferrals = async function (userId, options = {}) {
  const { level, page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;
  
  const query = { referrer: userId };
  if (level) query.level = level;
  
  const [referrals, total] = await Promise.all([
    this.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('referred', 'firstName lastName email createdAt')
      .lean(),
    this.countDocuments(query),
  ]);
  
  return {
    referrals,
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

// Static method to get referral statistics
referralSchema.statics.getReferralStats = async function (userId) {
  const stats = await this.aggregate([
    { $match: { referrer: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$level',
        count: { $sum: 1 },
        totalVolume: { $sum: '$totalVolume' },
        totalBonus: { $sum: '$totalBonusEarned' },
        activeReferrals: {
          $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  
  const totalStats = await this.aggregate([
    { $match: { referrer: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalReferrals: { $sum: 1 },
        totalVolume: { $sum: '$totalVolume' },
        totalBonus: { $sum: '$totalBonusEarned' },
      },
    },
  ]);
  
  return {
    byLevel: stats,
    total: totalStats[0] || { totalReferrals: 0, totalVolume: 0, totalBonus: 0 },
  };
};

module.exports = mongoose.model('Referral', referralSchema);
