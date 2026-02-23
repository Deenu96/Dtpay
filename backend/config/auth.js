const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

/**
 * Authentication configuration and utilities
 */

// Token expiration times
const TOKEN_CONFIG = {
  accessTokenExpiry: process.env.JWT_ACCESS_EXPIRATION || '15m',
  refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRATION || '7d',
};

/**
 * Generate access token
 * @param {Object} payload - User data to encode
 * @returns {String} JWT access token
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: TOKEN_CONFIG.accessTokenExpiry,
  });
};

/**
 * Generate refresh token
 * @param {Object} payload - User data to encode
 * @returns {String} JWT refresh token
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: TOKEN_CONFIG.refreshTokenExpiry,
  });
};

/**
 * Verify access token
 * @param {String} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Verify refresh token
 * @param {String} token - JWT refresh token to verify
 * @returns {Object} Decoded token payload
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

/**
 * Hash password
 * @param {String} password - Plain text password
 * @returns {String} Hashed password
 */
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Compare password with hash
 * @param {String} password - Plain text password
 * @param {String} hash - Hashed password
 * @returns {Boolean} Password match result
 */
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

/**
 * Generate random token for password reset
 * @returns {String} Random token
 */
const generateResetToken = () => {
  return require('crypto').randomBytes(32).toString('hex');
};

module.exports = {
  TOKEN_CONFIG,
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashPassword,
  comparePassword,
  generateResetToken,
};
