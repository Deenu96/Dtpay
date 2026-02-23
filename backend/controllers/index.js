/**
 * Controllers Index - Export all controllers
 */

module.exports = {
  authController: require('./authController'),
  userController: require('./userController'),
  walletController: require('./walletController'),
  orderController: require('./orderController'),
  tradeController: require('./tradeController'),
  upiController: require('./upiController'),
  depositWithdrawController: require('./depositWithdrawController'),
  referralController: require('./referralController'),
  adminController: require('./adminController'),
};
