/**
 * Database Seeder
 * Usage: node scripts/seed.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Order = require('../models/Order');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/arbpay');
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({ role: { $ne: 'admin' } });
    await Wallet.deleteMany({});
    await Order.deleteMany({});

    // Create test users
    console.log('Creating test users...');
    
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const users = [
      {
        name: 'Rahul Sharma',
        email: 'rahul.sharma@email.com',
        phone: '+919876543210',
        password: hashedPassword,
        referralCode: 'RAHUL123',
        kycStatus: 'verified',
        kycVerifiedAt: new Date(),
        isActive: true
      },
      {
        name: 'Priya Patel',
        email: 'priya.patel@email.com',
        phone: '+919876543211',
        password: hashedPassword,
        referralCode: 'PRIYA456',
        kycStatus: 'verified',
        kycVerifiedAt: new Date(),
        isActive: true
      },
      {
        name: 'Amit Kumar',
        email: 'amit.kumar@email.com',
        phone: '+919876543212',
        password: hashedPassword,
        referralCode: 'AMIT789',
        kycStatus: 'pending',
        isActive: true
      }
    ];

    for (const userData of users) {
      const user = new User(userData);
      await user.save();

      // Create wallet with some balance
      const wallet = new Wallet({
        userId: user._id,
        usdtBalance: Math.floor(Math.random() * 1000) + 100,
        inrBalance: Math.floor(Math.random() * 50000) + 10000,
        usdtLocked: 0,
        inrLocked: 0
      });
      await wallet.save();

      console.log(`Created user: ${userData.email}`);
    }

    // Create some sample orders
    console.log('Creating sample orders...');
    
    const sampleOrders = [
      {
        userId: (await User.findOne({ email: 'rahul.sharma@email.com' }))._id,
        type: 'sell',
        cryptoCurrency: 'USDT',
        fiatCurrency: 'INR',
        amount: 100,
        price: 86.5,
        total: 8650,
        paymentMethods: ['upi'],
        status: 'active'
      },
      {
        userId: (await User.findOne({ email: 'priya.patel@email.com' }))._id,
        type: 'buy',
        cryptoCurrency: 'USDT',
        fiatCurrency: 'INR',
        amount: 50,
        price: 86.2,
        total: 4310,
        paymentMethods: ['upi', 'bank_transfer'],
        status: 'active'
      }
    ];

    for (const orderData of sampleOrders) {
      const order = new Order(orderData);
      await order.save();
    }

    console.log('\n✅ Database seeded successfully!');
    console.log('\nTest Users:');
    console.log('  rahul.sharma@email.com / password123');
    console.log('  priya.patel@email.com / password123');
    console.log('  amit.kumar@email.com / password123');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seed();
