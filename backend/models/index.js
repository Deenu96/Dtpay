/**
 * Models Index - Export all models
 */

module.exports = {
  User: require('./User'),
  Wallet: require('./Wallet'),
  Transaction: require('./Transaction'),
  Order: require('./Order'),
  Trade: require('./Trade'),
  UPIPayment: require('./UPIPayment'),
  BankDetail: require('./BankDetail'),
  KYCVerification: require('./KYCVerification'),
  Referral: require('./Referral'),
  ReferralBonus: require('./ReferralBonus'),
  DepositWithdrawal: require('./DepositWithdrawal'),
  Notification: require('./Notification'),
  AdminLog: require('./AdminLog'),
};
