const crypto = require('crypto');

/**
 * Helper utility functions
 */

/**
 * Generate a unique referral code
 * @param {String} userId - User ID
 * @returns {String} Unique referral code
 */
const generateReferralCode = (userId) => {
  const hash = crypto.createHash('md5').update(userId).digest('hex');
  return hash.substring(0, 8).toUpperCase();
};

/**
 * Generate a unique order ID
 * @returns {String} Unique order ID
 */
const generateOrderId = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `ORD${timestamp}${random}`;
};

/**
 * Generate a unique trade ID
 * @returns {String} Unique trade ID
 */
const generateTradeId = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `TRD${timestamp}${random}`;
};

/**
 * Generate a unique transaction ID
 * @returns {String} Unique transaction ID
 */
const generateTransactionId = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `TXN${timestamp}${random}`;
};

/**
 * Format currency amount
 * @param {Number} amount - Amount to format
 * @param {String} currency - Currency code
 * @returns {String} Formatted amount
 */
const formatCurrency = (amount, currency = 'INR') => {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(amount);
};

/**
 * Calculate trading fee
 * @param {Number} amount - Trade amount
 * @param {Number} feePercentage - Fee percentage
 * @returns {Number} Calculated fee
 */
const calculateTradingFee = (amount, feePercentage = 0.1) => {
  return (amount * feePercentage) / 100;
};

/**
 * Calculate referral bonus
 * @param {Number} amount - Base amount
 * @param {Number} percentage - Referral percentage
 * @returns {Number} Calculated bonus
 */
const calculateReferralBonus = (amount, percentage) => {
  return (amount * percentage) / 100;
};

/**
 * Validate UPI ID format
 * @param {String} upiId - UPI ID to validate
 * @returns {Boolean} Validation result
 */
const validateUPIId = (upiId) => {
  const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
  return upiRegex.test(upiId);
};

/**
 * Validate PAN number format
 * @param {String} pan - PAN number to validate
 * @returns {Boolean} Validation result
 */
const validatePAN = (pan) => {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan);
};

/**
 * Validate Aadhaar number format
 * @param {String} aadhaar - Aadhaar number to validate
 * @returns {Boolean} Validation result
 */
const validateAadhaar = (aadhaar) => {
  const aadhaarRegex = /^[0-9]{12}$/;
  return aadhaarRegex.test(aadhaar);
};

/**
 * Mask sensitive data
 * @param {String} data - Data to mask
 * @param {Number} visibleStart - Characters to show at start
 * @param {Number} visibleEnd - Characters to show at end
 * @returns {String} Masked data
 */
const maskData = (data, visibleStart = 2, visibleEnd = 2) => {
  if (!data || data.length <= visibleStart + visibleEnd) {
    return data;
  }
  const start = data.substring(0, visibleStart);
  const end = data.substring(data.length - visibleEnd);
  const masked = '*'.repeat(data.length - visibleStart - visibleEnd);
  return `${start}${masked}${end}`;
};

/**
 * Generate random OTP
 * @param {Number} length - OTP length
 * @returns {String} Generated OTP
 */
const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

/**
 * Paginate array
 * @param {Array} array - Array to paginate
 * @param {Number} page - Page number
 * @param {Number} limit - Items per page
 * @returns {Object} Paginated result
 */
const paginate = (array, page = 1, limit = 10) => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  
  return {
    data: array.slice(startIndex, endIndex),
    pagination: {
      page,
      limit,
      total: array.length,
      totalPages: Math.ceil(array.length / limit),
      hasNext: endIndex < array.length,
      hasPrev: startIndex > 0,
    },
  };
};

/**
 * Calculate price with margin
 * @param {Number} basePrice - Base price
 * @param {Number} marginPercentage - Margin percentage
 * @param {String} type - 'buy' or 'sell'
 * @returns {Number} Calculated price
 */
const calculatePriceWithMargin = (basePrice, marginPercentage, type) => {
  const margin = (basePrice * marginPercentage) / 100;
  return type === 'buy' ? basePrice + margin : basePrice - margin;
};

/**
 * Deep clone object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Sleep/delay function
 * @param {Number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after delay
 */
const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Sanitize user input
 * @param {String} input - Input to sanitize
 * @returns {String} Sanitized input
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .replace(/[<>]/g, '')
    .trim()
    .replace(/\s+/g, ' ');
};

module.exports = {
  generateReferralCode,
  generateOrderId,
  generateTradeId,
  generateTransactionId,
  formatCurrency,
  calculateTradingFee,
  calculateReferralBonus,
  validateUPIId,
  validatePAN,
  validateAadhaar,
  maskData,
  generateOTP,
  paginate,
  calculatePriceWithMargin,
  deepClone,
  sleep,
  sanitizeInput,
};
