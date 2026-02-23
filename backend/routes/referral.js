const express = require('express');
const router = express.Router();
const { referralController } = require('../controllers');
const { authenticate } = require('../middleware/auth');

/**
 * Referral Routes
 * Base path: /api/referral
 */

// All referral routes require authentication
router.use(authenticate);

// Referral info routes
router.get('/code', referralController.getReferralCode);
router.get('/stats', referralController.getReferralStats);
router.get('/earnings', referralController.getReferralEarnings);
router.get('/network', referralController.getReferralNetwork);
router.get('/referrals', referralController.getReferrals);

module.exports = router;
