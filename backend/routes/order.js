const express = require('express');
const router = express.Router();
const { orderController } = require('../controllers');
const { orderValidation } = require('../middleware/validation');
const { tradingLimiter } = require('../middleware/rateLimiter');
const { authenticate, requireKYC, checkWalletLock } = require('../middleware/auth');

/**
 * Order Routes
 * Base path: /api/orders
 */

// Public routes
router.get('/', orderValidation.listOrders, orderController.listOrders);
router.get('/orderbook', orderController.getOrderBook);

// Protected routes
router.use(authenticate);

router.get('/my-orders', orderController.getMyOrders);
router.post(
  '/',
  tradingLimiter,
  requireKYC,
  checkWalletLock,
  orderValidation.createOrder,
  orderController.createOrder
);
router.get('/:id', orderValidation.orderId, orderController.getOrderById);
router.put(
  '/:id/cancel',
  tradingLimiter,
  orderValidation.cancelOrder,
  orderController.cancelOrder
);
router.post(
  '/:id/accept',
  tradingLimiter,
  requireKYC,
  checkWalletLock,
  orderValidation.acceptOrder,
  orderController.acceptOrder
);

module.exports = router;
