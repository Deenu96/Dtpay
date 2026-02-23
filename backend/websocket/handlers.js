const logger = require('../utils/logger');
const { getIO } = require('../config/socket');

/**
 * WebSocket Event Handlers
 */

/**
 * Initialize WebSocket event handlers
 */
const initializeHandlers = () => {
  const io = getIO();

  // Handle price updates
  io.on('price:update', (data) => {
    io.to('public:orderbook').emit('price:update', data);
  });

  // Handle order book updates
  io.on('orderbook:update', (data) => {
    io.to('public:orderbook').emit('orderbook:update', data);
  });

  // Handle trade updates
  io.on('trade:update', (data) => {
    if (data.userId) {
      io.to(`user:${data.userId}`).emit('trade:update', data);
    }
    if (data.broadcast) {
      io.to('public:trades').emit('trade:update', data);
    }
  });

  // Handle balance updates
  io.on('balance:update', (data) => {
    if (data.userId) {
      io.to(`user:${data.userId}`).emit('balance:update', data);
    }
  });

  // Handle notification events
  io.on('notification', (data) => {
    if (data.userId) {
      io.to(`user:${data.userId}`).emit('notification', data);
    }
  });

  // Handle admin notifications
  io.on('admin:notification', (data) => {
    io.to('admin:room').emit('admin:notification', data);
  });

  logger.info('WebSocket handlers initialized');
};

/**
 * Broadcast price update to all connected clients
 * @param {Object} priceData - Price data
 */
const broadcastPriceUpdate = (priceData) => {
  try {
    const io = getIO();
    io.to('public:orderbook').emit('price:update', {
      type: 'price_update',
      data: priceData,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error('Error broadcasting price update:', error);
  }
};

/**
 * Broadcast order book update
 * @param {Object} orderbookData - Order book data
 */
const broadcastOrderbookUpdate = (orderbookData) => {
  try {
    const io = getIO();
    io.to('public:orderbook').emit('orderbook:update', {
      type: 'orderbook_update',
      data: orderbookData,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error('Error broadcasting orderbook update:', error);
  }
};

/**
 * Send trade update to specific user
 * @param {String} userId - User ID
 * @param {Object} tradeData - Trade data
 */
const sendTradeUpdate = (userId, tradeData) => {
  try {
    const io = getIO();
    io.to(`user:${userId}`).emit('trade:update', {
      type: 'trade_update',
      data: tradeData,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error('Error sending trade update:', error);
  }
};

/**
 * Send balance update to specific user
 * @param {String} userId - User ID
 * @param {Object} balanceData - Balance data
 */
const sendBalanceUpdate = (userId, balanceData) => {
  try {
    const io = getIO();
    io.to(`user:${userId}`).emit('balance:update', {
      type: 'balance_update',
      data: balanceData,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error('Error sending balance update:', error);
  }
};

/**
 * Send notification to specific user
 * @param {String} userId - User ID
 * @param {Object} notificationData - Notification data
 */
const sendNotification = (userId, notificationData) => {
  try {
    const io = getIO();
    io.to(`user:${userId}`).emit('notification', {
      type: 'notification',
      data: notificationData,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error('Error sending notification:', error);
  }
};

/**
 * Send admin notification
 * @param {Object} adminData - Admin notification data
 */
const sendAdminNotification = (adminData) => {
  try {
    const io = getIO();
    io.to('admin:room').emit('admin:notification', {
      type: 'admin_notification',
      data: adminData,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error('Error sending admin notification:', error);
  }
};

/**
 * Broadcast system message to all users
 * @param {String} message - System message
 */
const broadcastSystemMessage = (message) => {
  try {
    const io = getIO();
    io.emit('system:message', {
      type: 'system_message',
      message,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error('Error broadcasting system message:', error);
  }
};

module.exports = {
  initializeHandlers,
  broadcastPriceUpdate,
  broadcastOrderbookUpdate,
  sendTradeUpdate,
  sendBalanceUpdate,
  sendNotification,
  sendAdminNotification,
  broadcastSystemMessage,
};
