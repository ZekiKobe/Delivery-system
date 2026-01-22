import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import passport from '../config/passport.js';
import connectDB from '../config/database.js';
import { errorHandler, notFoundHandler } from '../middleware/errorHandler.js';
import { generalLimiter, authLimiter, passwordResetLimiter, securityHeaders, sanitizeInput } from '../middleware/security.js';
import { initializeSocket } from '../services/socketService.js';

// Import routes
import authRoutes from '../routes/auth.js';
import userRoutes from '../routes/user.js';
import restaurantRoutes from '../routes/restaurant.js';
import businessRoutes from '../routes/business.js';
import businessProductsRoutes from '../routes/businessProducts.js';
import businessProductsNewRoutes from '../routes/businessProductsNew.js';
import inventoryRoutes from '../routes/inventory.js';
import businessDashboardRoutes from '../routes/businessDashboard.js';
import orderRoutes from '../routes/order.js';
import paymentRoutes from '../routes/payment.js';
import deliveryRoutes from '../routes/delivery.js';
import adminRoutes from '../routes/admin.js';
import uploadRoutes from '../routes/upload.js';
import termsRoutes from '../routes/terms.js';
import validationRoutes from '../routes/validation.js';
import oauthRoutes from '../routes/oauth.js';
import categoriesRoutes from '../routes/categories.js';
import productsRoutes from '../routes/products.js';
import sequelizeRoutes from '../routes/sequelize.js';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Trust proxy for accurate IP addresses behind reverse proxy
app.set('trust proxy', 1);

// Security headers
app.use(securityHeaders);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Initialize Passport
app.use(passport.initialize());

// Input sanitization
app.use(sanitizeInput);

// CORS configuration
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:5173','http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
app.use('/api', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', passwordResetLimiter);

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    // Store raw body for webhook verification
    if (req.originalUrl === '/api/payments/webhook') {
      req.rawBody = buf;
    }
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/auth/oauth', oauthRoutes);
app.use('/api/users', userRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/businesses', businessProductsRoutes);
app.use('/api/business', businessProductsNewRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/dashboard', businessDashboardRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/terms', termsRoutes);
app.use('/api/validation', validationRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/sequelize', sequelizeRoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Delivery System API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      restaurants: '/api/restaurants',
      businesses: '/api/businesses',
      business: '/api/business',
      inventory: '/api/inventory',
      dashboard: '/api/dashboard',
      orders: '/api/orders',
      payments: '/api/payments',
      delivery: '/api/delivery',
      admin: '/api/admin',
      upload: '/api/upload',
      terms: '/api/terms',
      validation: '/api/validation',
      categories: '/api/categories',
      products: '/api/products',
      sequelize: '/api/sequelize'
    },
    documentation: 'https://api-docs.deliverysystem.com'
  });
});

// 404 handler for API routes
app.use('/api/*', notFoundHandler);

// Global error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
🚀 Server running in ${process.env.NODE_ENV || 'development'} mode
📡 Port: ${PORT}
🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}
💳 Stripe Mode: ${process.env.STRIPE_SECRET_KEY?.includes('sk_test') ? 'Test' : 'Live'}
📅 Started: ${new Date().toISOString()}
  `);
});

// Initialize Socket.io with the server instance
try {
  initializeSocket(server);
} catch (error) {
  console.error('Failed to initialize Socket.io:', error);
}

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default app;