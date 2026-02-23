const express = require('express');
const router = express.Router();
const { walletController } = require('../controllers');
const { authenticate, checkWalletLock } = require('../middleware/auth');

/**
 * Wallet Routes
 * Base path: /api/wallet
 */

// All wallet routes require authentication
router.use(authenticate);

// Balance routes
router.get('/balance', walletController.getBalance);
router.get('/summary', walletController.getWalletSummary);

// Transaction routes
router.get('/transactions', walletController.getTransactions);
router.get('/transaction/:id', walletController.getTransactionById);

module.exports = router;
