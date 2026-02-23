const mongoose = require('mongoose');
const { NOTIFICATION_TYPES } = require('../utils/constants');

/**
 * Notification Schema
 */
const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(NOTIFICATION_TYPES),
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
    // Related entity references
    metadata: {
      orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
      tradeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trade' },
      transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
      depositWithdrawId: { type: mongoose.Schema.Types.ObjectId },
      url: { type: String },
      additionalData: { type: mongoose.Schema.Types.Mixed },
    },
    // For push notifications
    sentViaPush: {
      type: Boolean,
      default: false,
    },
    pushSentAt: {
      type: Date,
      default: null,
    },
    // For email notifications
    sentViaEmail: {
      type: Boolean,
      default: false,
    },
    emailSentAt: {
      type: Date,
      default: null,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ isRead: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Method to mark as read
notificationSchema.methods.markAsRead = async function () {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Static method to create notification
notificationSchema.statics.createNotification = async function (data) {
  const notification = new this(data);
  return notification.save();
};

// Static method to get user's unread notifications
notificationSchema.statics.getUnreadNotifications = async function (userId, options = {}) {
  const { limit = 20 } = options;
  
  return this.find({
    user: userId,
    isRead: false,
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

// Static method to get user's notifications with pagination
notificationSchema.statics.getUserNotifications = async function (userId, options = {}) {
  const { page = 1, limit = 20, unreadOnly = false } = options;
  const skip = (page - 1) * limit;
  
  const query = { user: userId };
  if (unreadOnly) query.isRead = false;
  
  const [notifications, total, unreadCount] = await Promise.all([
    this.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    this.countDocuments(query),
    this.countDocuments({ user: userId, isRead: false }),
  ]);
  
  return {
    notifications,
    unreadCount,
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

// Static method to mark all as read
notificationSchema.statics.markAllAsRead = async function (userId) {
  return this.updateMany(
    { user: userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = async function (userId) {
  return this.countDocuments({ user: userId, isRead: false });
};

module.exports = mongoose.model('Notification', notificationSchema);
