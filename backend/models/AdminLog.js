const mongoose = require('mongoose');

/**
 * Admin Activity Log Schema
 */
const adminLogSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    entityType: {
      type: String,
      required: true,
      enum: ['user', 'wallet', 'order', 'trade', 'kyc', 'deposit', 'withdrawal', 'referral', 'system', 'settings'],
    },
    entityId: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      required: true,
    },
    // Previous and new values for audit
    previousValues: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    newValues: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    // Metadata
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    // For sensitive operations requiring additional verification
    requiresReview: {
      type: Boolean,
      default: false,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
adminLogSchema.index({ admin: 1, createdAt: -1 });
adminLogSchema.index({ action: 1, createdAt: -1 });
adminLogSchema.index({ entityType: 1, entityId: 1 });
adminLogSchema.index({ createdAt: -1 });
adminLogSchema.index({ requiresReview: 1 });

// Static method to log action
adminLogSchema.statics.logAction = async function (data) {
  const log = new this(data);
  return log.save();
};

// Static method to get admin activity
adminLogSchema.statics.getAdminActivity = async function (adminId, options = {}) {
  const { page = 1, limit = 50 } = options;
  const skip = (page - 1) * limit;
  
  const [logs, total] = await Promise.all([
    this.find({ admin: adminId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    this.countDocuments({ admin: adminId }),
  ]);
  
  return {
    logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Static method to get all logs with filters
adminLogSchema.statics.getAllLogs = async function (filters = {}, options = {}) {
  const { page = 1, limit = 50 } = options;
  const skip = (page - 1) * limit;
  
  const query = {};
  if (filters.admin) query.admin = filters.admin;
  if (filters.action) query.action = filters.action;
  if (filters.entityType) query.entityType = filters.entityType;
  if (filters.entityId) query.entityId = filters.entityId;
  if (filters.startDate || filters.endDate) {
    query.createdAt = {};
    if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
    if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
  }
  
  const [logs, total] = await Promise.all([
    this.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('admin', 'firstName lastName email')
      .lean(),
    this.countDocuments(query),
  ]);
  
  return {
    logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

module.exports = mongoose.model('AdminLog', adminLogSchema);
