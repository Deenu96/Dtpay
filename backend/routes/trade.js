const express = require('express');
const router = express.Router();
const { tradeController } = require('../controllers');
const { tradeValidation } = require('../middleware/validation');
const { tradingLimiter } = require('../middleware/rateLimiter');
const { authenticate } = require('../middleware/auth');

/**
 * Trade Routes
 * Base path: /api/trades
 */

// All trade routes require authentication
router.use(authenticate);

// Trade listing routes
router.get('/', tradeController.getMyTrades);
router.get('/active', tradeController.getActiveTrades);

// Individual trade routes
router.get('/:id', tradeController.getTradeById);

// Trade action routes
router.post(
  '/:id/confirm-payment',
  tradingLimiter,
  tradeValidation.confirmPayment,
  tradeController.confirmPayment
);

router.post(
  '/:id/confirm-release',
  tradingLimiter,
  tradeController.confirmRelease
);

router.post(
  '/:id/cancel',
  tradingLimiter,
  tradeController.cancelTrade
);

router.post(
  '/:id/dispute',
  tradingLimiter,
  tradeValidation.raiseDispute,
  tradeController.raiseDispute
);

// Chat routes
router.post(
  '/:id/chat',
  tradeValidation.addChatMessage,
  tradeController.addChatMessage
);

module.exports = router;
