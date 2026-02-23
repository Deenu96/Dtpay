const User = require('../models/User');
const Referral = require('../models/Referral');
const ReferralBonus = require('../models/ReferralBonus');
const { asyncHandler, APIError } = require('../middleware/errorHandler');
const referralService = require('../services/referralService');
const logger = require('../utils/logger');

/**
 * Referral Controller - Handles referral system operations
 */

/**
 * Get user's referral code
 * GET /api/referral/code
 */
const getReferralCode = asyncHandler(async (req, res) => {
  const userId = req.userId;

  const user = await User.findById(userId);

  res.json({
    success: true,
    data: {
      referralCode: user.referralCode,
      referralLink: `${process.env.FRONTEND_URL}/register?ref=${user.referralCode}`,
    },
  });
});

/**
 * Get referral statistics
 * GET /api/referral/stats
 */
const getReferralStats = asyncHandler(async (req, res) => {
  const userId = req.userId;

  const stats = await referralService.getReferralStats(userId);

  res.json({
    success: true,
    data: stats,
  });
});

/**
 * Get referral earnings
 * GET /api/referral/earnings
 */
const getReferralEarnings = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { page = 1, limit = 20, status } = req.query;

  const result = await referralService.getReferralEarnings(userId, {
    page: parseInt(page),
    limit: parseInt(limit),
    status,
  });

  res.json({
    success: true,
    data: result,
  });
});

/**
 * Get referral network (multi-level)
 * GET /api/referral/network
 */
const getReferralNetwork = asyncHandler(async (req, res) => {
  const userId = req.userId;

  const network = await referralService.getReferralNetwork(userId);

  res.json({
    success: true,
    data: network,
  });
});

/**
 * Get direct referrals
 * GET /api/referral/referrals
 */
const getReferrals = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { level, page = 1, limit = 20 } = req.query;

  const result = await referralService.getUserReferrals(userId, {
    level: level ? parseInt(level) : undefined,
    page: parseInt(page),
    limit: parseInt(limit),
  });

  res.json({
    success: true,
    data: result,
  });
});

module.exports = {
  getReferralCode,
  getReferralStats,
  getReferralEarnings,
  getReferralNetwork,
  getReferrals,
};
