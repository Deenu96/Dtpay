/**
 * Routes Index - Export all routes
 */

module.exports = {
  auth: require('./auth'),
  user: require('./user'),
  wallet: require('./wallet'),
  order: require('./order'),
  trade: require('./trade'),
  upi: require('./upi'),
  depositWithdraw: require('./depositWithdraw'),
  referral: require('./referral'),
  admin: require('./admin'),
};
