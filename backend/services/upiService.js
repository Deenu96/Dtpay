const UPIPayment = require('../models/UPIPayment');
const QRCode = require('qrcode');
const logger = require('../utils/logger');

/**
 * UPI Service - Handles UPI-related operations
 */

/**
 * Generate UPI QR code
 * @param {String} upiId - UPI ID
 * @param {String} name - Account holder name
 * @param {Number} amount - Amount (optional)
 * @param {String} transactionNote - Transaction note (optional)
 * @returns {String} QR code data URL
 */
const generateQRCode = async (upiId, name, amount = null, transactionNote = null) => {
  try {
    // Build UPI payment URL
    let upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(name)}`;
    
    if (amount) {
      upiUrl += `&am=${amount}`;
    }
    
    if (transactionNote) {
      upiUrl += `&tn=${encodeURIComponent(transactionNote)}`;
    }
    
    // Generate QR code
    const qrCodeDataUrl = await QRCode.toDataURL(upiUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
    
    return qrCodeDataUrl;
  } catch (error) {
    logger.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

/**
 * Generate QR code for a UPI account
 * @param {String} upiAccountId - UPI account ID
 * @param {Number} amount - Amount (optional)
 * @param {String} transactionNote - Transaction note (optional)
 * @returns {String} QR code data URL
 */
const generateQRCodeForAccount = async (upiAccountId, amount = null, transactionNote = null) => {
  try {
    const upiAccount = await UPIPayment.findById(upiAccountId);
    if (!upiAccount) {
      throw new Error('UPI account not found');
    }
    
    return generateQRCode(upiAccount.upiId, upiAccount.accountHolderName, amount, transactionNote);
  } catch (error) {
    logger.error('Error generating QR code for account:', error);
    throw error;
  }
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
 * Add UPI account for user
 * @param {String} userId - User ID
 * @param {Object} data - UPI account data
 * @returns {Object} Created UPI account
 */
const addUPIAccount = async (userId, data) => {
  try {
    // Validate UPI ID
    if (!validateUPIId(data.upiId)) {
      throw new Error('Invalid UPI ID format');
    }

    // Check if UPI already exists for this user
    const existing = await UPIPayment.findOne({
      user: userId,
      upiId: data.upiId.toLowerCase(),
    });

    if (existing) {
      throw new Error('UPI ID already added');
    }

    // Generate QR code
    const qrCodeUrl = await generateQRCode(data.upiId, data.accountHolderName);

    // Create UPI account
    const upiAccount = await UPIPayment.create({
      user: userId,
      upiId: data.upiId.toLowerCase(),
      accountHolderName: data.accountHolderName,
      bankName: data.bankName,
      qrCodeUrl,
      isDefault: data.isDefault || false,
    });

    logger.info(`UPI account added for user ${userId}: ${data.upiId}`);

    return upiAccount;
  } catch (error) {
    logger.error('Error adding UPI account:', error);
    throw error;
  }
};

/**
 * Get user's UPI accounts
 * @param {String} userId - User ID
 * @returns {Array} UPI accounts
 */
const getUserUPIAccounts = async (userId) => {
  try {
    return UPIPayment.getUserUPIs(userId);
  } catch (error) {
    logger.error('Error getting user UPI accounts:', error);
    throw error;
  }
};

/**
 * Delete UPI account
 * @param {String} upiId - UPI account ID
 * @param {String} userId - User ID (for verification)
 * @returns {Object} Deletion result
 */
const deleteUPIAccount = async (upiId, userId) => {
  try {
    const upiAccount = await UPIPayment.findOne({
      _id: upiId,
      user: userId,
    });

    if (!upiAccount) {
      throw new Error('UPI account not found');
    }

    // Soft delete by setting status to inactive
    upiAccount.status = 'inactive';
    await upiAccount.save();

    logger.info(`UPI account deleted: ${upiId}`);

    return { success: true, message: 'UPI account deleted' };
  } catch (error) {
    logger.error('Error deleting UPI account:', error);
    throw error;
  }
};

/**
 * Set default UPI account
 * @param {String} upiId - UPI account ID
 * @param {String} userId - User ID
 * @returns {Object} Updated UPI account
 */
const setDefaultUPIAccount = async (upiId, userId) => {
  try {
    const upiAccount = await UPIPayment.findOne({
      _id: upiId,
      user: userId,
      status: { $in: ['active', 'verified'] },
    });

    if (!upiAccount) {
      throw new Error('UPI account not found');
    }

    upiAccount.isDefault = true;
    await upiAccount.save();

    logger.info(`Default UPI account set for user ${userId}: ${upiId}`);

    return upiAccount;
  } catch (error) {
    logger.error('Error setting default UPI account:', error);
    throw error;
  }
};

/**
 * Verify UPI payment (manual verification for MVP)
 * @param {String} upiTransactionId - UPI transaction ID
 * @param {Number} amount - Expected amount
 * @returns {Object} Verification result
 */
const verifyUPIPayment = async (upiTransactionId, amount) => {
  try {
    // In a real implementation, this would integrate with a UPI verification API
    // For MVP, we return a placeholder response
    logger.info(`Verifying UPI payment: ${upiTransactionId} for amount ${amount}`);
    
    // Placeholder: Always return pending for manual verification
    return {
      verified: false,
      status: 'pending_verification',
      message: 'Payment is pending manual verification',
    };
  } catch (error) {
    logger.error('Error verifying UPI payment:', error);
    throw error;
  }
};

module.exports = {
  generateQRCode,
  generateQRCodeForAccount,
  validateUPIId,
  addUPIAccount,
  getUserUPIAccounts,
  deleteUPIAccount,
  setDefaultUPIAccount,
  verifyUPIPayment,
};
