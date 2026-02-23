/**
 * USDT P2P Trading Platform - Seed Data
 * Test data for development and testing
 * 
 * @author Database Architect
 * @version 1.0.0
 */

// Use the database
use('usdt_p2p_platform');

// Clear existing data
db.users.deleteMany({});
db.wallets.deleteMany({});
db.transactions.deleteMany({});
db.orders.deleteMany({});
db.trades.deleteMany({});
db.upi_payments.deleteMany({});
db.bank_details.deleteMany({});
db.referrals.deleteMany({});
db.referral_bonuses.deleteMany({});
db.admin_logs.deleteMany({});
db.kyc_verifications.deleteMany({});
db.notifications.deleteMany({});
db.settings.deleteMany({});
db.price_alerts.deleteMany({});
db.chat_messages.deleteMany({});

print('Cleared all collections');

// ============================================
// HELPER FUNCTIONS
// ============================================

function generateReferralCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function generateObjectId() {
  return new ObjectId();
}

function dateDaysAgo(days) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function dateHoursAgo(hours) {
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}

function dateMinutesAgo(minutes) {
  return new Date(Date.now() - minutes * 60 * 1000);
}

// ============================================
// 1. USERS - Create test users
// ============================================

const users = [];
const userIds = [];

// Admin users
const adminId = generateObjectId();
users.push({
  _id: adminId,
  email: 'admin@arbpay.me',
  phone: '9876543210',
  password_hash: '$2b$12$K0ByB.6YI2/OYrB4fQOYLe6QdRg6XnYlYqYqYqYqYqYqYqYqYqYqYq',
  first_name: 'System',
  last_name: 'Admin',
  display_name: 'Admin',
  email_verified: true,
  phone_verified: true,
  kyc_status: 'verified',
  kyc_submitted_at: dateDaysAgo(30),
  kyc_verified_at: dateDaysAgo(28),
  pan_number: 'ABCDE1234F',
  pan_verified: true,
  aadhaar_number: '123456789012',
  aadhaar_verified: true,
  status: 'active',
  total_trades: 0,
  successful_trades: 0,
  trade_volume_usdt: NumberDecimal('0'),
  trade_volume_inr: NumberDecimal('0'),
  completion_rate: NumberDecimal('0'),
  referral_code: 'ADMIN001',
  referral_count: 0,
  total_referral_earnings: NumberDecimal('0'),
  last_login_at: dateHoursAgo(2),
  last_login_ip: '192.168.1.1',
  created_at: dateDaysAgo(60),
  updated_at: dateHoursAgo(2)
});
userIds.push(adminId);

// Regular users with different statuses
const userData = [
  { email: 'rahul.sharma@email.com', phone: '9876501234', first: 'Rahul', last: 'Sharma', status: 'active', kyc: 'verified' },
  { email: 'priya.patel@email.com', phone: '9876501235', first: 'Priya', last: 'Patel', status: 'active', kyc: 'verified' },
  { email: 'amit.kumar@email.com', phone: '9876501236', first: 'Amit', last: 'Kumar', status: 'active', kyc: 'verified' },
  { email: 'sneha.gupta@email.com', phone: '9876501237', first: 'Sneha', last: 'Gupta', status: 'active', kyc: 'pending' },
  { email: 'vikram.singh@email.com', phone: '9876501238', first: 'Vikram', last: 'Singh', status: 'active', kyc: 'not_submitted' },
  { email: 'neha.reddy@email.com', phone: '9876501239', first: 'Neha', last: 'Reddy', status: 'suspended', kyc: 'verified' },
  { email: 'arjun.nair@email.com', phone: '9876501240', first: 'Arjun', last: 'Nair', status: 'active', kyc: 'verified' },
  { email: 'deepa.menon@email.com', phone: '9876501241', first: 'Deepa', last: 'Menon', status: 'active', kyc: 'verified' },
  { email: 'karthik.iyer@email.com', phone: '9876501242', first: 'Karthik', last: 'Iyer', status: 'active', kyc: 'verified' },
  { email: 'ananya.bose@email.com', phone: '9876501243', first: 'Ananya', last: 'Bose', status: 'active', kyc: 'verified' }
];

userData.forEach((u, i) => {
  const userId = generateObjectId();
  const panNum = String.fromCharCode(65 + i) + 'BCDE' + (1234 + i) + String.fromCharCode(70 + i);
  const aadhaarNum = String(123456789012 + i);
  
  users.push({
    _id: userId,
    email: u.email,
    phone: u.phone,
    password_hash: '$2b$12$K0ByB.6YI2/OYrB4fQOYLe6QdRg6XnYlYqYqYqYqYqYqYqYqYqYqYq',
    first_name: u.first,
    last_name: u.last,
    display_name: `${u.first} ${u.last}`,
    email_verified: true,
    phone_verified: true,
    two_factor_enabled: i % 3 === 0,
    kyc_status: u.kyc,
    kyc_submitted_at: u.kyc !== 'not_submitted' ? dateDaysAgo(20 - i) : null,
    kyc_verified_at: u.kyc === 'verified' ? dateDaysAgo(18 - i) : null,
    pan_number: u.kyc !== 'not_submitted' ? panNum : null,
    pan_verified: u.kyc === 'verified',
    aadhaar_number: u.kyc !== 'not_submitted' ? aadhaarNum : null,
    aadhaar_verified: u.kyc === 'verified',
    status: u.status,
    total_trades: Math.floor(Math.random() * 100) + 10,
    successful_trades: Math.floor(Math.random() * 80) + 5,
    trade_volume_usdt: NumberDecimal((Math.random() * 50000 + 5000).toFixed(2)),
    trade_volume_inr: NumberDecimal((Math.random() * 4000000 + 400000).toFixed(2)),
    completion_rate: NumberDecimal((Math.random() * 20 + 80).toFixed(2)),
    average_release_time: Math.floor(Math.random() * 15) + 3,
    referral_code: generateReferralCode(),
    referred_by: i > 0 && i < 5 ? userIds[Math.floor(Math.random() * i)] : null,
    referral_count: Math.floor(Math.random() * 10),
    total_referral_earnings: NumberDecimal((Math.random() * 5000).toFixed(2)),
    last_login_at: dateHoursAgo(Math.floor(Math.random() * 48)),
    last_login_ip: `192.168.1.${10 + i}`,
    login_attempts: 0,
    trusted_devices: [
      {
        device_id: `device_${i}_1`,
        device_name: 'Chrome on Windows',
        last_used: dateHoursAgo(Math.floor(Math.random() * 24)),
        ip_address: `192.168.1.${10 + i}`
      }
    ],
    created_at: dateDaysAgo(60 - i * 3),
    updated_at: dateHoursAgo(Math.floor(Math.random() * 24))
  });
  userIds.push(userId);
});

db.users.insertMany(users);
print(`Inserted ${users.length} users`);

// ============================================
// 2. WALLETS - Create wallets for users
// ============================================

const wallets = [];

userIds.forEach((userId, i) => {
  const usdtBalance = i === 0 ? 1000000 : Math.random() * 50000 + 1000; // Admin has more
  const inrBalance = i === 0 ? 10000000 : Math.random() * 500000 + 10000;
  
  wallets.push({
    _id: generateObjectId(),
    user_id: userId,
    balances: {
      USDT: {
        available: NumberDecimal(usdtBalance.toFixed(2)),
        frozen: NumberDecimal('0'),
        total: NumberDecimal(usdtBalance.toFixed(2))
      },
      INR: {
        available: NumberDecimal(inrBalance.toFixed(2)),
        frozen: NumberDecimal('0'),
        total: NumberDecimal(inrBalance.toFixed(2))
      }
    },
    version: 1,
    daily_limits: {
      withdrawal_usdt: NumberDecimal('100000'),
      withdrawal_inr: NumberDecimal('1000000'),
      deposit_usdt: NumberDecimal('100000'),
      deposit_inr: NumberDecimal('1000000')
    },
    daily_usage: {
      date: new Date(),
      withdrawal_usdt: NumberDecimal('0'),
      withdrawal_inr: NumberDecimal('0'),
      deposit_usdt: NumberDecimal('0'),
      deposit_inr: NumberDecimal('0')
    },
    created_at: dateDaysAgo(60 - i * 3),
    updated_at: dateHoursAgo(Math.floor(Math.random() * 24))
  });
});

db.wallets.insertMany(wallets);
print(`Inserted ${wallets.length} wallets`);

// ============================================
// 3. UPI PAYMENTS - Create UPI details
// ============================================

const upiPayments = [];
const upiIds = [];

userIds.slice(1).forEach((userId, i) => {  // Skip admin
  const upiId = generateObjectId();
  const providers = ['GOOGLE_PAY', 'PHONEPE', 'PAYTM', 'BHIM'];
  
  upiPayments.push({
    _id: upiId,
    user_id: userId,
    upi_id: `${users[i + 1].first_name.toLowerCase()}.${users[i + 1].last_name.toLowerCase()}@${providers[i % 4].toLowerCase().replace('_', '')}`,
    upi_provider: providers[i % 4],
    qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=user${i}@upi`,
    status: i % 5 === 0 ? 'pending' : 'verified',
    verified_at: i % 5 === 0 ? null : dateDaysAgo(15),
    verified_by: adminId,
    total_received: NumberDecimal((Math.random() * 500000).toFixed(2)),
    transaction_count: Math.floor(Math.random() * 100) + 10,
    last_used_at: dateHoursAgo(Math.floor(Math.random() * 48)),
    display_name: `${users[i + 1].first_name}'s UPI`,
    is_primary: true,
    is_active: true,
    created_at: dateDaysAgo(30),
    updated_at: dateHoursAgo(Math.floor(Math.random() * 24))
  });
  upiIds.push(upiId);
});

db.upi_payments.insertMany(upiPayments);
print(`Inserted ${upiPayments.length} UPI payments`);

// ============================================
// 4. BANK DETAILS - Create bank accounts
// ============================================

const bankDetails = [];
const bankIds = [];

const banks = ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra Bank'];
const ifscPrefixes = ['SBIN', 'HDFC', 'ICIC', 'UTIB', 'KKBK'];

userIds.slice(1).forEach((userId, i) => {  // Skip admin
  const bankId = generateObjectId();
  const bankIndex = i % 5;
  
  bankDetails.push({
    _id: bankId,
    user_id: userId,
    account_number: String(12345678901 + i * 1000000000),
    ifsc_code: `${ifscPrefixes[bankIndex]}0${String(123456 + i).padStart(6, '0')}`,
    account_holder_name: `${users[i + 1].first_name} ${users[i + 1].last_name}`,
    bank_name: banks[bankIndex],
    branch_name: `${['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad'][i % 5]} Main Branch`,
    branch_address: `123 ${['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad'][i % 5]} Road`,
    account_type: i % 4 === 0 ? 'CURRENT' : 'SAVINGS',
    status: 'verified',
    verified_at: dateDaysAgo(15),
    verified_by: adminId,
    total_withdrawn: NumberDecimal((Math.random() * 200000).toFixed(2)),
    withdrawal_count: Math.floor(Math.random() * 50) + 5,
    last_used_at: dateHoursAgo(Math.floor(Math.random() * 72)),
    display_name: `${banks[bankIndex]} - ${['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad'][i % 5]}`,
    is_primary: true,
    is_active: true,
    created_at: dateDaysAgo(30),
    updated_at: dateHoursAgo(Math.floor(Math.random() * 24))
  });
  bankIds.push(bankId);
});

db.bank_details.insertMany(bankDetails);
print(`Inserted ${bankDetails.length} bank details`);

// ============================================
// 5. ORDERS - Create buy/sell orders
// ============================================

const orders = [];
const orderIds = [];

// Create active buy orders
for (let i = 0; i < 15; i++) {
  const orderId = generateObjectId();
  const userIndex = 1 + (i % 8);  // Skip admin and some users
  const price = 82 + (Math.random() * 3);  // INR per USDT
  const cryptoAmount = Math.random() * 5000 + 500;
  const fiatAmount = cryptoAmount * price;
  
  orders.push({
    _id: orderId,
    user_id: userIds[userIndex],
    type: i % 2 === 0 ? 'buy' : 'sell',
    crypto_currency: 'USDT',
    fiat_currency: 'INR',
    crypto_amount: NumberDecimal(cryptoAmount.toFixed(2)),
    fiat_amount: NumberDecimal(fiatAmount.toFixed(2)),
    price_per_unit: NumberDecimal(price.toFixed(2)),
    min_order_amount: NumberDecimal('500'),
    max_order_amount: NumberDecimal(fiatAmount.toFixed(2)),
    status: i < 10 ? 'active' : (i < 12 ? 'partially_filled' : 'filled'),
    filled_crypto_amount: i < 10 ? NumberDecimal('0') : NumberDecimal((cryptoAmount * 0.5).toFixed(2)),
    filled_fiat_amount: i < 10 ? NumberDecimal('0') : NumberDecimal((fiatAmount * 0.5).toFixed(2)),
    remaining_crypto_amount: i < 10 ? NumberDecimal(cryptoAmount.toFixed(2)) : NumberDecimal((cryptoAmount * 0.5).toFixed(2)),
    payment_methods: ['UPI', 'BANK_TRANSFER'],
    upi_payments: [upiIds[userIndex - 1]],
    bank_accounts: [bankIds[userIndex - 1]],
    terms: 'Payment must be made within 15 minutes. Please share screenshot after payment.',
    auto_reply: 'Thank you for your order! Please make payment and share screenshot.',
    payment_time_limit: 15,
    release_time_limit: 10,
    require_verified: true,
    min_completion_rate: NumberDecimal('80'),
    min_trades: 5,
    is_visible: true,
    view_count: Math.floor(Math.random() * 100),
    trade_count: i < 10 ? 0 : Math.floor(Math.random() * 5) + 1,
    created_at: dateHoursAgo(Math.floor(Math.random() * 48)),
    updated_at: dateHoursAgo(Math.floor(Math.random() * 12)),
    expires_at: dateHoursAgo(-24)  // Expires in 24 hours
  });
  orderIds.push(orderId);
}

db.orders.insertMany(orders);
print(`Inserted ${orders.length} orders`);

// ============================================
// 6. TRADES - Create completed trades
// ============================================

const trades = [];
const tradeIds = [];

for (let i = 0; i < 20; i++) {
  const tradeId = generateObjectId();
  const orderIndex = i % orderIds.length;
  const order = orders[orderIndex];
  
  // Determine buyer and seller
  let buyerId, sellerId;
  if (order.type === 'sell') {
    buyerId = userIds[(i + 5) % userIds.length];  // Different user
    sellerId = order.user_id;
  } else {
    buyerId = order.user_id;
    sellerId = userIds[(i + 5) % userIds.length];
  }
  
  const statuses = ['completed', 'completed', 'completed', 'completed', 'pending_payment', 'payment_made', 'disputed', 'cancelled'];
  const status = statuses[i % statuses.length];
  
  const cryptoAmount = parseFloat(order.crypto_amount.toString()) * 0.3;
  const fiatAmount = cryptoAmount * parseFloat(order.price_per_unit.toString());
  const fee = fiatAmount * 0.005;  // 0.5% fee
  
  trades.push({
    _id: tradeId,
    order_id: orderIds[orderIndex],
    buyer_id: buyerId,
    seller_id: sellerId,
    type: order.type,
    crypto_amount: NumberDecimal(cryptoAmount.toFixed(2)),
    fiat_amount: NumberDecimal(fiatAmount.toFixed(2)),
    price_per_unit: order.price_per_unit,
    platform_fee: NumberDecimal(fee.toFixed(2)),
    platform_fee_percent: NumberDecimal('0.5'),
    status: status,
    payment_method: 'UPI',
    payment_reference: status !== 'pending_payment' ? `UPI${Date.now()}${i}` : null,
    payment_proof_url: ['payment_made', 'payment_confirmed', 'completed', 'disputed'].includes(status) ? `https://cdn.example.com/payment_${i}.jpg` : null,
    payment_made_at: ['payment_made', 'payment_confirmed', 'completed', 'disputed'].includes(status) ? dateMinutesAgo(30) : null,
    payment_confirmed_at: ['payment_confirmed', 'completed'].includes(status) ? dateMinutesAgo(20) : null,
    upi_payment_id: upiIds[0],
    pending_payment_until: dateMinutesAgo(-15),
    completed_at: status === 'completed' ? dateMinutesAgo(10) : null,
    cancelled_at: status === 'cancelled' ? dateMinutesAgo(20) : null,
    cancelled_by: status === 'cancelled' ? buyerId : null,
    cancellation_reason: status === 'cancelled' ? 'Buyer did not make payment' : null,
    disputed_at: status === 'disputed' ? dateMinutesAgo(15) : null,
    disputed_by: status === 'disputed' ? sellerId : null,
    dispute_reason: status === 'disputed' ? 'payment_not_received' : null,
    dispute_description: status === 'disputed' ? 'Buyer claims payment made but not received' : null,
    buyer_rated: status === 'completed' && i % 2 === 0,
    seller_rated: status === 'completed' && i % 3 === 0,
    buyer_rating: status === 'completed' && i % 2 === 0 ? Math.floor(Math.random() * 2) + 4 : null,
    seller_rating: status === 'completed' && i % 3 === 0 ? Math.floor(Math.random() * 2) + 4 : null,
    chat_room_id: `chat_${tradeId}`,
    created_at: dateHoursAgo(Math.floor(Math.random() * 48)),
    updated_at: dateMinutesAgo(Math.floor(Math.random() * 30))
  });
  tradeIds.push(tradeId);
}

db.trades.insertMany(trades);
print(`Inserted ${trades.length} trades`);

// ============================================
// 7. TRANSACTIONS - Create wallet transactions
// ============================================

const transactions = [];

userIds.slice(1).forEach((userId, i) => {
  // Deposit transactions
  for (let j = 0; j < 3; j++) {
    transactions.push({
      _id: generateObjectId(),
      user_id: userId,
      type: 'deposit',
      currency: j % 2 === 0 ? 'USDT' : 'INR',
      amount: NumberDecimal((Math.random() * 10000 + 1000).toFixed(2)),
      fee: NumberDecimal('0'),
      net_amount: NumberDecimal((Math.random() * 10000 + 1000).toFixed(2)),
      status: 'completed',
      payment_method: j % 2 === 0 ? 'BLOCKCHAIN' : 'UPI',
      blockchain_network: j % 2 === 0 ? 'TRC20' : null,
      from_address: j % 2 === 0 ? 'TX1234567890abcdef' : null,
      to_address: j % 2 === 0 ? 'TXabcdef1234567890' : null,
      upi_id: j % 2 !== 0 ? 'user@upi' : null,
      description: j % 2 === 0 ? 'USDT Deposit' : 'INR Deposit via UPI',
      confirmed_at: dateDaysAgo(j + 1),
      created_at: dateDaysAgo(j + 1),
      updated_at: dateDaysAgo(j + 1),
      completed_at: dateDaysAgo(j + 1)
    });
  }
  
  // Trade transactions
  for (let j = 0; j < 2; j++) {
    const isBuy = j % 2 === 0;
    transactions.push({
      _id: generateObjectId(),
      user_id: userId,
      type: isBuy ? 'trade_buy' : 'trade_sell',
      currency: isBuy ? 'USDT' : 'INR',
      amount: NumberDecimal((Math.random() * 5000 + 500).toFixed(2)),
      fee: NumberDecimal((Math.random() * 50).toFixed(2)),
      net_amount: NumberDecimal((Math.random() * 4950 + 500).toFixed(2)),
      status: 'completed',
      trade_id: tradeIds[Math.floor(Math.random() * tradeIds.length)],
      description: isBuy ? 'Bought USDT' : 'Sold USDT',
      created_at: dateHoursAgo(Math.floor(Math.random() * 48)),
      updated_at: dateHoursAgo(Math.floor(Math.random() * 24)),
      completed_at: dateHoursAgo(Math.floor(Math.random() * 24))
    });
  }
  
  // Referral bonus transactions
  if (i % 3 === 0) {
    transactions.push({
      _id: generateObjectId(),
      user_id: userId,
      type: 'referral_bonus',
      currency: 'USDT',
      amount: NumberDecimal((Math.random() * 100 + 10).toFixed(2)),
      fee: NumberDecimal('0'),
      net_amount: NumberDecimal((Math.random() * 100 + 10).toFixed(2)),
      status: 'completed',
      description: 'Referral bonus from Level 1 referral',
      created_at: dateDaysAgo(Math.floor(Math.random() * 10)),
      updated_at: dateDaysAgo(Math.floor(Math.random() * 10)),
      completed_at: dateDaysAgo(Math.floor(Math.random() * 10))
    });
  }
});

db.transactions.insertMany(transactions);
print(`Inserted ${transactions.length} transactions`);

// ============================================
// 8. REFERRALS - Create referral relationships
// ============================================

const referrals = [];
const referralIds = [];

// Create multi-level referral chain
// User 1 -> User 2 (Level 1)
// User 1 -> User 3 (Level 1)
// User 2 -> User 4 (Level 1 for User 2, Level 2 for User 1)
// etc.

for (let i = 1; i < userIds.length - 1; i++) {
  const referralId = generateObjectId();
  const referrerIndex = Math.floor(i / 2);
  
  // Calculate level based on referral chain
  let level = 1;
  if (i >= 4) level = 2;
  if (i >= 7) level = 3;
  
  const commissionRates = { 1: 0.5, 2: 0.25, 3: 0.1 };  // Percentage
  
  referrals.push({
    _id: referralId,
    referrer_id: userIds[referrerIndex],
    referred_id: userIds[i + 1],
    level: level,
    commission_rate: NumberDecimal(commissionRates[level].toString()),
    status: 'active',
    referral_code_used: users[referrerIndex + 1].referral_code,
    source: 'web',
    total_commission_earned: NumberDecimal((Math.random() * 5000).toFixed(2)),
    referred_user_trades: Math.floor(Math.random() * 50),
    referred_user_volume: NumberDecimal((Math.random() * 100000).toFixed(2)),
    created_at: dateDaysAgo(30 - i),
    updated_at: dateDaysAgo(Math.floor(Math.random() * 10))
  });
  referralIds.push(referralId);
}

db.referrals.insertMany(referrals);
print(`Inserted ${referrals.length} referrals`);

// ============================================
// 9. REFERRAL BONUSES - Create bonus records
// ============================================

const referralBonuses = [];

referralIds.forEach((refId, i) => {
  const referral = referrals[i];
  
  for (let j = 0; j < 3; j++) {
    const tradeAmount = Math.random() * 10000 + 1000;
    const commissionRate = parseFloat(referral.commission_rate.toString());
    const bonusAmount = tradeAmount * commissionRate / 100;
    
    referralBonuses.push({
      _id: generateObjectId(),
      referrer_id: referral.referrer_id,
      referred_id: referral.referred_id,
      referral_id: refId,
      trade_id: tradeIds[Math.floor(Math.random() * tradeIds.length)],
      level: referral.level,
      trade_amount: NumberDecimal(tradeAmount.toFixed(2)),
      commission_rate: referral.commission_rate,
      amount: NumberDecimal(bonusAmount.toFixed(2)),
      currency: 'USDT',
      status: 'credited',
      wallet_transaction_id: generateObjectId(),
      credited_at: dateDaysAgo(j + 1),
      created_at: dateDaysAgo(j + 1),
      updated_at: dateDaysAgo(j + 1)
    });
  }
});

db.referral_bonuses.insertMany(referralBonuses);
print(`Inserted ${referralBonuses.length} referral bonuses`);

// ============================================
// 10. KYC VERIFICATIONS - Create KYC records
// ============================================

const kycVerifications = [];

userIds.slice(1).forEach((userId, i) => {
  const user = users[i + 1];
  
  if (user.kyc_status !== 'not_submitted') {
    kycVerifications.push({
      _id: generateObjectId(),
      user_id: userId,
      status: user.kyc_status,
      submitted_at: user.kyc_submitted_at,
      reviewed_at: user.kyc_verified_at,
      reviewed_by: user.kyc_status === 'verified' ? adminId : null,
      full_name: user.display_name,
      date_of_birth: dateDaysAgo(365 * 25 + i * 100),
      gender: i % 3 === 0 ? 'MALE' : (i % 3 === 1 ? 'FEMALE' : 'OTHER'),
      address: {
        line1: `${123 + i} Main Street`,
        line2: `Apartment ${100 + i}`,
        city: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad'][i % 5],
        state: ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Telangana'][i % 5],
        pincode: String(400000 + i * 1000),
        country: 'India'
      },
      pan_number: user.pan_number,
      pan_document_url: `https://cdn.example.com/pan_${userId}.jpg`,
      pan_verified: user.pan_verified,
      pan_verified_at: user.kyc_verified_at,
      aadhaar_number: user.aadhaar_number,
      aadhaar_document_front_url: `https://cdn.example.com/aadhaar_front_${userId}.jpg`,
      aadhaar_document_back_url: `https://cdn.example.com/aadhaar_back_${userId}.jpg`,
      aadhaar_verified: user.aadhaar_verified,
      aadhaar_verified_at: user.kyc_verified_at,
      selfie_url: `https://cdn.example.com/selfie_${userId}.jpg`,
      selfie_verified: user.kyc_status === 'verified',
      liveness_check_passed: user.kyc_status === 'verified',
      liveness_score: user.kyc_status === 'verified' ? NumberDecimal('95.5') : null,
      face_match_score: user.kyc_status === 'verified' ? NumberDecimal('92.3') : null,
      rejection_reason: user.kyc_status === 'rejected' ? 'Document unclear' : null,
      resubmission_count: user.kyc_status === 'rejected' ? 1 : 0,
      verification_provider: 'Onfido',
      verification_reference: `ref_${Date.now()}_${i}`,
      admin_notes: user.kyc_status === 'verified' ? 'All documents verified successfully' : null,
      created_at: user.kyc_submitted_at,
      updated_at: user.kyc_verified_at || user.kyc_submitted_at
    });
  }
});

db.kyc_verifications.insertMany(kycVerifications);
print(`Inserted ${kycVerifications.length} KYC verifications`);

// ============================================
// 11. NOTIFICATIONS - Create notifications
// ============================================

const notifications = [];

userIds.slice(1).forEach((userId, i) => {
  const notificationTypes = [
    { type: 'KYC_STATUS', title: 'KYC Status Updated', message: 'Your KYC has been verified successfully!' },
    { type: 'TRADE_CREATED', title: 'New Trade', message: 'A new trade has been initiated for your order.' },
    { type: 'PAYMENT_RECEIVED', title: 'Payment Received', message: 'Payment has been received for your trade.' },
    { type: 'TRADE_COMPLETED', title: 'Trade Completed', message: 'Your trade has been completed successfully.' },
    { type: 'DEPOSIT_CONFIRMED', title: 'Deposit Confirmed', message: 'Your deposit has been confirmed and credited.' },
    { type: 'REFERRAL_BONUS', title: 'Referral Bonus', message: 'You have received a referral bonus!' }
  ];
  
  for (let j = 0; j < 5; j++) {
    const notif = notificationTypes[j % notificationTypes.length];
    notifications.push({
      _id: generateObjectId(),
      user_id: userId,
      type: notif.type,
      title: notif.title,
      message: notif.message,
      related_type: ['ORDER', 'TRADE', 'TRANSACTION', 'KYC', 'REFERRAL'][j % 5],
      related_id: generateObjectId(),
      is_read: j % 2 === 0,
      read_at: j % 2 === 0 ? dateHoursAgo(Math.floor(Math.random() * 24)) : null,
      channels: {
        in_app: true,
        email: j % 3 === 0,
        sms: j % 4 === 0,
        push: j % 5 === 0
      },
      priority: j % 5 === 0 ? 'high' : 'normal',
      created_at: dateHoursAgo(Math.floor(Math.random() * 72)),
      expires_at: dateDaysAgo(-30)
    });
  }
});

db.notifications.insertMany(notifications);
print(`Inserted ${notifications.length} notifications`);

// ============================================
// 12. ADMIN LOGS - Create audit logs
// ============================================

const adminLogs = [];

const actions = [
  'USER_SUSPEND', 'KYC_APPROVE', 'KYC_REJECT', 'UPI_VERIFY', 
  'BANK_VERIFY', 'ORDER_CANCEL', 'TRADE_RESOLVE', 'TRANSACTION_APPROVE'
];

actions.forEach((action, i) => {
  adminLogs.push({
    _id: generateObjectId(),
    admin_id: adminId,
    admin_email: 'admin@arbpay.me',
    admin_role: 'SUPER_ADMIN',
    action: action,
    target_type: ['USER', 'KYC', 'UPI', 'BANK', 'ORDER', 'TRADE', 'TRANSACTION'][i % 7],
    target_id: userIds[i + 1],
    target_email: users[i + 1].email,
    description: `${action} performed on ${users[i + 1].email}`,
    previous_values: { status: 'pending' },
    new_values: { status: 'verified' },
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    reason: 'Verified after document review',
    created_at: dateHoursAgo(Math.floor(Math.random() * 48))
  });
});

db.admin_logs.insertMany(adminLogs);
print(`Inserted ${adminLogs.length} admin logs`);

// ============================================
// 13. SETTINGS - Platform configuration
// ============================================

const settings = [
  {
    _id: generateObjectId(),
    key: 'trading_fees',
    value: {
      maker_fee: 0.5,
      taker_fee: 0.5,
      withdrawal_fee_usdt: 1,
      withdrawal_fee_inr: 0
    },
    description: 'Trading and withdrawal fees configuration',
    category: 'fees',
    updated_by: adminId,
    created_at: dateDaysAgo(30),
    updated_at: dateDaysAgo(5)
  },
  {
    _id: generateObjectId(),
    key: 'referral_commission',
    value: {
      level_1_rate: 0.5,
      level_2_rate: 0.25,
      level_3_rate: 0.1,
      min_trade_for_commission: 1000
    },
    description: 'Referral commission rates for different levels',
    category: 'referral',
    updated_by: adminId,
    created_at: dateDaysAgo(30),
    updated_at: dateDaysAgo(10)
  },
  {
    _id: generateObjectId(),
    key: 'kyc_settings',
    value: {
      require_kyc_for_trading: true,
      require_kyc_for_withdrawal: true,
      pan_verification_required: true,
      aadhaar_verification_required: true,
      selfie_verification_required: true
    },
    description: 'KYC verification requirements',
    category: 'kyc',
    updated_by: adminId,
    created_at: dateDaysAgo(30),
    updated_at: dateDaysAgo(15)
  },
  {
    _id: generateObjectId(),
    key: 'trading_limits',
    value: {
      min_order_amount_inr: 500,
      max_order_amount_inr: 500000,
      daily_withdrawal_limit_usdt: 100000,
      daily_withdrawal_limit_inr: 1000000,
      payment_time_limit_minutes: 15,
      release_time_limit_minutes: 10
    },
    description: 'Trading and withdrawal limits',
    category: 'limits',
    updated_by: adminId,
    created_at: dateDaysAgo(30),
    updated_at: dateDaysAgo(7)
  },
  {
    _id: generateObjectId(),
    key: 'platform_status',
    value: {
      trading_enabled: true,
      deposits_enabled: true,
      withdrawals_enabled: true,
      maintenance_mode: false,
      maintenance_message: ''
    },
    description: 'Platform operational status',
    category: 'system',
    updated_by: adminId,
    created_at: dateDaysAgo(30),
    updated_at: dateHoursAgo(2)
  }
];

db.settings.insertMany(settings);
print(`Inserted ${settings.length} settings`);

// ============================================
// 14. PRICE ALERTS - Create price alerts
// ============================================

const priceAlerts = [];

userIds.slice(1, 6).forEach((userId, i) => {
  priceAlerts.push({
    _id: generateObjectId(),
    user_id: userId,
    crypto_currency: 'USDT',
    fiat_currency: 'INR',
    target_price: NumberDecimal((82 + i).toFixed(2)),
    condition: i % 2 === 0 ? 'above' : 'below',
    status: 'active',
    created_at: dateDaysAgo(Math.floor(Math.random() * 10)),
    updated_at: dateDaysAgo(Math.floor(Math.random() * 5))
  });
});

db.price_alerts.insertMany(priceAlerts);
print(`Inserted ${priceAlerts.length} price alerts`);

// ============================================
// 15. CHAT MESSAGES - Create trade chat messages
// ============================================

const chatMessages = [];

tradeIds.slice(0, 5).forEach((tradeId, i) => {
  const trade = trades[i];
  
  for (let j = 0; j < 5; j++) {
    chatMessages.push({
      _id: generateObjectId(),
      trade_id: tradeId,
      sender_id: j % 2 === 0 ? trade.buyer_id : trade.seller_id,
      message: [
        'Hi, I have made the payment. Please check.',
        'Payment received. Releasing USDT now.',
        'Thank you for the quick trade!',
        'Please share payment screenshot.',
        'USDT released. Please confirm receipt.'
      ][j],
      message_type: j === 3 ? 'image' : 'text',
      attachment_url: j === 3 ? `https://cdn.example.com/payment_${i}_${j}.jpg` : null,
      is_read: j < 4,
      read_at: j < 4 ? dateMinutesAgo(10 - j) : null,
      created_at: dateMinutesAgo(30 - j * 5)
    });
  }
});

db.chat_messages.insertMany(chatMessages);
print(`Inserted ${chatMessages.length} chat messages`);

// ============================================
// SEED DATA SUMMARY
// ============================================

print('');
print('========================================');
print('Seed Data Insertion Complete');
print('========================================');
print('');
print('Collections populated:');
print(`  - users: ${db.users.countDocuments()} documents`);
print(`  - wallets: ${db.wallets.countDocuments()} documents`);
print(`  - transactions: ${db.transactions.countDocuments()} documents`);
print(`  - orders: ${db.orders.countDocuments()} documents`);
print(`  - trades: ${db.trades.countDocuments()} documents`);
print(`  - upi_payments: ${db.upi_payments.countDocuments()} documents`);
print(`  - bank_details: ${db.bank_details.countDocuments()} documents`);
print(`  - referrals: ${db.referrals.countDocuments()} documents`);
print(`  - referral_bonuses: ${db.referral_bonuses.countDocuments()} documents`);
print(`  - admin_logs: ${db.admin_logs.countDocuments()} documents`);
print(`  - kyc_verifications: ${db.kyc_verifications.countDocuments()} documents`);
print(`  - notifications: ${db.notifications.countDocuments()} documents`);
print(`  - settings: ${db.settings.countDocuments()} documents`);
print(`  - price_alerts: ${db.price_alerts.countDocuments()} documents`);
print(`  - chat_messages: ${db.chat_messages.countDocuments()} documents`);
print('');
print('========================================');
print('Test Users:');
print('  Admin: admin@arbpay.me / password123');
print('  User: rahul.sharma@email.com / password123');
print('========================================');
