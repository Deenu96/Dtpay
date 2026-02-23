const mongoose = require('mongoose');
const { CURRENCIES } = require('../utils/constants');

/**
 * Wallet Schema - Stores user balances
 */
const walletSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    balances: {
      USDT: {
        available: { type: Number, default: 0, min: 0 },
        locked: { type: Number, default: 0, min: 0 },
        total: { type: Number, default: 0, min: 0 },
      },
      INR: {
        available: { type: Number, default: 0, min: 0 },
        locked: { type: Number, default: 0, min: 0 },
        total: { type: Number, default: 0, min: 0 },
      },
    },
    version: {
      type: Number,
      default: 0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    lockReason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
walletSchema.index({ user: 1 });
walletSchema.index({ 'balances.USDT.total': 1 });
walletSchema.index({ 'balances.INR.total': 1 });

// Pre-save middleware to update totals and version
walletSchema.pre('save', function (next) {
  // Calculate totals
  this.balances.USDT.total = this.balances.USDT.available + this.balances.USDT.locked;
  this.balances.INR.total = this.balances.INR.available + this.balances.INR.locked;
  
  // Increment version for optimistic locking
  if (this.isModified('balances')) {
    this.version += 1;
    this.lastUpdated = new Date();
  }
  
  next();
});

// Method to get balance
walletSchema.methods.getBalance = function (currency) {
  return this.balances[currency] || { available: 0, locked: 0, total: 0 };
};

// Method to check if sufficient balance
walletSchema.methods.hasSufficientBalance = function (currency, amount) {
  return this.balances[currency].available >= amount;
};

// Method to lock amount
walletSchema.methods.lockAmount = async function (currency, amount) {
  if (this.balances[currency].available < amount) {
    throw new Error(`Insufficient ${currency} balance`);
  }
  
  this.balances[currency].available -= amount;
  this.balances[currency].locked += amount;
  this.lastUpdated = new Date();
  
  return this.save();
};

// Method to unlock amount
walletSchema.methods.unlockAmount = async function (currency, amount) {
  if (this.balances[currency].locked < amount) {
    throw new Error(`Insufficient locked ${currency} balance`);
  }
  
  this.balances[currency].locked -= amount;
  this.balances[currency].available += amount;
  this.lastUpdated = new Date();
  
  return this.save();
};

// Method to deduct locked amount (after trade completion)
walletSchema.methods.deductLocked = async function (currency, amount) {
  if (this.balances[currency].locked < amount) {
    throw new Error(`Insufficient locked ${currency} balance`);
  }
  
  this.balances[currency].locked -= amount;
  this.lastUpdated = new Date();
  
  return this.save();
};

// Method to add available balance
walletSchema.methods.addBalance = async function (currency, amount) {
  this.balances[currency].available += amount;
  this.lastUpdated = new Date();
  
  return this.save();
};

// Method to deduct available balance
walletSchema.methods.deductBalance = async function (currency, amount) {
  if (this.balances[currency].available < amount) {
    throw new Error(`Insufficient ${currency} balance`);
  }
  
  this.balances[currency].available -= amount;
  this.lastUpdated = new Date();
  
  return this.save();
};

// Static method to get or create wallet
walletSchema.statics.getOrCreate = async function (userId) {
  let wallet = await this.findOne({ user: userId });
  
  if (!wallet) {
    wallet = await this.create({ user: userId });
  }
  
  return wallet;
};

module.exports = mongoose.model('Wallet', walletSchema);
