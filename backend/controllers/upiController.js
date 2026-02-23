const UPIPayment = require('../models/UPIPayment');
const { asyncHandler, APIError } = require('../middleware/errorHandler');
const { ERROR_CODES } = require('../utils/constants');
const upiService = require('../services/upiService');
const logger = require('../utils/logger');

/**
 * UPI Controller - Handles UPI account operations
 */

/**
 * Get user's UPI accounts
 * GET /api/upi/accounts
 */
const getUPIAccounts = asyncHandler(async (req, res) => {
  const userId = req.userId;

  const upiAccounts = await upiService.getUserUPIAccounts(userId);

  // Mask UPI IDs for security
  const maskedAccounts = upiAccounts.map(account => ({
    ...account.toObject(),
    upiId: maskUPIId(account.upiId),
  }));

  res.json({
    success: true,
    data: maskedAccounts,
  });
});

/**
 * Add new UPI account
 * POST /api/upi/accounts
 */
const addUPIAccount = asyncHandler(async (req, res) => {
  const { upiId, accountHolderName, bankName, isDefault } = req.body;
  const userId = req.userId;

  const upiAccount = await upiService.addUPIAccount(userId, {
    upiId,
    accountHolderName,
    bankName,
    isDefault,
  });

  logger.info(`UPI account added: ${upiAccount._id} for user ${userId}`);

  res.status(201).json({
    success: true,
    message: 'UPI account added successfully',
    data: {
      id: upiAccount._id,
      upiId: maskUPIId(upiAccount.upiId),
      accountHolderName: upiAccount.accountHolderName,
      bankName: upiAccount.bankName,
      isDefault: upiAccount.isDefault,
      qrCodeUrl: upiAccount.qrCodeUrl,
      status: upiAccount.status,
    },
  });
});

/**
 * Delete UPI account
 * DELETE /api/upi/accounts/:id
 */
const deleteUPIAccount = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  await upiService.deleteUPIAccount(id, userId);

  logger.info(`UPI account deleted: ${id} for user ${userId}`);

  res.json({
    success: true,
    message: 'UPI account deleted successfully',
  });
});

/**
 * Set default UPI account
 * PUT /api/upi/accounts/:id/default
 */
const setDefaultUPIAccount = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  const upiAccount = await upiService.setDefaultUPIAccount(id, userId);

  res.json({
    success: true,
    message: 'Default UPI account set successfully',
    data: {
      id: upiAccount._id,
      upiId: maskUPIId(upiAccount.upiId),
      isDefault: upiAccount.isDefault,
    },
  });
});

/**
 * Generate QR code for UPI account
 * GET /api/upi/qr-code/:id
 */
const generateQRCode = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { amount, note } = req.query;
  const userId = req.userId;

  // Verify user owns this UPI account
  const upiAccount = await UPIPayment.findOne({
    _id: id,
    user: userId,
  });

  if (!upiAccount) {
    throw new APIError('UPI account not found', 404, ERROR_CODES.NOT_FOUND);
  }

  const qrCode = await upiService.generateQRCodeForAccount(
    id,
    amount ? parseFloat(amount) : null,
    note
  );

  res.json({
    success: true,
    data: {
      qrCode,
      upiId: maskUPIId(upiAccount.upiId),
      amount: amount || null,
    },
  });
});

/**
 * Helper function to mask UPI ID
 * @param {String} upiId - UPI ID to mask
 * @returns {String} Masked UPI ID
 */
const maskUPIId = (upiId) => {
  if (!upiId) return '';
  const [username, provider] = upiId.split('@');
  if (!provider) return upiId;
  
  const maskedUsername = username.substring(0, 2) + '****' + username.substring(username.length - 2);
  return `${maskedUsername}@${provider}`;
};

module.exports = {
  getUPIAccounts,
  addUPIAccount,
  deleteUPIAccount,
  setDefaultUPIAccount,
  generateQRCode,
};
