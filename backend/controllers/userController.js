const User = require('../models/User');
const KYCVerification = require('../models/KYCVerification');
const Notification = require('../models/Notification');
const { asyncHandler, APIError } = require('../middleware/errorHandler');
const { ERROR_CODES, KYC_STATUS } = require('../utils/constants');
const { hashPassword, comparePassword } = require('../config/auth');
const { sendKYCStatusEmail } = require('../services/notificationService');
const logger = require('../utils/logger');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * User Controller - Handles user profile and KYC operations
 */

/**
 * Get user profile
 * GET /api/user/profile
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);

  res.json({
    success: true,
    data: {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      kycStatus: user.kycStatus,
      referralCode: user.referralCode,
      twoFactorEnabled: user.twoFactorEnabled,
      preferences: user.preferences,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
    },
  });
});

/**
 * Update user profile
 * PUT /api/user/profile
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, phone, preferences } = req.body;

  const updateData = {};
  if (firstName) updateData.firstName = firstName;
  if (lastName) updateData.lastName = lastName;
  if (phone) updateData.phone = phone;
  if (preferences) updateData.preferences = preferences;

  const user = await User.findByIdAndUpdate(
    req.userId,
    updateData,
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      preferences: user.preferences,
    },
  });
});

/**
 * Submit KYC
 * POST /api/user/kyc
 */
const submitKYC = asyncHandler(async (req, res) => {
  const { panNumber, aadhaarNumber, address } = req.body;
  const userId = req.userId;

  // Check if KYC already submitted
  const existingKYC = await KYCVerification.findOne({ user: userId });
  if (existingKYC && existingKYC.status === KYC_STATUS.VERIFIED) {
    throw new APIError('KYC already verified', 400, ERROR_CODES.VALIDATION_ERROR);
  }

  if (existingKYC && existingKYC.status === KYC_STATUS.PENDING) {
    throw new APIError('KYC verification is pending', 400, ERROR_CODES.VALIDATION_ERROR);
  }

  // Handle file uploads (assuming multer middleware)
  const files = req.files;
  if (!files || !files.panCard || !files.aadhaarFront || !files.aadhaarBack || !files.selfie) {
    throw new APIError('All KYC documents are required', 400, ERROR_CODES.VALIDATION_ERROR);
  }

  // Upload images to Cloudinary
  const uploadPromises = [];
  
  uploadPromises.push(
    cloudinary.uploader.upload(files.panCard[0].path, { folder: 'kyc/pan' })
      .then(result => ({ type: 'panCard', url: result.secure_url }))
  );
  
  uploadPromises.push(
    cloudinary.uploader.upload(files.aadhaarFront[0].path, { folder: 'kyc/aadhaar' })
      .then(result => ({ type: 'aadhaarFront', url: result.secure_url }))
  );
  
  uploadPromises.push(
    cloudinary.uploader.upload(files.aadhaarBack[0].path, { folder: 'kyc/aadhaar' })
      .then(result => ({ type: 'aadhaarBack', url: result.secure_url }))
  );
  
  uploadPromises.push(
    cloudinary.uploader.upload(files.selfie[0].path, { folder: 'kyc/selfie' })
      .then(result => ({ type: 'selfie', url: result.secure_url }))
  );

  const uploadedFiles = await Promise.all(uploadPromises);
  const fileUrls = {};
  uploadedFiles.forEach(file => {
    fileUrls[file.type] = file.url;
  });

  // Create or update KYC record
  const kycData = {
    user: userId,
    panNumber: panNumber.toUpperCase(),
    panCardImage: fileUrls.panCard,
    aadhaarNumber,
    aadhaarFrontImage: fileUrls.aadhaarFront,
    aadhaarBackImage: fileUrls.aadhaarBack,
    selfieImage: fileUrls.selfie,
    address,
    status: KYC_STATUS.PENDING,
    submittedAt: new Date(),
  };

  let kyc;
  if (existingKYC) {
    kyc = await KYCVerification.findByIdAndUpdate(existingKYC._id, kycData, { new: true });
  } else {
    kyc = await KYCVerification.create(kycData);
  }

  // Update user's KYC status
  await User.findByIdAndUpdate(userId, { kycStatus: KYC_STATUS.PENDING });

  logger.info(`KYC submitted for user: ${userId}`);

  res.json({
    success: true,
    message: 'KYC documents submitted successfully. Verification is pending.',
    data: {
      kycStatus: KYC_STATUS.PENDING,
      submittedAt: kyc.submittedAt,
    },
  });
});

/**
 * Get KYC status
 * GET /api/user/kyc-status
 */
const getKYCStatus = asyncHandler(async (req, res) => {
  const userId = req.userId;

  const kyc = await KYCVerification.findOne({ user: userId });
  const user = await User.findById(userId);

  res.json({
    success: true,
    data: {
      status: user.kycStatus,
      submittedAt: kyc?.submittedAt || null,
      verifiedAt: kyc?.verifiedAt || null,
      rejectedAt: kyc?.rejectedAt || null,
      rejectionReason: kyc?.rejectionReason || null,
      documentStatus: kyc?.documentStatus || null,
    },
  });
});

/**
 * Change password
 * PUT /api/user/change-password
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.userId;

  const user = await User.findById(userId).select('+password');

  // Verify current password
  const isPasswordValid = await comparePassword(currentPassword, user.password);
  if (!isPasswordValid) {
    throw new APIError('Current password is incorrect', 400, ERROR_CODES.VALIDATION_ERROR);
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);

  // Update password
  user.password = hashedPassword;
  user.refreshTokens = []; // Invalidate all refresh tokens
  await user.save();

  logger.info(`Password changed for user: ${userId}`);

  res.json({
    success: true,
    message: 'Password changed successfully. Please login again.',
  });
});

/**
 * Get user notifications
 * GET /api/user/notifications
 */
const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { page = 1, limit = 20, unreadOnly = false } = req.query;

  const result = await Notification.getUserNotifications(userId, {
    page: parseInt(page),
    limit: parseInt(limit),
    unreadOnly: unreadOnly === 'true',
  });

  res.json({
    success: true,
    data: result,
  });
});

/**
 * Mark notification as read
 * PUT /api/user/notifications/:id/read
 */
const markNotificationRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  const notification = await Notification.findOne({
    _id: id,
    user: userId,
  });

  if (!notification) {
    throw new APIError('Notification not found', 404, ERROR_CODES.NOT_FOUND);
  }

  await notification.markAsRead();

  res.json({
    success: true,
    message: 'Notification marked as read',
  });
});

/**
 * Mark all notifications as read
 * PUT /api/user/notifications/read-all
 */
const markAllNotificationsRead = asyncHandler(async (req, res) => {
  const userId = req.userId;

  await Notification.markAllAsRead(userId);

  res.json({
    success: true,
    message: 'All notifications marked as read',
  });
});

/**
 * Get unread notification count
 * GET /api/user/notifications/unread-count
 */
const getUnreadCount = asyncHandler(async (req, res) => {
  const userId = req.userId;

  const count = await Notification.getUnreadCount(userId);

  res.json({
    success: true,
    data: { count },
  });
});

module.exports = {
  getProfile,
  updateProfile,
  submitKYC,
  getKYCStatus,
  changePassword,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getUnreadCount,
};
