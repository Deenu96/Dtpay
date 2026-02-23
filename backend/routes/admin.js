const express = require('express');
const router = express.Router();
const { adminController } = require('../controllers');
const { adminValidation } = require('../middleware/validation');
const { adminLimiter } = require('../middleware/rateLimiter');
const { authenticate, isAdmin, isSuperAdmin } = require('../middleware/auth');

/**
 * Admin Routes
 * Base path: /api/admin
 */

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(isAdmin);
router.use(adminLimiter);

// ==================== USER MANAGEMENT ====================
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id/status', adminValidation.updateUserStatus, adminController.updateUserStatus);

// ==================== KYC MANAGEMENT ====================
router.get('/kyc/pending', adminController.getPendingKYC);
router.post('/kyc/:id/verify', adminValidation.verifyKYC, adminController.verifyKYC);

// ==================== ORDER MANAGEMENT ====================
router.get('/orders', adminController.getOrders);

// ==================== TRADE MANAGEMENT ====================
router.get('/trades', adminController.getTrades);
router.post('/trades/:id/resolve', adminValidation.resolveDispute, adminController.resolveDispute);

// ==================== DEPOSIT MANAGEMENT ====================
router.get('/deposits', adminController.getPendingDeposits);
router.post('/deposits/:id/approve', adminValidation.approveDepositWithdrawal, adminController.approveDeposit);
router.post('/deposits/:id/reject', adminValidation.rejectDepositWithdrawal, adminController.rejectDeposit);

// ==================== WITHDRAWAL MANAGEMENT ====================
router.get('/withdrawals', adminController.getPendingWithdrawals);
router.post('/withdrawals/:id/approve', adminValidation.approveDepositWithdrawal, adminController.approveWithdrawal);
router.post('/withdrawals/:id/reject', adminValidation.rejectDepositWithdrawal, adminController.rejectWithdrawal);

// ==================== WALLET MANAGEMENT ====================
router.get('/wallets/:userId', adminController.getUserWallet);
router.post('/wallets/:userId/adjust', adminValidation.adjustWallet, adminController.adjustWallet);

// ==================== REFERRAL MANAGEMENT ====================
router.get('/referrals', adminController.getReferralStats);

// ==================== DASHBOARD ====================
router.get('/stats', adminController.getDashboardStats);

// ==================== ADMIN LOGS ====================
router.get('/logs', adminController.getAdminLogs);

module.exports = router;
