/**
 * Create Admin User Script
 * Usage: node scripts/createAdmin.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const readline = require('readline');
require('dotenv').config();

const User = require('../models/User');
const Wallet = require('../models/Wallet');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/arbpay');
    console.log('Connected to MongoDB');

    // Get admin details
    console.log('\n=== Create Admin User ===\n');
    
    const name = await question('Full Name: ');
    const email = await question('Email: ');
    const phone = await question('Phone (+91xxxxxxxxxx): ');
    const password = await question('Password (min 8 chars): ');
    
    // Validate input
    if (!name || !email || !phone || !password) {
      console.log('Error: All fields are required');
      process.exit(1);
    }

    if (password.length < 8) {
      console.log('Error: Password must be at least 8 characters');
      process.exit(1);
    }

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      console.log('Error: User with this email or phone already exists');
      process.exit(1);
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate referral code
    const referralCode = 'ADMIN' + Math.random().toString(36).substring(2, 8).toUpperCase();

    // Create admin user
    const admin = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      referralCode,
      role: 'admin',
      isActive: true,
      kycStatus: 'verified',
      kycVerifiedAt: new Date(),
      tradingEnabled: true
    });

    await admin.save();

    // Create wallet for admin
    const wallet = new Wallet({
      userId: admin._id,
      usdtBalance: 0,
      inrBalance: 0,
      usdtLocked: 0,
      inrLocked: 0
    });

    await wallet.save();

    console.log('\n✅ Admin user created successfully!');
    console.log(`Email: ${email}`);
    console.log(`Referral Code: ${referralCode}`);
    console.log('\nYou can now login at http://localhost:5174');

  } catch (error) {
    console.error('Error creating admin:', error.message);
  } finally {
    rl.close();
    await mongoose.disconnect();
  }
}

createAdmin();
