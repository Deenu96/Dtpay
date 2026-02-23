const mongoose = require('mongoose');

/**
 * Bank Account Details Schema
 */
const bankDetailSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    accountHolderName: {
      type: String,
      required: [true, 'Account holder name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    accountNumber: {
      type: String,
      required: [true, 'Account number is required'],
      trim: true,
      match: [/^[0-9]{9,18}$/, 'Please enter a valid account number'],
    },
    ifscCode: {
      type: String,
      required: [true, 'IFSC code is required'],
      trim: true,
      uppercase: true,
      match: [/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Please enter a valid IFSC code'],
    },
    bankName: {
      type: String,
      required: [true, 'Bank name is required'],
      trim: true,
      maxlength: [100, 'Bank name cannot exceed 100 characters'],
    },
    branchName: {
      type: String,
      trim: true,
      maxlength: [100, 'Branch name cannot exceed 100 characters'],
    },
    accountType: {
      type: String,
      enum: ['savings', 'current'],
      default: 'savings',
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
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
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure unique account per user
bankDetailSchema.index({ user: 1, accountNumber: 1, ifscCode: 1 }, { unique: true });
bankDetailSchema.index({ user: 1, isActive: 1 });
bankDetailSchema.index({ isDefault: 1 });

// Pre-save middleware to handle default account
bankDetailSchema.pre('save', async function (next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

// Static method to get user's bank accounts
bankDetailSchema.statics.getUserBanks = async function (userId) {
  return this.find({
    user: userId,
    isActive: true,
  }).sort({ isDefault: -1, createdAt: -1 });
};

// Static method to get default bank for user
bankDetailSchema.statics.getDefaultBank = async function (userId) {
  return this.findOne({
    user: userId,
    isDefault: true,
    isActive: true,
  });
};

module.exports = mongoose.model('BankDetail', bankDetailSchema);
