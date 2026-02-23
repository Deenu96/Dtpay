const express = require('express');
const router = express.Router();
const { depositWithdrawController } = require('../controllers');
const { depositWithdrawValidation } = require('../middleware/validation');
const { sensitiveOpLimiter } = require('../middleware/rateLimiter');
const { authenticate, requireKYC, checkWalletLock } = require('../middleware/auth');
const multer = require('multer');

/**
 * Deposit/Withdrawal Routes
 * Base path: /api/deposit-withdraw
 */

// Configure multer for deposit screenshot uploads
const upload = multer({ dest: 'uploads/deposits/' });

// All routes require authentication
router.use(authenticate);

// Deposit routes
router.post(
  '/deposit/upi',
  sensitiveOpLimiter,
  requireKYC,
  upload.single('screenshot'),
  depositWithdrawValidation.depositUPI,
  depositWithdrawController.depositUPI
);

router.post(
  '/deposit/usdt',
  sensitiveOpLimiter,
  requireKYC,
  depositWithdrawController.depositUSDT
);

// Withdrawal routes
router.post(
  '/withdraw/bank',
  sensitiveOpLimiter,
  requireKYC,
  checkWalletLock,
  depositWithdrawValidation.withdrawBank,
  depositWithdrawController.withdrawBank
);

router.post(
  '/withdraw/usdt',
  sensitiveOpLimiter,
  requireKYC,
  checkWalletLock,
  depositWithdrawController.withdrawUSDT
);

// History routes
router.get('/history', depositWithdrawController.getHistory);
router.get('/:id', depositWithdrawController.getRequestById);

module.exports = router;
