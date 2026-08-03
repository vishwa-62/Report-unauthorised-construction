const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');

const db = require('./config/db');
const logger = require('./utils/logger');
const apiRoutes = require('./routes/api');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security and compression middlewares
app.use(helmet({
  crossOriginResourcePolicy: false // Allows loading images from backend locally in frontend
}));
app.use(cors());
app.use(compression());
app.use(morgan('dev'));

// Parse incoming request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads folder as static
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // Increased threshold for dev testing
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes.' }
});
app.use('/api', apiLimiter);

// Bind API Routes
app.use('/api', apiRoutes);

// Health Check Route
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    dbType: db.getDbType(),
    timestamp: new Date()
  });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled server error', { 
    message: err.message, 
    stack: err.stack,
    url: req.originalUrl,
    method: req.method
  });
  
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Server Initialization
async function startServer() {
  try {
    // 1. Initialize database connection (PostgreSQL with SQLite fallback)
    await db.initDatabase();
    
    // 2. Start listening
    app.listen(PORT, () => {
      logger.info(`CityGuard AI Backend Server running on port ${PORT}`);
      logger.info(`Health check available at http://localhost:${PORT}/health`);
    });
  } catch (err) {
    logger.error('Failed to start CityGuard AI Backend Server', { error: err.message });
    process.exit(1);
  }
}

startServer();
