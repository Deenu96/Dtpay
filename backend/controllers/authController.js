const User = require('../models/User');
const { hashPassword, comparePassword, generateAccessToken, generateRefreshToken, verifyRefreshToken, generateResetToken } = require('../config/auth');
const { asyncHandler, APIError } = require('../middleware/errorHandler');
const { ERROR_CODES } = require('../utils/constants');
const { sendPasswordResetEmail, sendWelcomeEmail } = require('../services/notificationService');
const referralService = require('../services/referralService');
const logger = require('../utils/logger');
const crypto = require('crypto');

/**
 * Auth Controller - Handles authentication operations
 */

/**
 * Register a new user
 * POST /api/auth/register
 */
const register = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName, phone, referralCode } = req.body;

  // Check if user already exists
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    throw new APIError('Email already registered', 409, ERROR_CODES.VALIDATION_ERROR);
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const user = await User.create({
    email: email.toLowerCase(),
    password: hashedPassword,
    firstName,
    lastName,
    phone,
  });

  // Process referral if code provided
  if (referralCode) {
    try {
      await referralService.processReferralRegistration(user._id, referralCode);
    } catch (refError) {
      logger.error('Error processing referral:', refError);
      // Don't fail registration if referral processing fails
    }
  }

  // Generate tokens
  const accessToken = generateAccessToken({
    userId: user._id,
    email: user.email,
    role: user.role,
  });

  const refreshToken = generateRefreshToken({
    userId: user._id,
  });

  // Save refresh token
  user.refreshTokens.push({
    token: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    deviceInfo: req.headers['user-agent'],
  });
  await user.save();

  // Send welcome email
  sendWelcomeEmail(user.email, user.firstName).catch(err => {
    logger.error('Error sending welcome email:', err);
  });

  logger.info(`User registered: ${user.email}`);

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        kycStatus: user.kycStatus,
        referralCode: user.referralCode,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    },
  });
});

/**
 * Login user
 * POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user with password
  const user = await User.findByEmail(email).select('+password');
  if (!user) {
    throw new APIError('Invalid email or password', 401, ERROR_CODES.UNAUTHORIZED);
  }

  // Check if account is locked
  if (user.isLocked) {
    throw new APIError('Account is temporarily locked. Please try again later.', 423, ERROR_CODES.FORBIDDEN);
  }

  // Check if user is banned
  if (user.isBanned) {
    throw new APIError(`Account has been banned. Reason: ${user.banReason || 'Not specified'}`, 403, ERROR_CODES.FORBIDDEN);
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    await user.incrementLoginAttempts();
    throw new APIError('Invalid email or password', 401, ERROR_CODES.UNAUTHORIZED);
  }

  // Reset login attempts on successful login
  if (user.loginAttempts > 0) {
    user.loginAttempts = 0;
    user.lockUntil = null;
  }

  // Update last login
  user.lastLogin = new Date();
  user.lastLoginIp = req.ip;

  // Generate tokens
  const accessToken = generateAccessToken({
    userId: user._id,
    email: user.email,
    role: user.role,
  });

  const refreshToken = generateRefreshToken({
    userId: user._id,
  });

  // Save refresh token
  user.refreshTokens.push({
    token: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    deviceInfo: req.headers['user-agent'],
  });

  // Limit stored refresh tokens to 5 per user
  if (user.refreshTokens.length > 5) {
    user.refreshTokens = user.refreshTokens.slice(-5);
  }

  await user.save();

  logger.info(`User logged in: ${user.email}`);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        kycStatus: user.kycStatus,
        referralCode: user.referralCode,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    },
  });
});

/**
 * Logout user
 * POST /api/auth/logout
 */
const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const userId = req.userId;

  const user = await User.findById(userId);
  if (user) {
    // Remove the specific refresh token
    user.refreshTokens = user.refreshTokens.filter(
      (rt) => rt.token !== refreshToken
    );
    await user.save();
  }

  logger.info(`User logged out: ${userId}`);

  res.json({
    success: true,
    message: 'Logout successful',
  });
});

/**
 * Refresh access token
 * POST /api/auth/refresh-token
 */
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;

  if (!token) {
    throw new APIError('Refresh token is required', 400, ERROR_CODES.VALIDATION_ERROR);
  }

  // Verify refresh token
  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch (error) {
    throw new APIError('Invalid or expired refresh token', 401, ERROR_CODES.UNAUTHORIZED);
  }

  // Find user and check if token exists
  const user = await User.findById(decoded.userId);
  if (!user) {
    throw new APIError('User not found', 404, ERROR_CODES.NOT_FOUND);
  }

  const tokenExists = user.refreshTokens.some((rt) => rt.token === token);
  if (!tokenExists) {
    throw new APIError('Invalid refresh token', 401, ERROR_CODES.UNAUTHORIZED);
  }

  // Generate new tokens
  const accessToken = generateAccessToken({
    userId: user._id,
    email: user.email,
    role: user.role,
  });

  const newRefreshToken = generateRefreshToken({
    userId: user._id,
  });

  // Replace old refresh token with new one
  user.refreshTokens = user.refreshTokens.filter((rt) => rt.token !== token);
  user.refreshTokens.push({
    token: newRefreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    deviceInfo: req.headers['user-agent'],
  });
  await user.save();

  res.json({
    success: true,
    data: {
      tokens: {
        accessToken,
        refreshToken: newRefreshToken,
      },
    },
  });
});

/**
 * Forgot password
 * POST /api/auth/forgot-password
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findByEmail(email);
  if (!user) {
    // Don't reveal if email exists
    return res.json({
      success: true,
      message: 'If an account exists, a password reset email has been sent',
    });
  }

  // Generate reset token
  const resetToken = generateResetToken();
  const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

  user.passwordResetToken = resetTokenHash;
  user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  await user.save();

  // Send reset email
  sendPasswordResetEmail(user.email, user.firstName, resetToken).catch(err => {
    logger.error('Error sending password reset email:', err);
  });

  logger.info(`Password reset requested for: ${user.email}`);

  res.json({
    success: true,
    message: 'If an account exists, a password reset email has been sent',
  });
});

/**
 * Reset password
 * POST /api/auth/reset-password
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  // Hash token for comparison
  const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: resetTokenHash,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new APIError('Invalid or expired reset token', 400, ERROR_CODES.VALIDATION_ERROR);
  }

  // Hash new password
  const hashedPassword = await hashPassword(password);

  // Update password and clear reset token
  user.password = hashedPassword;
  user.passwordResetToken = null;
  user.passwordResetExpires = null;
  user.refreshTokens = []; // Invalidate all refresh tokens
  await user.save();

  logger.info(`Password reset completed for: ${user.email}`);

  res.json({
    success: true,
    message: 'Password reset successful. Please login with your new password.',
  });
});

/**
 * Get current user
 * GET /api/auth/me
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);

  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        kycStatus: user.kycStatus,
        referralCode: user.referralCode,
        twoFactorEnabled: user.twoFactorEnabled,
        preferences: user.preferences,
        createdAt: user.createdAt,
      },
    },
  });
});

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  getMe,
};
