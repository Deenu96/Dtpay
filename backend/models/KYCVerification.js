const mongoose = require('mongoose');
const { KYC_STATUS } = require('../utils/constants');

/**
 * KYC Verification Schema
 */
const kycVerificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: Object.values(KYC_STATUS),
      default: KYC_STATUS.PENDING,
    },
    // Personal Information
    panNumber: {
      type: String,
      required: true,
      uppercase: true,
      match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Please enter a valid PAN number'],
    },
    panCardImage: {
      type: String,
      required: true,
    },
    aadhaarNumber: {
      type: String,
      required: true,
      match: [/^[0-9]{12}$/, 'Please enter a valid Aadhaar number'],
    },
    aadhaarFrontImage: {
      type: String,
      required: true,
    },
    aadhaarBackImage: {
      type: String,
      required: true,
    },
    selfieImage: {
      type: String,
      required: true,
    },
    // Address Information
    address: {
      line1: { type: String, required: true },
      line2: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true, match: /^[0-9]{6}$/ },
      country: { type: String, default: 'India' },
    },
    // Verification Details
    submittedAt: {
      type: Date,
      default: Date.now,
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
    rejectedAt: {
      type: Date,
      default: null,
    },
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    notes: {
      type: String,
      default: null,
    },
    // Document verification status
    documentStatus: {
      pan: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
      aadhaar: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
      selfie: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
    },
    // Manual review flags
    requiresManualReview: {
      type: Boolean,
      default: false,
    },
    reviewPriority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
kycVerificationSchema.index({ user: 1 });
kycVerificationSchema.index({ status: 1, submittedAt: -1 });
kycVerificationSchema.index({ status: 1, requiresManualReview: 1 });

// Method to approve KYC
kycVerificationSchema.methods.approve = async function (adminId, notes = null) {
  this.status = KYC_STATUS.VERIFIED;
  this.verifiedAt = new Date();
  this.verifiedBy = adminId;
  this.documentStatus.pan = 'verified';
  this.documentStatus.aadhaar = 'verified';
  this.documentStatus.selfie = 'verified';
  if (notes) this.notes = notes;
  
  // Update user's KYC status
  await mongoose.model('User').findByIdAndUpdate(this.user, {
    kycStatus: KYC_STATUS.VERIFIED,
  });
  
  return this.save();
};

// Method to reject KYC
kycVerificationSchema.methods.reject = async function (adminId, reason, notes = null) {
  this.status = KYC_STATUS.REJECTED;
  this.rejectedAt = new Date();
  this.rejectedBy = adminId;
  this.rejectionReason = reason;
  if (notes) this.notes = notes;
  
  // Update user's KYC status
  await mongoose.model('User').findByIdAndUpdate(this.user, {
    kycStatus: KYC_STATUS.REJECTED,
  });
  
  return this.save();
};

// Static method to get pending KYCs
kycVerificationSchema.statics.getPendingKYCs = async function (options = {}) {
  const { page = 1, limit = 20, priority } = options;
  const skip = (page - 1) * limit;
  
  const query = { status: KYC_STATUS.PENDING };
  if (priority) query.reviewPriority = priority;
  
  const [kycs, total] = await Promise.all([
    this.find(query)
      .sort({ reviewPriority: -1, submittedAt: 1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'firstName lastName email phone')
      .lean(),
    this.countDocuments(query),
  ]);
  
  return {
    kycs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
};

module.exports = mongoose.model('KYCVerification', kycVerificationSchema);
