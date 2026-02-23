const mongoose = require('mongoose');
const { UPI_STATUS } = require('../utils/constants');

/**
 * UPI Payment Account Schema
 */
const upiPaymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    upiId: {
      type: String,
      required: [true, 'UPI ID is required'],
      trim: true,
      match: [/^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/, 'Please enter a valid UPI ID'],
    },
    accountHolderName: {
      type: String,
      required: [true, 'Account holder name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    bankName: {
      type: String,
      trim: true,
      maxlength: [100, 'Bank name cannot exceed 100 characters'],
    },
    qrCodeUrl: {
      type: String,
      default: null,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: Object.values(UPI_STATUS),
      default: UPI_STATUS.ACTIVE,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    lastUsedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure unique UPI ID per user
upiPaymentSchema.index({ user: 1, upiId: 1 }, { unique: true });
upiPaymentSchema.index({ user: 1, status: 1 });
upiPaymentSchema.index({ isDefault: 1 });

// Pre-save middleware to handle default UPI
upiPaymentSchema.pre('save', async function (next) {
  if (this.isDefault) {
    // Set all other UPI IDs for this user as non-default
    await this.constructor.updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

// Method to mark as used
upiPaymentSchema.methods.markAsUsed = async function () {
  this.usageCount += 1;
  this.lastUsedAt = new Date();
  return this.save();
};

// Method to verify UPI
upiPaymentSchema.methods.verify = async function (adminId) {
  this.status = UPI_STATUS.VERIFIED;
  this.verifiedAt = new Date();
  this.verifiedBy = adminId;
  return this.save();
};

// Static method to get user's active UPI accounts
upiPaymentSchema.statics.getUserUPIs = async function (userId) {
  return this.find({
    user: userId,
    status: { $in: [UPI_STATUS.ACTIVE, UPI_STATUS.VERIFIED] },
  }).sort({ isDefault: -1, createdAt: -1 });
};

// Static method to get default UPI for user
upiPaymentSchema.statics.getDefaultUPI = async function (userId) {
  return this.findOne({
    user: userId,
    isDefault: true,
    status: { $in: [UPI_STATUS.ACTIVE, UPI_STATUS.VERIFIED] },
  });
};

module.exports = mongoose.model('UPIPayment', upiPaymentSchema);
