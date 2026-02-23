const logger = require('../utils/logger');
const { ERROR_CODES } = require('../utils/constants');

/**
 * Custom error class for API errors
 */
class APIError extends Error {
  constructor(message, statusCode, errorCode = null, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Async handler wrapper for controllers
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Mongoose validation error handler
 */
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((val) => val.message);
  return {
    statusCode: 400,
    error: {
      code: ERROR_CODES.VALIDATION_ERROR,
      message: 'Validation Error',
      details: errors,
    },
  };
};

/**
 * Mongoose duplicate key error handler
 */
const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  return {
    statusCode: 409,
    error: {
      code: ERROR_CODES.VALIDATION_ERROR,
      message: `${field} already exists`,
      details: { field, value: err.keyValue[field] },
    },
  };
};

/**
 * Mongoose cast error handler (invalid ObjectId)
 */
const handleCastError = (err) => {
  return {
    statusCode: 400,
    error: {
      code: ERROR_CODES.VALIDATION_ERROR,
      message: `Invalid ${err.path}: ${err.value}`,
      details: { path: err.path, value: err.value },
    },
  };
};

/**
 * JWT error handler
 */
const handleJWTError = () => {
  return {
    statusCode: 401,
    error: {
      code: ERROR_CODES.UNAUTHORIZED,
      message: 'Invalid token. Please log in again.',
    },
  };
};

/**
 * JWT expiration error handler
 */
const handleJWTExpiredError = () => {
  return {
    statusCode: 401,
    error: {
      code: ERROR_CODES.UNAUTHORIZED,
      message: 'Your token has expired. Please log in again.',
    },
  };
};

/**
 * Main error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  let errorResponse;

  // Handle specific error types
  if (err.name === 'ValidationError') {
    errorResponse = handleValidationError(err);
  } else if (err.code === 11000) {
    errorResponse = handleDuplicateKeyError(err);
  } else if (err.name === 'CastError') {
    errorResponse = handleCastError(err);
  } else if (err.name === 'JsonWebTokenError') {
    errorResponse = handleJWTError();
  } else if (err.name === 'TokenExpiredError') {
    errorResponse = handleJWTExpiredError();
  } else if (err instanceof APIError) {
    errorResponse = {
      statusCode: err.statusCode,
      error: {
        code: err.errorCode || 'ERROR',
        message: err.message,
        details: err.details,
      },
    };
  } else {
    // Default error response
    errorResponse = {
      statusCode: err.statusCode,
      error: {
        code: 'INTERNAL_ERROR',
        message: process.env.NODE_ENV === 'production' 
          ? 'Something went wrong' 
          : err.message,
      },
    };
  }

  // Log error
  if (errorResponse.statusCode >= 500) {
    logger.error('Server Error:', {
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      ip: req.ip,
    });
  } else {
    logger.warn('Client Error:', {
      statusCode: errorResponse.statusCode,
      message: err.message,
      path: req.path,
      method: req.method,
      ip: req.ip,
    });
  }

  // Send response
  res.status(errorResponse.statusCode).json({
    success: false,
    ...errorResponse.error,
  });
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res, next) => {
  const error = new APIError(
    `Route ${req.originalUrl} not found`,
    404,
    ERROR_CODES.NOT_FOUND
  );
  next(error);
};

module.exports = {
  APIError,
  asyncHandler,
  errorHandler,
  notFoundHandler,
};
