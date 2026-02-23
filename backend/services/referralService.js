const Referral = require('../models/Referral');
const ReferralBonus = require('../models/ReferralBonus');
const User = require('../models/User');
const { REFERRAL_LEVELS, REFERRAL_PERCENTAGES } = require('../utils/constants');
const walletService = require('./walletService');
const notificationService = require('./notificationService');
const logger = require('../utils/logger');

/**
 * Referral Service - Handles referral system operations
 */

/**
 * Process referral registration
 * @param {String} newUserId - New user ID
 * @param {String} referralCode - Referral code used
 * @param {Object} session - MongoDB session
 * @returns {Object} Referral chain created
 */
const processReferralRegistration = async (newUserId, referralCode, session = null) => {
  const options = session ? { session } : {};
  
  if (!referralCode) {
    return { success: false, message: 'No referral code provided' };
  }

  try {
    // Find referrer
    const referrer = await User.findByReferralCode(referralCode.toUpperCase());
    if (!referrer) {
      return { success: false, message: 'Invalid referral code' };
    }

    // Prevent self-referral
    if (referrer._id.toString() === newUserId) {
      return { success: false, message: 'Cannot refer yourself' };
    }

    // Create level 1 referral
    await Referral.create([{
      referrer: referrer._id,
      referred: newUserId,
      level: REFERRAL_LEVELS.LEVEL1,
      referralCode: referralCode.toUpperCase(),
    }], options);

    // Get referrer's referrer chain (for multi-level)
    const referrerChain = await Referral.find({ referred: referrer._id })
      .sort({ level: 1 })
      .limit(2);

    // Create level 2 and 3 referrals
    for (const ref of referrerChain) {
      const nextLevel = ref.level + 1;
      if (nextLevel <= REFERRAL_LEVELS.LEVEL3) {
        await Referral.create([{
          referrer: ref.referrer,
          referred: newUserId,
          level: nextLevel,
          referralCode: ref.referralCode,
        }], options);
      }
    }

    // Update new user's referredBy
    await User.findByIdAndUpdate(newUserId, { referredBy: referrer._id }, options);

    logger.info(`Referral processed: ${newUserId} referred by ${referrer._id}`);

    return {
      success: true,
      referrerId: referrer._id,
      levelsCreated: 1 + referrerChain.length,
    };
  } catch (error) {
    logger.error('Error processing referral registration:', error);
    throw error;
  }
};

/**
 * Process referral bonus for completed trade
 * @param {String} tradeId - Trade ID
 * @param {String} buyerId - Buyer user ID
 * @param {String} sellerId - Seller user ID
 * @param {Number} amount - Trade amount in USDT
 * @param {Object} session - MongoDB session
 * @returns {Object} Bonuses created
 */
const processTradeReferralBonus = async (tradeId, buyerId, sellerId, amount, session = null) => {
  const options = session ? { session } : {};
  const bonuses = [];

  try {
    // Process for both buyer and seller
    const participants = [
      { userId: buyerId, role: 'buyer' },
      { userId: sellerId, role: 'seller' },
    ];

    for (const participant of participants) {
      // Find referrer chain for this user
      const referrals = await Referral.find({
        referred: participant.userId,
        isActive: true,
      });

      for (const referral of referrals) {
        const percentage = REFERRAL_PERCENTAGES[referral.level];
        const bonusAmount = (amount * percentage) / 100;

        if (bonusAmount > 0) {
          // Create referral bonus record
          const bonus = await ReferralBonus.create([{
            referrer: referral.referrer,
            referred: participant.userId,
            trade: tradeId,
            level: referral.level,
            baseAmount: amount,
            percentage,
            bonusAmount,
            currency: 'USDT',
            metadata: {
              tradeAmount: amount,
              referralCode: referral.referralCode,
            },
          }], options);

          // Credit bonus to referrer's wallet
          const { transaction } = await walletService.processReferralBonus(
            referral.referrer,
            participant.userId,
            bonusAmount,
            referral.level,
            { tradeId },
            session
          );

          // Update bonus record with transaction
          await ReferralBonus.findByIdAndUpdate(
            bonus[0]._id,
            {
              status: 'completed',
              creditedAt: new Date(),
              transaction: transaction._id,
            },
            options
          );

          // Update referral stats
          await Referral.findByIdAndUpdate(
            referral._id,
            {
              $inc: {
                totalTrades: 1,
                totalVolume: amount,
                totalBonusEarned: bonusAmount,
              },
              firstTradeAt: referral.firstTradeAt || new Date(),
            },
            options
          );

          // Send notification
          await notificationService.sendReferralBonusNotification(
            referral.referrer,
            bonusAmount,
            referral.level
          );

          bonuses.push({
            referrerId: referral.referrer,
            level: referral.level,
            amount: bonusAmount,
          });
        }
      }
    }

    logger.info(`Referral bonuses processed for trade ${tradeId}: ${bonuses.length} bonuses`);

    return {
      success: true,
      bonuses,
    };
  } catch (error) {
    logger.error('Error processing trade referral bonus:', error);
    throw error;
  }
};

/**
 * Get user's referral statistics
 * @param {String} userId - User ID
 * @returns {Object} Referral statistics
 */
const getReferralStats = async (userId) => {
  try {
    const stats = await Referral.getReferralStats(userId);
    const totalBonus = await ReferralBonus.getTotalBonusEarned(userId);

    return {
      byLevel: stats.byLevel,
      total: stats.total,
      totalBonusByCurrency: totalBonus,
    };
  } catch (error) {
    logger.error('Error getting referral stats:', error);
    throw error;
  }
};

/**
 * Get user's referrals
 * @param {String} userId - User ID
 * @param {Object} options - Query options
 * @returns {Object} Referrals with pagination
 */
const getUserReferrals = async (userId, options = {}) => {
  try {
    return Referral.getUserReferrals(userId, options);
  } catch (error) {
    logger.error('Error getting user referrals:', error);
    throw error;
  }
};

/**
 * Get user's referral earnings
 * @param {String} userId - User ID
 * @param {Object} options - Query options
 * @returns {Object} Referral bonuses with pagination
 */
const getReferralEarnings = async (userId, options = {}) => {
  try {
    return ReferralBonus.getUserBonuses(userId, options);
  } catch (error) {
    logger.error('Error getting referral earnings:', error);
    throw error;
  }
};

/**
 * Get user's referral network (multi-level)
 * @param {String} userId - User ID
 * @returns {Object} Referral network
 */
const getReferralNetwork = async (userId) => {
  try {
    const network = {
      level1: [],
      level2: [],
      level3: [],
    };

    // Get direct referrals (Level 1)
    const level1Referrals = await Referral.find({
      referrer: userId,
      level: REFERRAL_LEVELS.LEVEL1,
    }).populate('referred', 'firstName lastName email createdAt');

    network.level1 = level1Referrals.map(r => ({
      user: r.referred,
      registeredAt: r.registeredAt,
      totalTrades: r.totalTrades,
      totalBonusEarned: r.totalBonusEarned,
    }));

    // Get Level 2 referrals
    const level1UserIds = level1Referrals.map(r => r.referred._id);
    const level2Referrals = await Referral.find({
      referrer: { $in: level1UserIds },
      level: REFERRAL_LEVELS.LEVEL1,
    }).populate('referred', 'firstName lastName email createdAt');

    network.level2 = level2Referrals.map(r => ({
      user: r.referred,
      registeredAt: r.registeredAt,
      referredBy: level1Referrals.find(l1 => l1.referred._id.equals(r.referrer))?.referred,
      totalTrades: r.totalTrades,
      totalBonusEarned: r.totalBonusEarned,
    }));

    // Get Level 3 referrals
    const level2UserIds = level2Referrals.map(r => r.referred._id);
    const level3Referrals = await Referral.find({
      referrer: { $in: level2UserIds },
      level: REFERRAL_LEVELS.LEVEL1,
    }).populate('referred', 'firstName lastName email createdAt');

    network.level3 = level3Referrals.map(r => ({
      user: r.referred,
      registeredAt: r.registeredAt,
      referredBy: level2Referrals.find(l2 => l2.referred._id.equals(r.referrer))?.referred,
      totalTrades: r.totalTrades,
      totalBonusEarned: r.totalBonusEarned,
    }));

    return network;
  } catch (error) {
    logger.error('Error getting referral network:', error);
    throw error;
  }
};

/**
 * Deactivate referral
 * @param {String} referralId - Referral ID
 * @returns {Object} Updated referral
 */
const deactivateReferral = async (referralId) => {
  try {
    const referral = await Referral.findByIdAndUpdate(
      referralId,
      { isActive: false },
      { new: true }
    );
    return referral;
  } catch (error) {
    logger.error('Error deactivating referral:', error);
    throw error;
  }
};

module.exports = {
  processReferralRegistration,
  processTradeReferralBonus,
  getReferralStats,
  getUserReferrals,
  getReferralEarnings,
  getReferralNetwork,
  deactivateReferral,
};
