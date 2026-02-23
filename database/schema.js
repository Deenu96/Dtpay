/**
 * USDT P2P Trading Platform - MongoDB Database Schema
 * Platform: Similar to arbpay.me
 * Features: P2P USDT trading with UPI payments in India
 * 
 * @author Database Architect
 * @version 1.0.0
 */

// ============================================
// DATABASE: usdt_p2p_platform
// ============================================

// Use the database
use('usdt_p2p_platform');

// ============================================
// 1. USERS COLLECTION
// ============================================
// Stores user profiles, KYC details, authentication data, referral codes
// ============================================

db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'phone', 'password_hash', 'created_at', 'status'],
      properties: {
        // Basic Info
        _id: { bsonType: 'objectId' },
        email: { 
          bsonType: 'string', 
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$' 
        },
        phone: { 
          bsonType: 'string', 
          pattern: '^[6-9]\\d{9}$'  // Indian mobile format
        },
        password_hash: { bsonType: 'string' },
        
        // Profile
        first_name: { bsonType: 'string' },
        last_name: { bsonType: 'string' },
        display_name: { bsonType: 'string' },
        avatar_url: { bsonType: 'string' },
        
        // Authentication
        email_verified: { bsonType: 'bool', default: false },
        phone_verified: { bsonType: 'bool', default: false },
        two_factor_enabled: { bsonType: 'bool', default: false },
        two_factor_secret: { bsonType: 'string' },
        
        // KYC Information
        kyc_status: { 
          enum: ['not_submitted', 'pending', 'verified', 'rejected'],
          default: 'not_submitted'
        },
        kyc_submitted_at: { bsonType: 'date' },
        kyc_verified_at: { bsonType: 'date' },
        kyc_rejection_reason: { bsonType: 'string' },
        
        // PAN Card Details
        pan_number: { 
          bsonType: 'string',
          pattern: '^[A-Z]{5}[0-9]{4}[A-Z]{1}$'
        },
        pan_verified: { bsonType: 'bool', default: false },
        pan_document_url: { bsonType: 'string' },
        
        // Aadhaar Details
        aadhaar_number: { 
          bsonType: 'string',
          pattern: '^\\d{12}$'
        },
        aadhaar_verified: { bsonType: 'bool', default: false },
        aadhaar_document_front_url: { bsonType: 'string' },
        aadhaar_document_back_url: { bsonType: 'string' },
        
        // Account Status
        status: { 
          enum: ['active', 'inactive', 'suspended', 'banned'],
          default: 'active'
        },
        suspension_reason: { bsonType: 'string' },
        suspended_until: { bsonType: 'date' },
        
        // Trading Stats
        total_trades: { bsonType: 'int', default: 0 },
        successful_trades: { bsonType: 'int', default: 0 },
        trade_volume_usdt: { bsonType: 'decimal', default: 0 },
        trade_volume_inr: { bsonType: 'decimal', default: 0 },
        completion_rate: { bsonType: 'decimal', default: 0 },
        average_release_time: { bsonType: 'int', default: 0 },  // in minutes
        
        // Referral System
        referral_code: { bsonType: 'string' },
        referred_by: { bsonType: 'objectId' },  // user_id of referrer
        referral_count: { bsonType: 'int', default: 0 },
        total_referral_earnings: { bsonType: 'decimal', default: 0 },
        
        // Security
        last_login_at: { bsonType: 'date' },
        last_login_ip: { bsonType: 'string' },
        login_attempts: { bsonType: 'int', default: 0 },
        locked_until: { bsonType: 'date' },
        
        // Device/Session Info
        trusted_devices: {
          bsonType: 'array',
          items: {
            bsonType: 'object',
            properties: {
              device_id: { bsonType: 'string' },
              device_name: { bsonType: 'string' },
              last_used: { bsonType: 'date' },
              ip_address: { bsonType: 'string' }
            }
          }
        },
        
        // Timestamps
        created_at: { bsonType: 'date' },
        updated_at: { bsonType: 'date' },
        
        // Metadata
        metadata: { bsonType: 'object' }
      }
    }
  }
});

// Users Collection Indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ phone: 1 }, { unique: true });
db.users.createIndex({ referral_code: 1 }, { unique: true, sparse: true });
db.users.createIndex({ referred_by: 1 });
db.users.createIndex({ kyc_status: 1 });
db.users.createIndex({ status: 1 });
db.users.createIndex({ created_at: -1 });
db.users.createIndex({ pan_number: 1 }, { unique: true, sparse: true });
db.users.createIndex({ aadhaar_number: 1 }, { unique: true, sparse: true });

// ============================================
// 2. WALLETS COLLECTION
// ============================================
// Stores user wallet balances with optimistic locking for concurrency
// ============================================

db.createCollection('wallets', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['user_id', 'balances', 'version', 'created_at'],
      properties: {
        _id: { bsonType: 'objectId' },
        user_id: { bsonType: 'objectId' },
        
        // Balances for different currencies
        balances: {
          bsonType: 'object',
          required: ['USDT', 'INR'],
          properties: {
            USDT: {
              bsonType: 'object',
              required: ['available', 'frozen', 'total'],
              properties: {
                available: { bsonType: 'decimal', default: 0 },
                frozen: { bsonType: 'decimal', default: 0 },
                total: { bsonType: 'decimal', default: 0 }
              }
            },
            INR: {
              bsonType: 'object',
              required: ['available', 'frozen', 'total'],
              properties: {
                available: { bsonType: 'decimal', default: 0 },
                frozen: { bsonType: 'decimal', default: 0 },
                total: { bsonType: 'decimal', default: 0 }
              }
            }
          }
        },
        
        // Optimistic Locking for concurrency control
        version: { bsonType: 'int', default: 1 },
        
        // Daily limits
        daily_limits: {
          bsonType: 'object',
          properties: {
            withdrawal_usdt: { bsonType: 'decimal', default: 100000 },
            withdrawal_inr: { bsonType: 'decimal', default: 1000000 },
            deposit_usdt: { bsonType: 'decimal', default: 100000 },
            deposit_inr: { bsonType: 'decimal', default: 1000000 }
          }
        },
        
        // Daily usage tracking
        daily_usage: {
          bsonType: 'object',
          properties: {
            date: { bsonType: 'date' },
            withdrawal_usdt: { bsonType: 'decimal', default: 0 },
            withdrawal_inr: { bsonType: 'decimal', default: 0 },
            deposit_usdt: { bsonType: 'decimal', default: 0 },
            deposit_inr: { bsonType: 'decimal', default: 0 }
          }
        },
        
        created_at: { bsonType: 'date' },
        updated_at: { bsonType: 'date' }
      }
    }
  }
});

// Wallets Collection Indexes
db.wallets.createIndex({ user_id: 1 }, { unique: true });
db.wallets.createIndex({ 'balances.USDT.available': 1 });
db.wallets.createIndex({ 'balances.INR.available': 1 });

// ============================================
// 3. TRANSACTIONS COLLECTION
// ============================================
// Stores all wallet transactions with complete audit trail
// ============================================

db.createCollection('transactions', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['user_id', 'type', 'currency', 'amount', 'status', 'created_at'],
      properties: {
        _id: { bsonType: 'objectId' },
        user_id: { bsonType: 'objectId' },
        
        // Transaction Type
        type: {
          enum: [
            'deposit',           // Deposit to wallet
            'withdrawal',        // Withdrawal from wallet
            'transfer_in',       // Internal transfer received
            'transfer_out',      // Internal transfer sent
            'trade_buy',         // USDT purchase
            'trade_sell',        // USDT sale
            'fee',               // Trading fee
            'referral_bonus',    // Referral commission
            'refund',            // Refund
            'adjustment'         // Admin adjustment
          ]
        },
        
        // Currency and Amount
        currency: { enum: ['USDT', 'INR'] },
        amount: { bsonType: 'decimal' },
        fee: { bsonType: 'decimal', default: 0 },
        net_amount: { bsonType: 'decimal' },
        
        // Status
        status: {
          enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
          default: 'pending'
        },
        
        // Related Entities
        order_id: { bsonType: 'objectId' },      // For trade transactions
        trade_id: { bsonType: 'objectId' },      // For trade transactions
        referral_id: { bsonType: 'objectId' },   // For referral bonuses
        
        // External References
        external_tx_id: { bsonType: 'string' },  // Blockchain tx hash or bank ref
        external_provider: { bsonType: 'string' },
        
        // Balance Snapshots (for audit)
        balance_before: { bsonType: 'decimal' },
        balance_after: { bsonType: 'decimal' },
        
        // UPI/Bank Details (for deposits/withdrawals)
        payment_method: { enum: ['UPI', 'BANK_TRANSFER', 'BLOCKCHAIN', 'INTERNAL'] },
        upi_id: { bsonType: 'string' },
        bank_account_id: { bsonType: 'objectId' },
        
        // Blockchain Details
        blockchain_network: { bsonType: 'string' },
        from_address: { bsonType: 'string' },
        to_address: { bsonType: 'string' },
        
        // Description and Metadata
        description: { bsonType: 'string' },
        metadata: { bsonType: 'object' },
        
        // Failure Info
        failure_reason: { bsonType: 'string' },
        failed_at: { bsonType: 'date' },
        
        // Confirmation
        confirmed_at: { bsonType: 'date' },
        confirmed_by: { bsonType: 'objectId' },  // Admin user_id
        
        // Timestamps
        created_at: { bsonType: 'date' },
        updated_at: { bsonType: 'date' },
        completed_at: { bsonType: 'date' }
      }
    }
  }
});

// Transactions Collection Indexes
db.transactions.createIndex({ user_id: 1, created_at: -1 });
db.transactions.createIndex({ type: 1, status: 1 });
db.transactions.createIndex({ currency: 1, status: 1 });
db.transactions.createIndex({ external_tx_id: 1 }, { sparse: true });
db.transactions.createIndex({ order_id: 1 }, { sparse: true });
db.transactions.createIndex({ trade_id: 1 }, { sparse: true });
db.transactions.createIndex({ status: 1, created_at: 1 });  // For pending tx processing
db.transactions.createIndex({ created_at: -1 });

// ============================================
// 4. ORDERS COLLECTION (P2P Orders)
// ============================================
// Stores buy/sell orders for USDT P2P trading
// ============================================

db.createCollection('orders', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['user_id', 'type', 'crypto_currency', 'fiat_currency', 'amount', 'price', 'status', 'created_at'],
      properties: {
        _id: { bsonType: 'objectId' },
        user_id: { bsonType: 'objectId' },  // Order creator
        
        // Order Type
        type: { enum: ['buy', 'sell'] },  // buy = buy USDT, sell = sell USDT
        
        // Currencies
        crypto_currency: { enum: ['USDT'], default: 'USDT' },
        fiat_currency: { enum: ['INR'], default: 'INR' },
        
        // Amounts
        crypto_amount: { bsonType: 'decimal' },     // USDT amount
        fiat_amount: { bsonType: 'decimal' },       // INR amount
        price_per_unit: { bsonType: 'decimal' },    // Price per USDT in INR
        
        // Limits (for dynamic pricing)
        min_order_amount: { bsonType: 'decimal' },  // Minimum INR per trade
        max_order_amount: { bsonType: 'decimal' },  // Maximum INR per trade
        
        // Status
        status: {
          enum: ['active', 'partially_filled', 'filled', 'cancelled', 'expired'],
          default: 'active'
        },
        
        // Filled Amounts
        filled_crypto_amount: { bsonType: 'decimal', default: 0 },
        filled_fiat_amount: { bsonType: 'decimal', default: 0 },
        remaining_crypto_amount: { bsonType: 'decimal' },
        
        // Payment Methods Accepted
        payment_methods: {
          bsonType: 'array',
          items: { enum: ['UPI', 'BANK_TRANSFER', 'PAYTM', 'PHONEPE', 'GOOGLE_PAY'] },
          default: ['UPI']
        },
        
        // UPI Details (for sell orders - seller provides UPI)
        upi_payments: {
          bsonType: 'array',
          items: { bsonType: 'objectId' }  // References to UPI_Payments
        },
        
        // Bank Details (for sell orders)
        bank_accounts: {
          bsonType: 'array',
          items: { bsonType: 'objectId' }  // References to Bank_Details
        },
        
        // Terms and Conditions
        terms: { bsonType: 'string' },
        auto_reply: { bsonType: 'string' },
        
        // Time Limits (in minutes)
        payment_time_limit: { bsonType: 'int', default: 15 },    // Time to pay
        release_time_limit: { bsonType: 'int', default: 10 },    // Time to release
        
        // Counterparty Requirements
        require_verified: { bsonType: 'bool', default: true },
        min_completion_rate: { bsonType: 'decimal', default: 80 },
        min_trades: { bsonType: 'int', default: 0 },
        
        // Visibility
        is_visible: { bsonType: 'bool', default: true },
        visibility_expires_at: { bsonType: 'date' },
        
        // Statistics
        view_count: { bsonType: 'int', default: 0 },
        trade_count: { bsonType: 'int', default: 0 },
        
        // Cancellation
        cancelled_at: { bsonType: 'date' },
        cancelled_by: { bsonType: 'objectId' },
        cancellation_reason: { bsonType: 'string' },
        
        // Timestamps
        created_at: { bsonType: 'date' },
        updated_at: { bsonType: 'date' },
        expires_at: { bsonType: 'date' },
        
        // Metadata
        metadata: { bsonType: 'object' }
      }
    }
  }
});

// Orders Collection Indexes
db.orders.createIndex({ user_id: 1, status: 1, created_at: -1 });
db.orders.createIndex({ type: 1, status: 1, price_per_unit: 1 });  // For order matching
db.orders.createIndex({ status: 1, crypto_currency: 1, fiat_currency: 1 });
db.orders.createIndex({ status: 1, created_at: 1 });  // For expired order cleanup
db.orders.createIndex({ expires_at: 1 }, { expireAfterSeconds: 0 });  // TTL for expired orders

// ============================================
// 5. TRADES COLLECTION
// ============================================
// Stores completed/matched trades between buyers and sellers
// ============================================

db.createCollection('trades', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['order_id', 'buyer_id', 'seller_id', 'type', 'crypto_amount', 'price', 'status', 'created_at'],
      properties: {
        _id: { bsonType: 'objectId' },
        
        // Order Reference
        order_id: { bsonType: 'objectId' },
        
        // Participants
        buyer_id: { bsonType: 'objectId' },
        seller_id: { bsonType: 'objectId' },
        
        // Trade Type (opposite of order type)
        type: { enum: ['buy', 'sell'] },  // From order creator's perspective
        
        // Amounts
        crypto_amount: { bsonType: 'decimal' },      // USDT amount
        fiat_amount: { bsonType: 'decimal' },        // INR amount
        price_per_unit: { bsonType: 'decimal' },     // Price per USDT
        
        // Fees
        platform_fee: { bsonType: 'decimal', default: 0 },
        platform_fee_percent: { bsonType: 'decimal', default: 0.5 },  // 0.5%
        
        // Status
        status: {
          enum: [
            'pending_payment',      // Waiting for buyer to pay
            'payment_made',         // Buyer marked payment as made
            'payment_confirmed',    // Seller confirmed payment
            'disputed',             // Trade under dispute
            'completed',            // Trade completed successfully
            'cancelled',            // Trade cancelled
            'expired',              // Trade expired
            'refunded'              // Trade refunded
          ],
          default: 'pending_payment'
        },
        
        // Payment Details
        payment_method: { enum: ['UPI', 'BANK_TRANSFER', 'PAYTM', 'PHONEPE', 'GOOGLE_PAY'] },
        payment_reference: { bsonType: 'string' },  // UPI ref or bank txn id
        payment_proof_url: { bsonType: 'string' },  // Screenshot of payment
        payment_made_at: { bsonType: 'date' },
        payment_confirmed_at: { bsonType: 'date' },
        
        // UPI Details Used
        upi_payment_id: { bsonType: 'objectId' },
        bank_account_id: { bsonType: 'objectId' },
        
        // Timestamps for each stage
        pending_payment_until: { bsonType: 'date' },
        payment_made_at: { bsonType: 'date' },
        payment_confirmed_at: { bsonType: 'date' },
        completed_at: { bsonType: 'date' },
        cancelled_at: { bsonType: 'date' },
        expired_at: { bsonType: 'date' },
        
        // Cancellation Details
        cancelled_by: { bsonType: 'objectId' },
        cancellation_reason: { bsonType: 'string' },
        
        // Dispute Details
        disputed_at: { bsonType: 'date' },
        disputed_by: { bsonType: 'objectId' },
        dispute_reason: { bsonType: 'string' },
        dispute_description: { bsonType: 'string' },
        dispute_evidence_urls: { 
          bsonType: 'array',
          items: { bsonType: 'string' }
        },
        dispute_resolved_at: { bsonType: 'date' },
        dispute_resolved_by: { bsonType: 'objectId' },
        dispute_resolution: { bsonType: 'string' },
        dispute_winner: { enum: ['buyer', 'seller', 'none'] },
        
        // Ratings (after completion)
        buyer_rated: { bsonType: 'bool', default: false },
        seller_rated: { bsonType: 'bool', default: false },
        buyer_rating: { bsonType: 'int', minimum: 1, maximum: 5 },
        seller_rating: { bsonType: 'int', minimum: 1, maximum: 5 },
        buyer_review: { bsonType: 'string' },
        seller_review: { bsonType: 'string' },
        
        // Chat Messages Reference
        chat_room_id: { bsonType: 'string' },
        
        // Timestamps
        created_at: { bsonType: 'date' },
        updated_at: { bsonType: 'date' },
        
        // Metadata
        metadata: { bsonType: 'object' }
      }
    }
  }
});

// Trades Collection Indexes
db.trades.createIndex({ buyer_id: 1, created_at: -1 });
db.trades.createIndex({ seller_id: 1, created_at: -1 });
db.trades.createIndex({ order_id: 1 });
db.trades.createIndex({ status: 1, created_at: 1 });
db.trades.createIndex({ status: 1, pending_payment_until: 1 });  // For expiry processing
db.trades.createIndex({ disputed_at: -1 }, { sparse: true });  // For dispute queue

// ============================================
// 6. UPI_PAYMENTS COLLECTION
// ============================================
// Stores UPI payment details for each user
// ============================================

db.createCollection('upi_payments', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['user_id', 'upi_id', 'status', 'created_at'],
      properties: {
        _id: { bsonType: 'objectId' },
        user_id: { bsonType: 'objectId' },
        
        // UPI Details
        upi_id: { 
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._-]+@[a-zA-Z]+$'  // Basic UPI format
        },
        upi_provider: { 
          enum: ['GOOGLE_PAY', 'PHONEPE', 'PAYTM', 'BHIM', 'AMAZON_PAY', 'OTHER'],
          default: 'OTHER'
        },
        
        // QR Code
        qr_code_url: { bsonType: 'string' },
        qr_code_data: { bsonType: 'string' },  // Base64 encoded QR
        
        // Verification
        status: {
          enum: ['pending', 'verified', 'rejected'],
          default: 'pending'
        },
        verified_at: { bsonType: 'date' },
        verified_by: { bsonType: 'objectId' },
        rejection_reason: { bsonType: 'string' },
        
        // Verification Payment (small test payment)
        verification_tx_id: { bsonType: 'string' },
        verification_amount: { bsonType: 'decimal', default: 1 },
        verification_paid: { bsonType: 'bool', default: false },
        
        // Usage Stats
        total_received: { bsonType: 'decimal', default: 0 },
        transaction_count: { bsonType: 'int', default: 0 },
        last_used_at: { bsonType: 'date' },
        
        // Display Settings
        display_name: { bsonType: 'string' },
        is_primary: { bsonType: 'bool', default: false },
        is_active: { bsonType: 'bool', default: true },
        
        // Timestamps
        created_at: { bsonType: 'date' },
        updated_at: { bsonType: 'date' },
        
        // Metadata
        metadata: { bsonType: 'object' }
      }
    }
  }
});

// UPI Payments Collection Indexes
db.upi_payments.createIndex({ user_id: 1, is_active: 1 });
db.upi_payments.createIndex({ upi_id: 1 }, { unique: true });
db.upi_payments.createIndex({ user_id: 1, is_primary: 1 });
db.upi_payments.createIndex({ status: 1 });

// ============================================
// 7. BANK_DETAILS COLLECTION
// ============================================
// Stores user bank account details for withdrawals
// ============================================

db.createCollection('bank_details', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['user_id', 'account_number', 'ifsc_code', 'account_holder_name', 'status', 'created_at'],
      properties: {
        _id: { bsonType: 'objectId' },
        user_id: { bsonType: 'objectId' },
        
        // Bank Account Details
        account_number: { bsonType: 'string' },
        ifsc_code: { 
          bsonType: 'string',
          pattern: '^[A-Z]{4}0[A-Z0-9]{6}$'  // IFSC format
        },
        account_holder_name: { bsonType: 'string' },
        
        // Bank Info
        bank_name: { bsonType: 'string' },
        branch_name: { bsonType: 'string' },
        branch_address: { bsonType: 'string' },
        
        // Account Type
        account_type: { 
          enum: ['SAVINGS', 'CURRENT', 'NRE', 'NRO'],
          default: 'SAVINGS'
        },
        
        // Verification
        status: {
          enum: ['pending', 'verified', 'rejected'],
          default: 'pending'
        },
        verified_at: { bsonType: 'date' },
        verified_by: { bsonType: 'objectId' },
        rejection_reason: { bsonType: 'string' },
        
        // Verification Payment
        verification_tx_id: { bsonType: 'string' },
        verification_amount: { bsonType: 'decimal' },
        
        // Usage Stats
        total_withdrawn: { bsonType: 'decimal', default: 0 },
        withdrawal_count: { bsonType: 'int', default: 0 },
        last_used_at: { bsonType: 'date' },
        
        // Display Settings
        display_name: { bsonType: 'string' },
        is_primary: { bsonType: 'bool', default: false },
        is_active: { bsonType: 'bool', default: true },
        
        // Timestamps
        created_at: { bsonType: 'date' },
        updated_at: { bsonType: 'date' },
        
        // Metadata
        metadata: { bsonType: 'object' }
      }
    }
  }
});

// Bank Details Collection Indexes
db.bank_details.createIndex({ user_id: 1, is_active: 1 });
db.bank_details.createIndex({ account_number: 1, ifsc_code: 1 }, { unique: true });
db.bank_details.createIndex({ user_id: 1, is_primary: 1 });
db.bank_details.createIndex({ status: 1 });

// ============================================
// 8. REFERRALS COLLECTION
// ============================================
// Stores referral relationships with multi-level tracking
// ============================================

db.createCollection('referrals', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['referrer_id', 'referred_id', 'level', 'status', 'created_at'],
      properties: {
        _id: { bsonType: 'objectId' },
        
        // Referral Chain
        referrer_id: { bsonType: 'objectId' },  // The one who referred
        referred_id: { bsonType: 'objectId' },  // The one who was referred
        
        // Level in the chain (1 = direct, 2 = indirect, 3 = third level)
        level: { 
          bsonType: 'int',
          minimum: 1,
          maximum: 3,
          default: 1
        },
        
        // Commission Rate for this level
        commission_rate: { bsonType: 'decimal', default: 0 },  // Percentage
        
        // Status
        status: {
          enum: ['active', 'inactive'],
          default: 'active'
        },
        
        // Referral Code Used
        referral_code_used: { bsonType: 'string' },
        
        // Source
        source: { bsonType: 'string' },  // e.g., 'web', 'app', 'campaign'
        campaign: { bsonType: 'string' },
        
        // Statistics
        total_commission_earned: { bsonType: 'decimal', default: 0 },
        referred_user_trades: { bsonType: 'int', default: 0 },
        referred_user_volume: { bsonType: 'decimal', default: 0 },
        
        // Timestamps
        created_at: { bsonType: 'date' },
        updated_at: { bsonType: 'date' },
        
        // Metadata
        metadata: { bsonType: 'object' }
      }
    }
  }
});

// Referrals Collection Indexes
db.referrals.createIndex({ referrer_id: 1, level: 1 });
db.referrals.createIndex({ referred_id: 1 }, { unique: true });
db.referrals.createIndex({ referrer_id: 1, referred_id: 1 }, { unique: true });
db.referrals.createIndex({ referral_code_used: 1 });
db.referrals.createIndex({ created_at: -1 });

// ============================================
// 9. REFERRAL_BONUSES COLLECTION
// ============================================
// Stores referral bonus/commission transactions
// ============================================

db.createCollection('referral_bonuses', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['referrer_id', 'referred_id', 'referral_id', 'trade_id', 'level', 'amount', 'status', 'created_at'],
      properties: {
        _id: { bsonType: 'objectId' },
        
        // Referral Chain
        referrer_id: { bsonType: 'objectId' },
        referred_id: { bsonType: 'objectId' },
        referral_id: { bsonType: 'objectId' },  // Reference to referrals collection
        
        // Source Trade
        trade_id: { bsonType: 'objectId' },
        order_id: { bsonType: 'objectId' },
        
        // Level
        level: { 
          bsonType: 'int',
          minimum: 1,
          maximum: 3
        },
        
        // Commission Details
        trade_amount: { bsonType: 'decimal' },
        commission_rate: { bsonType: 'decimal' },  // Percentage
        amount: { bsonType: 'decimal' },           // Actual commission amount
        currency: { enum: ['USDT', 'INR'], default: 'USDT' },
        
        // Status
        status: {
          enum: ['pending', 'credited', 'cancelled'],
          default: 'pending'
        },
        
        // Wallet Transaction Reference
        wallet_transaction_id: { bsonType: 'objectId' },
        credited_at: { bsonType: 'date' },
        
        // Timestamps
        created_at: { bsonType: 'date' },
        updated_at: { bsonType: 'date' },
        
        // Metadata
        metadata: { bsonType: 'object' }
      }
    }
  }
});

// Referral Bonuses Collection Indexes
db.referral_bonuses.createIndex({ referrer_id: 1, created_at: -1 });
db.referral_bonuses.createIndex({ referred_id: 1 });
db.referral_bonuses.createIndex({ referral_id: 1 });
db.referral_bonuses.createIndex({ trade_id: 1 });
db.referral_bonuses.createIndex({ status: 1, created_at: 1 });

// ============================================
// 10. ADMIN_LOGS COLLECTION
// ============================================
// Stores all admin actions for audit purposes
// ============================================

db.createCollection('admin_logs', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['admin_id', 'action', 'target_type', 'created_at'],
      properties: {
        _id: { bsonType: 'objectId' },
        
        // Admin Info
        admin_id: { bsonType: 'objectId' },
        admin_email: { bsonType: 'string' },
        admin_role: { bsonType: 'string' },
        
        // Action Details
        action: { 
          enum: [
            'USER_CREATE', 'USER_UPDATE', 'USER_DELETE', 'USER_SUSPEND', 'USER_BAN',
            'KYC_APPROVE', 'KYC_REJECT',
            'UPI_VERIFY', 'UPI_REJECT',
            'BANK_VERIFY', 'BANK_REJECT',
            'ORDER_CANCEL', 'ORDER_DELETE',
            'TRADE_RESOLVE', 'TRADE_CANCEL', 'TRADE_REFUND',
            'TRANSACTION_APPROVE', 'TRANSACTION_REJECT', 'TRANSACTION_ADJUST',
            'WITHDRAWAL_APPROVE', 'WITHDRAWAL_REJECT',
            'DEPOSIT_CONFIRM', 'DEPOSIT_REJECT',
            'SETTINGS_UPDATE', 'FEE_UPDATE', 'RATE_UPDATE',
            'LOGIN', 'LOGOUT', 'PASSWORD_CHANGE',
            'EXPORT_DATA', 'REPORT_VIEW'
          ]
        },
        
        // Target Entity
        target_type: { 
          enum: ['USER', 'ORDER', 'TRADE', 'TRANSACTION', 'KYC', 'UPI', 'BANK', 'SYSTEM', 'SETTINGS']
        },
        target_id: { bsonType: 'objectId' },
        target_email: { bsonType: 'string' },
        
        // Change Details
        description: { bsonType: 'string' },
        previous_values: { bsonType: 'object' },
        new_values: { bsonType: 'object' },
        
        // IP and Device Info
        ip_address: { bsonType: 'string' },
        user_agent: { bsonType: 'string' },
        session_id: { bsonType: 'string' },
        
        // Reason/Notes
        reason: { bsonType: 'string' },
        notes: { bsonType: 'string' },
        
        // Related IDs
        related_ids: {
          bsonType: 'array',
          items: { bsonType: 'objectId' }
        },
        
        // Timestamps
        created_at: { bsonType: 'date' },
        
        // Metadata
        metadata: { bsonType: 'object' }
      }
    }
  }
});

// Admin Logs Collection Indexes
db.admin_logs.createIndex({ admin_id: 1, created_at: -1 });
db.admin_logs.createIndex({ action: 1, created_at: -1 });
db.admin_logs.createIndex({ target_type: 1, target_id: 1 });
db.admin_logs.createIndex({ created_at: -1 });
db.admin_logs.createIndex({ ip_address: 1, created_at: -1 });

// TTL index for old logs (keep for 2 years)
db.admin_logs.createIndex({ created_at: 1 }, { expireAfterSeconds: 63072000 });

// ============================================
// 11. KYC_VERIFICATIONS COLLECTION
// ============================================
// Stores KYC submission details and verification status
// ============================================

db.createCollection('kyc_verifications', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['user_id', 'status', 'submitted_at'],
      properties: {
        _id: { bsonType: 'objectId' },
        user_id: { bsonType: 'objectId' },
        
        // Status
        status: {
          enum: ['pending', 'under_review', 'verified', 'rejected', 'resubmit_required'],
          default: 'pending'
        },
        
        // Submission Info
        submitted_at: { bsonType: 'date' },
        reviewed_at: { bsonType: 'date' },
        reviewed_by: { bsonType: 'objectId' },
        
        // Personal Details
        full_name: { bsonType: 'string' },
        date_of_birth: { bsonType: 'date' },
        gender: { enum: ['MALE', 'FEMALE', 'OTHER'] },
        
        // Address
        address: {
          bsonType: 'object',
          properties: {
            line1: { bsonType: 'string' },
            line2: { bsonType: 'string' },
            city: { bsonType: 'string' },
            state: { bsonType: 'string' },
            pincode: { bsonType: 'string' },
            country: { bsonType: 'string', default: 'India' }
          }
        },
        
        // PAN Card
        pan_number: { bsonType: 'string' },
        pan_document_url: { bsonType: 'string' },
        pan_verified: { bsonType: 'bool', default: false },
        pan_verified_at: { bsonType: 'date' },
        
        // Aadhaar
        aadhaar_number: { bsonType: 'string' },
        aadhaar_document_front_url: { bsonType: 'string' },
        aadhaar_document_back_url: { bsonType: 'string' },
        aadhaar_verified: { bsonType: 'bool', default: false },
        aadhaar_verified_at: { bsonType: 'date' },
        
        // Selfie
        selfie_url: { bsonType: 'string' },
        selfie_verified: { bsonType: 'bool', default: false },
        
        // Liveness Check
        liveness_check_passed: { bsonType: 'bool', default: false },
        liveness_score: { bsonType: 'decimal' },
        
        // Face Match Score
        face_match_score: { bsonType: 'decimal' },
        
        // Rejection Details
        rejection_reason: { bsonType: 'string' },
        rejection_details: { bsonType: 'string' },
        rejected_documents: {
          bsonType: 'array',
          items: { bsonType: 'string' }
        },
        
        // Resubmission
        resubmit_required_at: { bsonType: 'date' },
        resubmitted_at: { bsonType: 'date' },
        resubmission_count: { bsonType: 'int', default: 0 },
        
        // Third-party Verification
        verification_provider: { bsonType: 'string' },
        verification_reference: { bsonType: 'string' },
        verification_response: { bsonType: 'object' },
        
        // Notes
        admin_notes: { bsonType: 'string' },
        
        // Timestamps
        created_at: { bsonType: 'date' },
        updated_at: { bsonType: 'date' },
        
        // Metadata
        metadata: { bsonType: 'object' }
      }
    }
  }
});

// KYC Verifications Collection Indexes
db.kyc_verifications.createIndex({ user_id: 1 }, { unique: true });
db.kyc_verifications.createIndex({ status: 1, submitted_at: 1 });
db.kyc_verifications.createIndex({ reviewed_by: 1, reviewed_at: -1 });
db.kyc_verifications.createIndex({ pan_number: 1 }, { sparse: true });
db.kyc_verifications.createIndex({ aadhaar_number: 1 }, { sparse: true });

// ============================================
// 12. NOTIFICATIONS COLLECTION
// ============================================
// Stores user notifications
// ============================================

db.createCollection('notifications', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['user_id', 'type', 'title', 'message', 'created_at'],
      properties: {
        _id: { bsonType: 'objectId' },
        user_id: { bsonType: 'objectId' },
        
        // Notification Type
        type: {
          enum: [
            'KYC_STATUS',           // KYC approved/rejected
            'ORDER_MATCHED',        // Order matched
            'ORDER_CANCELLED',      // Order cancelled
            'TRADE_CREATED',        // New trade
            'PAYMENT_RECEIVED',     // Payment received
            'PAYMENT_CONFIRMED',    // Payment confirmed
            'TRADE_COMPLETED',      // Trade completed
            'TRADE_DISPUTED',       // Trade disputed
            'DEPOSIT_CONFIRMED',    // Deposit confirmed
            'WITHDRAWAL_PROCESSED', // Withdrawal processed
            'REFERRAL_BONUS',       // Referral bonus received
            'PRICE_ALERT',          // Price alert
            'SYSTEM',               // System notification
            'SECURITY',             // Security alert
            'PROMOTIONAL'           // Promotional
          ]
        },
        
        // Content
        title: { bsonType: 'string' },
        message: { bsonType: 'string' },
        
        // Related Entity
        related_type: { 
          enum: ['ORDER', 'TRADE', 'TRANSACTION', 'KYC', 'REFERRAL', 'SYSTEM']
        },
        related_id: { bsonType: 'objectId' },
        
        // Action
        action_url: { bsonType: 'string' },
        action_text: { bsonType: 'string' },
        
        // Status
        is_read: { bsonType: 'bool', default: false },
        read_at: { bsonType: 'date' },
        
        // Delivery Channels
        channels: {
          bsonType: 'object',
          properties: {
            in_app: { bsonType: 'bool', default: true },
            email: { bsonType: 'bool', default: false },
            sms: { bsonType: 'bool', default: false },
            push: { bsonType: 'bool', default: false }
          }
        },
        
        // Delivery Status
        email_sent: { bsonType: 'bool', default: false },
        email_sent_at: { bsonType: 'date' },
        sms_sent: { bsonType: 'bool', default: false },
        sms_sent_at: { bsonType: 'date' },
        push_sent: { bsonType: 'bool', default: false },
        push_sent_at: { bsonType: 'date' },
        
        // Priority
        priority: { 
          enum: ['low', 'normal', 'high', 'urgent'],
          default: 'normal'
        },
        
        // Timestamps
        created_at: { bsonType: 'date' },
        expires_at: { bsonType: 'date' },
        
        // Metadata
        metadata: { bsonType: 'object' }
      }
    }
  }
});

// Notifications Collection Indexes
db.notifications.createIndex({ user_id: 1, created_at: -1 });
db.notifications.createIndex({ user_id: 1, is_read: 1 });
db.notifications.createIndex({ type: 1, created_at: -1 });
db.notifications.createIndex({ related_type: 1, related_id: 1 });
db.notifications.createIndex({ created_at: -1 });

// TTL index for old notifications (keep for 90 days)
db.notifications.createIndex({ created_at: 1 }, { expireAfterSeconds: 7776000 });

// ============================================
// ADDITIONAL COLLECTIONS
// ============================================

// ============================================
// 13. SETTINGS COLLECTION (Platform Configuration)
// ============================================
db.createCollection('settings', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['key', 'value', 'created_at'],
      properties: {
        _id: { bsonType: 'objectId' },
        key: { bsonType: 'string' },
        value: { bsonType: 'object' },
        description: { bsonType: 'string' },
        category: { bsonType: 'string' },
        updated_by: { bsonType: 'objectId' },
        created_at: { bsonType: 'date' },
        updated_at: { bsonType: 'date' }
      }
    }
  }
});

db.settings.createIndex({ key: 1 }, { unique: true });
db.settings.createIndex({ category: 1 });

// ============================================
// 14. PRICE_ALERTS COLLECTION
// ============================================
db.createCollection('price_alerts', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['user_id', 'crypto_currency', 'target_price', 'condition', 'status', 'created_at'],
      properties: {
        _id: { bsonType: 'objectId' },
        user_id: { bsonType: 'objectId' },
        crypto_currency: { enum: ['USDT'] },
        fiat_currency: { enum: ['INR'] },
        target_price: { bsonType: 'decimal' },
        condition: { enum: ['above', 'below'] },
        status: { enum: ['active', 'triggered', 'cancelled'], default: 'active' },
        triggered_at: { bsonType: 'date' },
        created_at: { bsonType: 'date' },
        updated_at: { bsonType: 'date' }
      }
    }
  }
});

db.price_alerts.createIndex({ user_id: 1, status: 1 });
db.price_alerts.createIndex({ status: 1, condition: 1, target_price: 1 });

// ============================================
// 15. CHAT_MESSAGES COLLECTION (Trade Chat)
// ============================================
db.createCollection('chat_messages', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['trade_id', 'sender_id', 'message', 'created_at'],
      properties: {
        _id: { bsonType: 'objectId' },
        trade_id: { bsonType: 'objectId' },
        sender_id: { bsonType: 'objectId' },
        message: { bsonType: 'string' },
        message_type: { enum: ['text', 'image', 'system'], default: 'text' },
        attachment_url: { bsonType: 'string' },
        is_read: { bsonType: 'bool', default: false },
        read_at: { bsonType: 'date' },
        created_at: { bsonType: 'date' }
      }
    }
  }
});

db.chat_messages.createIndex({ trade_id: 1, created_at: 1 });
db.chat_messages.createIndex({ sender_id: 1, is_read: 1 });

// ============================================
// SCHEMA VALIDATION & RELATIONSHIPS SUMMARY
// ============================================

/**
 * COLLECTION RELATIONSHIPS:
 * 
 * users (1) -----> (1) wallets
 * users (1) -----> (N) transactions
 * users (1) -----> (N) orders
 * users (1) -----> (N) upi_payments
 * users (1) -----> (N) bank_details
 * users (1) -----> (N) referrals (as referrer)
 * users (1) -----> (1) referrals (as referred)
 * users (1) -----> (N) referral_bonuses
 * users (1) -----> (N) notifications
 * users (1) -----> (1) kyc_verifications
 * 
 * orders (1) -----> (N) trades
 * orders (1) -----> (N) upi_payments
 * orders (1) -----> (N) bank_details
 * 
 * trades (1) -----> (N) transactions
 * trades (1) -----> (N) referral_bonuses
 * trades (1) -----> (N) chat_messages
 * 
 * referrals (1) -----> (N) referral_bonuses
 */

// ============================================
// SAMPLE INDEXES FOR COMMON QUERIES
// ============================================

// Compound indexes for common query patterns
db.transactions.createIndex({ user_id: 1, type: 1, created_at: -1 });
db.transactions.createIndex({ user_id: 1, status: 1, created_at: -1 });

db.orders.createIndex({ user_id: 1, type: 1, status: 1, created_at: -1 });
db.orders.createIndex({ type: 1, status: 1, price_per_unit: 1, created_at: -1 });

db.trades.createIndex({ buyer_id: 1, status: 1, created_at: -1 });
db.trades.createIndex({ seller_id: 1, status: 1, created_at: -1 });
db.trades.createIndex({ status: 1, disputed_at: -1 });

// ============================================
// PRINT SUMMARY
// ============================================

print('========================================');
print('USDT P2P Trading Platform Schema Created');
print('========================================');
print('');
print('Collections created:');
print('  1. users');
print('  2. wallets');
print('  3. transactions');
print('  4. orders');
print('  5. trades');
print('  6. upi_payments');
print('  7. bank_details');
print('  8. referrals');
print('  9. referral_bonuses');
print('  10. admin_logs');
print('  11. kyc_verifications');
print('  12. notifications');
print('  13. settings');
print('  14. price_alerts');
print('  15. chat_messages');
print('');
print('Database: usdt_p2p_platform');
print('========================================');
