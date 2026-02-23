const { Server } = require('socket.io');
const logger = require('../utils/logger');

/**
 * Socket.io configuration and connection handler
 */
let io = null;

/**
 * Initialize Socket.io server
 * @param {Object} httpServer - HTTP server instance
 * @returns {Object} Socket.io server instance
 */
const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error: Token required'));
      }

      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      socket.userRole = decoded.role;
      next();
    } catch (error) {
      logger.error(`Socket authentication error: ${error.message}`);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.userId}, Socket ID: ${socket.id}`);

    // Join user-specific room for private updates
    socket.join(`user:${socket.userId}`);

    // Join role-based room for admin updates
    if (socket.userRole === 'admin' || socket.userRole === 'superadmin') {
      socket.join('admin:room');
    }

    // Join public rooms
    socket.join('public:orderbook');
    socket.join('public:trades');

    socket.on('disconnect', (reason) => {
      logger.info(`User disconnected: ${socket.userId}, Reason: ${reason}`);
    });

    socket.on('error', (error) => {
      logger.error(`Socket error for user ${socket.userId}: ${error.message}`);
    });
  });

  logger.info('Socket.io server initialized');
  return io;
};

/**
 * Get Socket.io instance
 * @returns {Object} Socket.io server instance
 */
const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

/**
 * Emit event to specific user
 * @param {String} userId - User ID
 * @param {String} event - Event name
 * @param {Object} data - Event data
 */
const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

/**
 * Emit event to admin room
 * @param {String} event - Event name
 * @param {Object} data - Event data
 */
const emitToAdmins = (event, data) => {
  if (io) {
    io.to('admin:room').emit(event, data);
  }
};

/**
 * Emit event to public rooms
 * @param {String} event - Event name
 * @param {Object} data - Event data
 */
const emitToPublic = (event, data) => {
  if (io) {
    io.to('public:orderbook').emit(event, data);
    io.to('public:trades').emit(event, data);
  }
};

/**
 * Broadcast event to all connected clients
 * @param {String} event - Event name
 * @param {Object} data - Event data
 */
const broadcast = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

module.exports = {
  initializeSocket,
  getIO,
  emitToUser,
  emitToAdmins,
  emitToPublic,
  broadcast,
};
