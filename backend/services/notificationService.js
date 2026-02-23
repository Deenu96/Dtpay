const Notification = require('../models/Notification');
const User = require('../models/User');
const { emitToUser, emitToAdmins } = require('../config/socket');
const logger = require('../utils/logger');
const nodemailer = require('nodemailer');

/**
 * Notification Service - Handles all notifications
 */

// Configure email transporter
let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
};

/**
 * Create in-app notification
 * @param {Object} data - Notification data
 * @returns {Object} Created notification
 */
const createNotification = async (data) => {
  try {
    const notification = await Notification.createNotification(data);

    // Emit real-time notification
    emitToUser(data.user, 'notification', {
      id: notification._id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      createdAt: notification.createdAt,
    });

    return notification;
  } catch (error) {
    logger.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Send email notification
 * @param {String} to - Recipient email
 * @param {String} subject - Email subject
 * @param {String} html - Email HTML content
 * @returns {Object} Email send result
 */
const sendEmail = async (to, subject, html) => {
  try {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
      logger.warn('Email configuration not set, skipping email send');
      return { success: false, message: 'Email not configured' };
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'USDT P2P Platform <noreply@example.com>',
      to,
      subject,
      html,
    };

    const info = await getTransporter().sendMail(mailOptions);
    logger.info(`Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send welcome email
 * @param {String} email - User email
 * @param {String} firstName - User first name
 */
const sendWelcomeEmail = async (email, firstName) => {
  const subject = 'Welcome to USDT P2P Trading Platform';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Welcome to USDT P2P Trading Platform!</h2>
      <p>Hi ${firstName},</p>
      <p>Thank you for joining our platform. We're excited to have you on board!</p>
      <p>Get started by:</p>
      <ul>
        <li>Completing your KYC verification</li>
        <li>Adding your UPI or bank account</li>
        <li>Start trading USDT securely</li>
      </ul>
      <p>If you have any questions, feel free to contact our support team.</p>
      <p>Best regards,<br>USDT P2P Team</p>
    </div>
  `;

  return sendEmail(email, subject, html);
};

/**
 * Send KYC status email
 * @param {String} email - User email
 * @param {String} firstName - User first name
 * @param {String} status - KYC status (verified/rejected)
 * @param {String} reason - Rejection reason (if rejected)
 */
const sendKYCStatusEmail = async (email, firstName, status, reason = null) => {
  const isVerified = status === 'verified';
  const subject = isVerified 
    ? 'KYC Verification Approved' 
    : 'KYC Verification Rejected';
  
  const html = isVerified
    ? `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #28a745;">KYC Verification Approved!</h2>
        <p>Hi ${firstName},</p>
        <p>Congratulations! Your KYC verification has been approved.</p>
        <p>You can now start trading on our platform.</p>
        <p>Best regards,<br>USDT P2P Team</p>
      </div>
    `
    : `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc3545;">KYC Verification Rejected</h2>
        <p>Hi ${firstName},</p>
        <p>Unfortunately, your KYC verification was rejected.</p>
        <p><strong>Reason:</strong> ${reason || 'Documents did not meet our requirements'}</p>
        <p>Please resubmit your documents after making the necessary corrections.</p>
        <p>Best regards,<br>USDT P2P Team</p>
      </div>
    `;

  return sendEmail(email, subject, html);
};

/**
 * Send password reset email
 * @param {String} email - User email
 * @param {String} firstName - User first name
 * @param {String} resetToken - Password reset token
 */
const sendPasswordResetEmail = async (email, firstName, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  const subject = 'Password Reset Request';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Password Reset Request</h2>
      <p>Hi ${firstName},</p>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <p><a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
      <p>Or copy and paste this link: ${resetUrl}</p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <p>Best regards,<br>USDT P2P Team</p>
    </div>
  `;

  return sendEmail(email, subject, html);
};

/**
 * Send trade notification
 * @param {String} userId - User ID
 * @param {String} type - Notification type
 * @param {Object} trade - Trade data
 */
const sendTradeNotification = async (userId, type, trade) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    let title, message;

    switch (type) {
      case 'trade_started':
        title = 'New Trade Started';
        message = `A new trade of ${trade.amount} USDT has been initiated.`;
        break;
      case 'payment_received':
        title = 'Payment Received';
        message = `Payment for trade ${trade.tradeId} has been marked as received.`;
        break;
      case 'trade_completed':
        title = 'Trade Completed';
        message = `Trade ${trade.tradeId} has been completed successfully.`;
        break;
      case 'trade_cancelled':
        title = 'Trade Cancelled';
        message = `Trade ${trade.tradeId} has been cancelled.`;
        break;
      case 'dispute_raised':
        title = 'Dispute Raised';
        message = `A dispute has been raised for trade ${trade.tradeId}.`;
        break;
      default:
        title = 'Trade Update';
        message = `There is an update on your trade ${trade.tradeId}.`;
    }

    // Create in-app notification
    await createNotification({
      user: userId,
      type: 'trade_update',
      title,
      message,
      metadata: {
        tradeId: trade._id,
      },
    });

    // Send email if enabled
    if (user.preferences?.notifications?.trade !== false) {
      const subject = title;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">${title}</h2>
          <p>Hi ${user.firstName},</p>
          <p>${message}</p>
          <p>Trade ID: ${trade.tradeId}</p>
          <p>Amount: ${trade.amount} USDT</p>
          <p>Best regards,<br>USDT P2P Team</p>
        </div>
      `;
      await sendEmail(user.email, subject, html);
    }
  } catch (error) {
    logger.error('Error sending trade notification:', error);
  }
};

/**
 * Send deposit/withdrawal notification
 * @param {String} userId - User ID
 * @param {String} type - 'deposit' or 'withdrawal'
 * @param {Object} data - Transaction data
 */
const sendDepositWithdrawalNotification = async (userId, type, data) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const isDeposit = type === 'deposit';
    const title = isDeposit ? 'Deposit Update' : 'Withdrawal Update';
    const message = `Your ${type} of ${data.amount} ${data.currency} is ${data.status}.`;

    // Create in-app notification
    await createNotification({
      user: userId,
      type: isDeposit ? 'deposit_complete' : 'withdrawal_complete',
      title,
      message,
      metadata: {
        depositWithdrawId: data._id,
      },
    });

    // Send email if enabled
    if (user.preferences?.notifications?.email) {
      const subject = title;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">${title}</h2>
          <p>Hi ${user.firstName},</p>
          <p>${message}</p>
          <p>Request ID: ${data.requestId}</p>
          <p>Best regards,<br>USDT P2P Team</p>
        </div>
      `;
      await sendEmail(user.email, subject, html);
    }
  } catch (error) {
    logger.error('Error sending deposit/withdrawal notification:', error);
  }
};

/**
 * Send referral bonus notification
 * @param {String} userId - User ID
 * @param {Number} amount - Bonus amount
 * @param {Number} level - Referral level
 */
const sendReferralBonusNotification = async (userId, amount, level) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const title = 'Referral Bonus Credited';
    const message = `You received a Level ${level} referral bonus of ${amount} USDT!`;

    // Create in-app notification
    await createNotification({
      user: userId,
      type: 'referral_bonus',
      title,
      message,
    });

    // Send email if enabled
    if (user.preferences?.notifications?.email) {
      const subject = title;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #28a745;">${title}</h2>
          <p>Hi ${user.firstName},</p>
          <p>Great news! ${message}</p>
          <p>Keep referring to earn more!</p>
          <p>Best regards,<br>USDT P2P Team</p>
        </div>
      `;
      await sendEmail(user.email, subject, html);
    }
  } catch (error) {
    logger.error('Error sending referral bonus notification:', error);
  }
};

/**
 * Notify admins of important events
 * @param {String} event - Event type
 * @param {Object} data - Event data
 */
const notifyAdmins = async (event, data) => {
  try {
    emitToAdmins('admin:notification', {
      event,
      data,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error('Error notifying admins:', error);
  }
};

module.exports = {
  createNotification,
  sendEmail,
  sendWelcomeEmail,
  sendKYCStatusEmail,
  sendPasswordResetEmail,
  sendTradeNotification,
  sendDepositWithdrawalNotification,
  sendReferralBonusNotification,
  notifyAdmins,
};
