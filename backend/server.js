const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import configurations
const connectDB = require('./config/database');
const { initializeSocket } = require('./config/socket');
const logger = require('./utils/logger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

// Import routes
const routes = require('./routes');

// Import WebSocket handlers
const wsHandlers = require('./websocket/handlers');

// Import cron jobs
const cron = require('node-cron');
const orderMatchingService = require('./services/orderMatchingService');

/**
 * Initialize Express App
 */
const app = express();
const server = http.createServer(app);

/**
 * Security Middleware
 */
// Helmet for security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Admin-API-Key'],
}));

/**
 * Body Parsing Middleware
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * Rate Limiting
 */
app.use('/api/', apiLimiter);

/**
 * Static Files
 */
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/**
 * Request Logging Middleware
 */
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });
  next();
});

/**
 * Health Check Endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

/**
 * API Routes
 */
app.use('/api/auth', routes.auth);
app.use('/api/user', routes.user);
app.use('/api/wallet', routes.wallet);
app.use('/api/orders', routes.order);
app.use('/api/trades', routes.trade);
app.use('/api/upi', routes.upi);
app.use('/api/deposit-withdraw', routes.depositWithdraw);
app.use('/api/referral', routes.referral);
app.use('/api/admin', routes.admin);

/**
 * 404 Handler
 */
app.use(notFoundHandler);

/**
 * Error Handler
 */
app.use(errorHandler);

/**
 * Initialize Socket.io
 */
initializeSocket(server);
wsHandlers.initializeHandlers();

/**
 * Cron Jobs
 */
// Auto-cancel expired trades every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  try {
    logger.info('Running auto-cancel expired trades job');
    const cancelledCount = await orderMatchingService.autoCancelExpiredTrades();
    logger.info(`Auto-cancelled ${cancelledCount} expired trades`);
  } catch (error) {
    logger.error('Error in auto-cancel cron job:', error);
  }
});

/**
 * Database Connection and Server Start
 */
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start server
    server.listen(PORT, () => {
      logger.info(`=================================`);
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`=================================`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Start the server
startServer();

module.exports = { app, server };
