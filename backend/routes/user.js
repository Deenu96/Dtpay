const express = require('express');
const router = express.Router();
const { userController } = require('../controllers');
const { userValidation } = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');
const multer = require('multer');

/**
 * User Routes
 * Base path: /api/user
 */

// Configure multer for KYC document uploads
const upload = multer({ dest: 'uploads/kyc/' });

// Profile routes
router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, userValidation.updateProfile, userController.updateProfile);

// KYC routes
router.post(
  '/kyc',
  authenticate,
  upload.fields([
    { name: 'panCard', maxCount: 1 },
    { name: 'aadhaarFront', maxCount: 1 },
    { name: 'aadhaarBack', maxCount: 1 },
    { name: 'selfie', maxCount: 1 },
  ]),
  userValidation.kycSubmission,
  userController.submitKYC
);
router.get('/kyc-status', authenticate, userController.getKYCStatus);

// Password routes
router.put('/change-password', authenticate, userValidation.changePassword, userController.changePassword);

// Notification routes
router.get('/notifications', authenticate, userController.getNotifications);
router.get('/notifications/unread-count', authenticate, userController.getUnreadCount);
router.put('/notifications/:id/read', authenticate, userController.markNotificationRead);
router.put('/notifications/read-all', authenticate, userController.markAllNotificationsRead);

module.exports = router;
