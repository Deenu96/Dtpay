const mongoose = require('mongoose');
const { ORDER_TYPES, ORDER_STATUS, CURRENCIES, PAYMENT_METHODS, TRADING_LIMITS } = require('../utils/constants');
const { generateOrderId } = require('../utils/helpers');

/**
 * Order Schema - P2P Buy/Sell Orders
 */
const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(ORDER_TYPES),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.ACTIVE,
    },
    currencyFrom: {
      type: String,
      enum: Object.values(CURRENCIES),
      required: true,
    },
    currencyTo: {
      type: String,
      enum: Object.values(CURRENCIES),
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [TRADING_LIMITS.MIN_ORDER_AMOUNT_USDT, `Minimum order amount is ${TRADING_LIMITS.MIN_ORDER_AMOUNT_USDT} USDT`],
      max: [TRADING_LIMITS.MAX_ORDER_AMOUNT_USDT, `Maximum order amount is ${TRADING_LIMITS.MAX_ORDER_AMOUNT_USDT} USDT`],
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    totalValue: {
      type: Number,
      required: true,
    },
    minAmount: {
      type: Number,
      default: null,
    },
    maxAmount: {
      type: Number,
      default: null,
    },
    paymentMethods: [{
      type: String,
      enum: Object.values(PAYMENT_METHODS),
    }],
    paymentTimeLimit: {
      type: Number,
      default: 30, // minutes
    },
    terms: {
      type: String,
      maxlength: 500,
    },
    autoReply: {
      type: String,
      maxlength: 200,
    },
    margin: {
      type: Number,
      default: 0,
    },
    isFloatingPrice: {
      type: Boolean,
      default: false,
    },
    floatingPriceMargin: {
      type: Number,
      default: 0,
    },
    tradedAmount: {
      type: Number,
      default: 0,
    },
    remainingAmount: {
      type: Number,
      default: function() {
        return this.amount;
      },
    },
    tradesCount: {
      type: Number,
      default: 0,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    cancellationReason: {
      type: String,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
orderSchema.index({ orderId: 1 });
orderSchema.index({ user: 1, status: 1 });
orderSchema.index({ type: 1, status: 1, price: 1 });
orderSchema.index({ currencyFrom: 1, currencyTo: 1, status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ isFeatured: 1, status: 1 });

// Pre-save middleware to generate order ID and calculate values
orderSchema.pre('save', function (next) {
  if (this.isNew) {
    if (!this.orderId) {
      this.orderId = generateOrderId();
    }
    this.totalValue = this.amount * this.price;
    this.remainingAmount = this.amount;
    
    // Set default min/max if not provided
    if (!this.minAmount) {
      this.minAmount = TRADING_LIMITS.MIN_ORDER_AMOUNT_USDT;
    }
    if (!this.maxAmount || this.maxAmount > this.amount) {
      this.maxAmount = this.amount;
    }
  }
  next();
});

// Method to update remaining amount
orderSchema.methods.updateRemainingAmount = async function (tradedAmount) {
  this.tradedAmount += tradedAmount;
  this.remainingAmount = this.amount - this.tradedAmount;
  this.tradesCount += 1;
  
  // Auto-complete if fully traded
  if (this.remainingAmount <= 0) {
    this.status = ORDER_STATUS.COMPLETED;
    this.completedAt = new Date();
  }
  
  return this.save();
};

// Method to cancel order
orderSchema.methods.cancel = async function (userId, reason = null) {
  if (this.status !== ORDER_STATUS.ACTIVE) {
    throw new Error('Only active orders can be cancelled');
  }
  
  this.status = ORDER_STATUS.CANCELLED;
  this.cancelledAt = new Date();
  this.cancelledBy = userId;
  this.cancellationReason = reason;
  
  return this.save();
};

// Static method to get active order book
orderSchema.statics.getOrderBook = async function (type, options = {}) {
  const { limit = 50 } = options;
  
  const sortOrder = type === ORDER_TYPES.BUY ? -1 : 1;
  
  const orders = await this.find({
    type,
    status: ORDER_STATUS.ACTIVE,
    remainingAmount: { $gt: 0 },
  })
    .sort({ price: sortOrder, createdAt: 1 })
    .limit(limit)
    .populate('user', 'firstName lastName')
    .lean();
  
  return orders;
};

// Static method to find matching orders
orderSchema.statics.findMatchingOrders = async function (type, amount, price, options = {}) {
  const { excludeUserId } = options;
  
  const oppositeType = type === ORDER_TYPES.BUY ? ORDER_TYPES.SELL : ORDER_TYPES.BUY;
  
  const query = {
    type: oppositeType,
    status: ORDER_STATUS.ACTIVE,
    remainingAmount: { $gte: amount },
  };
  
  // Price matching logic
  if (type === ORDER_TYPES.BUY) {
    // When buying, match with sell orders at or below our price
    query.price = { $lte: price };
  } else {
    // When selling, match with buy orders at or above our price
    query.price = { $gte: price };
  }
  
  if (excludeUserId) {
    query.user = { $ne: excludeUserId };
  }
  
  const sortOrder = type === ORDER_TYPES.BUY ? 1 : -1;
  
  return this.find(query)
    .sort({ price: sortOrder, createdAt: 1 })
    .populate('user', 'firstName lastName')
    .limit(10);
};

module.exports = mongoose.model('Order', orderSchema);
