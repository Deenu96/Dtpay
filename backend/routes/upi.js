const express = require('express');
const router = express.Router();
const { upiController } = require('../controllers');
const { upiValidation } = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');

/**
 * UPI Routes
 * Base path: /api/upi
 */

// All UPI routes require authentication
router.use(authenticate);

// UPI account routes
router.get('/accounts', upiController.getUPIAccounts);
router.post('/accounts', upiValidation.addUPI, upiController.addUPIAccount);
router.delete('/accounts/:id', upiValidation.upiId, upiController.deleteUPIAccount);
router.put('/accounts/:id/default', upiValidation.upiId, upiController.setDefaultUPIAccount);

// QR code route
router.get('/qr-code/:id', upiValidation.upiId, upiController.generateQRCode);

module.exports = router;
