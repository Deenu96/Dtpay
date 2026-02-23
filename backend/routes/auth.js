const express = require('express');
const router = express.Router();
const { authController } = require('../controllers');
const { authValidation } = require('../middleware/validation');
const { authLimiter } = require('../middleware/rateLimiter');
const { authenticate } = require('../middleware/auth');

/**
 * Auth Routes
 * Base path: /api/auth
 */

// Public routes with rate limiting
router.post('/register', authLimiter, authValidation.register, authController.register);
router.post('/login', authLimiter, authValidation.login, authController.login);
router.post('/forgot-password', authLimiter, authValidation.forgotPassword, authController.forgotPassword);
router.post('/reset-password', authLimiter, authValidation.resetPassword, authController.resetPassword);
router.post('/refresh-token', authLimiter, authValidation.refreshToken, authController.refreshToken);

// Protected routes
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getMe);

module.exports = router;
