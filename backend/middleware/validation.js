const { body, param, query, validationResult } = require('express-validator');
const { ERROR_CODES } = require('../utils/constants');
const { APIError } = require('./errorHandler');

/**
 * Validation middleware using express-validator
 */

/**
 * Handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
      value: err.value,
    }));

    return next(
      new APIError('Validation failed', 400, ERROR_CODES.VALIDATION_ERROR, errorMessages)
    );
  }
  next();
};

/**
 * Auth validation rules
 */
const authValidation = {
  register: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    body('firstName')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('First name must be between 2 and 50 characters')
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage('First name can only contain letters and spaces'),
    body('lastName')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Last name must be between 2 and 50 characters')
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage('Last name can only contain letters and spaces'),
    body('phone')
      .optional()
      .isMobilePhone('en-IN')
      .withMessage('Please provide a valid Indian phone number'),
    body('referralCode')
      .optional()
      .trim()
      .isLength({ min: 6, max: 10 })
      .withMessage('Invalid referral code'),
    handleValidationErrors,
  ],

  login: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
    handleValidationErrors,
  ],

  forgotPassword: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    handleValidationErrors,
  ],

  resetPassword: [
    body('token')
      .notEmpty()
      .withMessage('Reset token is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    body('confirmPassword')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords do not match');
        }
        return true;
      }),
    handleValidationErrors,
  ],

  refreshToken: [
    body('refreshToken')
      .notEmpty()
      .withMessage('Refresh token is required'),
    handleValidationErrors,
  ],
};

/**
 * User validation rules
 */
const userValidation = {
  updateProfile: [
    body('firstName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('First name must be between 2 and 50 characters'),
    body('lastName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Last name must be between 2 and 50 characters'),
    body('phone')
      .optional()
      .isMobilePhone('en-IN')
      .withMessage('Please provide a valid Indian phone number'),
    handleValidationErrors,
  ],

  kycSubmission: [
    body('panNumber')
      .trim()
      .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
      .withMessage('Please provide a valid PAN number'),
    body('aadhaarNumber')
      .trim()
      .matches(/^[0-9]{12}$/)
      .withMessage('Please provide a valid 12-digit Aadhaar number'),
    body('address.line1')
      .trim()
      .notEmpty()
      .withMessage('Address line 1 is required'),
    body('address.city')
      .trim()
      .notEmpty()
      .withMessage('City is required'),
    body('address.state')
      .trim()
      .notEmpty()
      .withMessage('State is required'),
    body('address.pincode')
      .trim()
      .matches(/^[0-9]{6}$/)
      .withMessage('Please provide a valid 6-digit pincode'),
    handleValidationErrors,
  ],

  changePassword: [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    handleValidationErrors,
  ],
};

/**
 * Order validation rules
 */
const orderValidation = {
  createOrder: [
    body('type')
      .isIn(['buy', 'sell'])
      .withMessage('Order type must be buy or sell'),
    body('amount')
      .isFloat({ min: 10, max: 10000 })
      .withMessage('Amount must be between 10 and 10000 USDT'),
    body('price')
      .isFloat({ min: 1 })
      .withMessage('Price must be greater than 0'),
    body('currencyFrom')
      .isIn(['USDT', 'INR'])
      .withMessage('Invalid currency'),
    body('currencyTo')
      .isIn(['USDT', 'INR'])
      .withMessage('Invalid currency'),
    body('paymentMethods')
      .isArray({ min: 1 })
      .withMessage('At least one payment method is required'),
    body('paymentMethods.*')
      .isIn(['upi', 'bank_transfer'])
      .withMessage('Invalid payment method'),
    body('minAmount')
      .optional()
      .isFloat({ min: 10 })
      .withMessage('Minimum amount must be at least 10 USDT'),
    body('maxAmount')
      .optional()
      .isFloat({ min: 10 })
      .withMessage('Maximum amount must be at least 10 USDT'),
    body('terms')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Terms cannot exceed 500 characters'),
    handleValidationErrors,
  ],

  listOrders: [
    query('type')
      .optional()
      .isIn(['buy', 'sell'])
      .withMessage('Invalid order type'),
    query('status')
      .optional()
      .isIn(['active', 'matched', 'completed', 'cancelled'])
      .withMessage('Invalid status'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    handleValidationErrors,
  ],

  orderId: [
    param('id')
      .isMongoId()
      .withMessage('Invalid order ID'),
    handleValidationErrors,
  ],

  cancelOrder: [
    param('id')
      .isMongoId()
      .withMessage('Invalid order ID'),
    body('reason')
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Reason cannot exceed 200 characters'),
    handleValidationErrors,
  ],
};

/**
 * Trade validation rules
 */
const tradeValidation = {
  acceptOrder: [
    param('id')
      .isMongoId()
      .withMessage('Invalid order ID'),
    body('amount')
      .isFloat({ min: 10 })
      .withMessage('Amount must be at least 10 USDT'),
    handleValidationErrors,
  ],

  confirmPayment: [
    param('id')
      .isMongoId()
      .withMessage('Invalid trade ID'),
    body('paymentReference')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Payment reference cannot exceed 100 characters'),
    handleValidationErrors,
  ],

  raiseDispute: [
    param('id')
      .isMongoId()
      .withMessage('Invalid trade ID'),
    body('reason')
      .trim()
      .notEmpty()
      .withMessage('Dispute reason is required')
      .isLength({ max: 500 })
      .withMessage('Reason cannot exceed 500 characters'),
    handleValidationErrors,
  ],

  addChatMessage: [
    param('id')
      .isMongoId()
      .withMessage('Invalid trade ID'),
    body('message')
      .trim()
      .notEmpty()
      .withMessage('Message is required')
      .isLength({ max: 1000 })
      .withMessage('Message cannot exceed 1000 characters'),
    handleValidationErrors,
  ],
};

/**
 * UPI validation rules
 */
const upiValidation = {
  addUPI: [
    body('upiId')
      .trim()
      .matches(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/)
      .withMessage('Please provide a valid UPI ID'),
    body('accountHolderName')
      .trim()
      .notEmpty()
      .withMessage('Account holder name is required')
      .isLength({ max: 100 })
      .withMessage('Name cannot exceed 100 characters'),
    body('bankName')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Bank name cannot exceed 100 characters'),
    body('isDefault')
      .optional()
      .isBoolean()
      .withMessage('isDefault must be a boolean'),
    handleValidationErrors,
  ],

  upiId: [
    param('id')
      .isMongoId()
      .withMessage('Invalid UPI ID'),
    handleValidationErrors,
  ],
};

/**
 * Deposit/Withdrawal validation rules
 */
const depositWithdrawValidation = {
  depositUPI: [
    body('amount')
      .isFloat({ min: 100 })
      .withMessage('Minimum deposit amount is 100 INR'),
    body('upiTransactionId')
      .trim()
      .notEmpty()
      .withMessage('UPI transaction ID is required'),
    handleValidationErrors,
  ],

  withdrawBank: [
    body('amount')
      .isFloat({ min: 500 })
      .withMessage('Minimum withdrawal amount is 500 INR'),
    body('bankDetailId')
      .isMongoId()
      .withMessage('Invalid bank account ID'),
    handleValidationErrors,
  ],
};

/**
 * Admin validation rules
 */
const adminValidation = {
  updateUserStatus: [
    param('id')
      .isMongoId()
      .withMessage('Invalid user ID'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean'),
    body('isBanned')
      .optional()
      .isBoolean()
      .withMessage('isBanned must be a boolean'),
    body('banReason')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Ban reason cannot exceed 500 characters'),
    handleValidationErrors,
  ],

  verifyKYC: [
    param('id')
      .isMongoId()
      .withMessage('Invalid KYC ID'),
    body('status')
      .isIn(['verified', 'rejected'])
      .withMessage('Status must be verified or rejected'),
    body('reason')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Reason cannot exceed 500 characters'),
    handleValidationErrors,
  ],

  adjustWallet: [
    param('userId')
      .isMongoId()
      .withMessage('Invalid user ID'),
    body('currency')
      .isIn(['USDT', 'INR'])
      .withMessage('Currency must be USDT or INR'),
    body('amount')
      .isFloat()
      .withMessage('Amount must be a number')
      .not()
      .equals('0')
      .withMessage('Amount cannot be zero'),
    body('reason')
      .trim()
      .notEmpty()
      .withMessage('Reason is required')
      .isLength({ max: 500 })
      .withMessage('Reason cannot exceed 500 characters'),
    handleValidationErrors,
  ],

  approveDepositWithdrawal: [
    param('id')
      .isMongoId()
      .withMessage('Invalid request ID'),
    body('notes')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Notes cannot exceed 500 characters'),
    handleValidationErrors,
  ],

  rejectDepositWithdrawal: [
    param('id')
      .isMongoId()
      .withMessage('Invalid request ID'),
    body('reason')
      .trim()
      .notEmpty()
      .withMessage('Rejection reason is required')
      .isLength({ max: 500 })
      .withMessage('Reason cannot exceed 500 characters'),
    handleValidationErrors,
  ],

  resolveDispute: [
    param('id')
      .isMongoId()
      .withMessage('Invalid trade ID'),
    body('resolution')
      .trim()
      .notEmpty()
      .withMessage('Resolution is required'),
    body('winnerId')
      .optional()
      .isMongoId()
      .withMessage('Invalid winner ID'),
    handleValidationErrors,
  ],
};

module.exports = {
  handleValidationErrors,
  authValidation,
  userValidation,
  orderValidation,
  tradeValidation,
  upiValidation,
  depositWithdrawValidation,
  adminValidation,
};
