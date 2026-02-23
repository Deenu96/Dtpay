const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { USER_ROLES, ERROR_CODES } = require('../utils/constants');
const logger = require('../utils/logger');
const { APIError } = require('./errorHandler');

/**
 * Authentication and Authorization Middleware
 */

/**
 * Verify JWT token from Authorization header
 */
const authenticate = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check for token in cookies (optional)
    if (!token && req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return next(new APIError('Access denied. No token provided.', 401, ERROR_CODES.UNAUTHORIZED));
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from database
      const user = await User.findById(decoded.userId).select('-password');

      if (!user) {
        return next(new APIError('User not found. Token may be invalid.', 401, ERROR_CODES.UNAUTHORIZED));
      }

      // Check if user is active
      if (!user.isActive) {
        return next(new APIError('Your account has been deactivated.', 403, ERROR_CODES.FORBIDDEN));
      }

      // Check if user is banned
      if (user.isBanned) {
        return next(new APIError(`Your account has been banned. Reason: ${user.banReason || 'Not specified'}`, 403, ERROR_CODES.FORBIDDEN));
      }

      // Attach user to request
      req.user = user;
      req.userId = user._id;
      req.userRole = user.role;

      next();
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return next(new APIError('Token has expired. Please refresh your token.', 401, ERROR_CODES.UNAUTHORIZED));
      }
      return next(new APIError('Invalid token.', 401, ERROR_CODES.UNAUTHORIZED));
    }
  } catch (error) {
    logger.error('Authentication error:', error);
    next(new APIError('Authentication failed.', 500));
  }
};

/**
 * Optional authentication - doesn't require token but attaches user if present
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        if (user && user.isActive && !user.isBanned) {
          req.user = user;
          req.userId = user._id;
          req.userRole = user.role;
        }
      } catch (error) {
        // Silently fail for optional auth
      }
    }

    next();
  } catch (error) {
    next();
  }
};

/**
 * Check if user has required role
 * @param  {...String} allowedRoles - Roles that are allowed to access
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new APIError('Authentication required.', 401, ERROR_CODES.UNAUTHORIZED));
    }

    if (!allowedRoles.includes(req.userRole)) {
      return next(new APIError('You do not have permission to perform this action.', 403, ERROR_CODES.FORBIDDEN));
    }

    next();
  };
};

/**
 * Check if user is admin
 */
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return next(new APIError('Authentication required.', 401, ERROR_CODES.UNAUTHORIZED));
  }

  if (req.userRole !== USER_ROLES.ADMIN && req.userRole !== USER_ROLES.SUPERADMIN) {
    return next(new APIError('Admin access required.', 403, ERROR_CODES.FORBIDDEN));
  }

  next();
};

/**
 * Check if user is superadmin
 */
const isSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return next(new APIError('Authentication required.', 401, ERROR_CODES.UNAUTHORIZED));
  }

  if (req.userRole !== USER_ROLES.SUPERADMIN) {
    return next(new APIError('Superadmin access required.', 403, ERROR_CODES.FORBIDDEN));
  }

  next();
};

/**
 * Verify admin API key for certain admin routes
 */
const verifyAdminApiKey = (req, res, next) => {
  const apiKey = req.headers['x-admin-api-key'];

  if (!apiKey) {
    return next(new APIError('Admin API key required.', 401, ERROR_CODES.UNAUTHORIZED));
  }

  if (apiKey !== process.env.ADMIN_API_KEY) {
    logger.warn(`Invalid admin API key attempt from IP: ${req.ip}`);
    return next(new APIError('Invalid admin API key.', 401, ERROR_CODES.UNAUTHORIZED));
  }

  next();
};

/**
 * Check if user's KYC is verified
 */
const requireKYC = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(new APIError('Authentication required.', 401, ERROR_CODES.UNAUTHORIZED));
    }

    if (req.user.kycStatus !== 'verified') {
      return next(new APIError('KYC verification required to perform this action.', 403, ERROR_CODES.KYC_REQUIRED));
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Check wallet lock status
 */
const checkWalletLock = async (req, res, next) => {
  try {
    const Wallet = require('../models/Wallet');
    const wallet = await Wallet.findOne({ user: req.userId });

    if (wallet && wallet.isLocked) {
      return next(new APIError(`Wallet is locked. Reason: ${wallet.lockReason || 'Not specified'}`, 403, ERROR_CODES.FORBIDDEN));
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authenticate,
  optionalAuth,
  authorize,
  isAdmin,
  isSuperAdmin,
  verifyAdminApiKey,
  requireKYC,
  checkWalletLock,
};
