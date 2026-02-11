import dotenv from 'dotenv';

dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import apicache from 'apicache';
import * as Sentry from '@sentry/node';
import pool, { end } from './db.js';
import logger from './utils/logger.js';
import authRoutes from './routes/auth.js';
import eventRoutes from './routes/events.js';
import rsvpRoutes from './routes/rsvp.js';
import adminRoutes from './routes/admin.js';
import uploadRoutes from './routes/upload.js';
import profileRoutes from './routes/profile.js';
import rewardsRoutes from './routes/rewards.js';
import leaderboardRoutes from './routes/leaderboard.js';
import notificationsRoutes from './routes/notifications.js';
import { apiLimiter, rsvpLimiter } from './middleware/rate-limit.js';
import { transporter } from './services/email.js';
const app = express();
const PORT = process.env.PORT || 4000;

// Initialize Sentry (only if DSN is configured)
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({ app }),
    ],
  });

  // Request handler must be first
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
}

// Configure caching (disabled in development for easier testing)
const cache = apicache.middleware;
const cacheSuccessOnly = apicache.options({
  statusCodes: { include: [200] }
}).middleware;

// Enhanced security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
}));

// CORS configuration
app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Redirect HTTP to HTTPS in production (use 308 to preserve HTTP method)
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(308, `https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`, {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// Apply general rate limiting to all API routes
app.use('/api/', apiLimiter);

app.get('/health', async (_req, res) => {
  try {
    // Check database connection
    await pool.query('SELECT 1');

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected',
      environment: process.env.NODE_ENV || 'development',
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

app.get('/', (_req, res) => {
  res.json({ message: 'Event Management API' });
});

app.use('/api/auth', authRoutes);
// Cache public event listings for 5 minutes in production
app.use('/api/events', process.env.NODE_ENV === 'production' ? cacheSuccessOnly('5 minutes') : (req, res, next) => next(), eventRoutes);
app.use('/api/rsvp', rsvpLimiter, rsvpRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/profile', profileRoutes);
// Cache rewards catalog for 30 minutes in production
app.use('/api/rewards', process.env.NODE_ENV === 'production' ? cacheSuccessOnly('30 minutes') : (req, res, next) => next(), rewardsRoutes);
// Cache leaderboard for 10 minutes in production
app.use('/api/leaderboard', process.env.NODE_ENV === 'production' ? cacheSuccessOnly('10 minutes') : (req, res, next) => next(), leaderboardRoutes);
app.use('/api/notifications', notificationsRoutes);
// Health‑check endpoint for email transporter
app.get('/api/email-status', async (req, res) => {
  try {
    await transporter.verify();
    res.json({ success: true });
  } catch (error) {
    logger.error('Email transporter verification failed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Sentry error handler must be after all routes
if (process.env.SENTRY_DSN) {
  app.use(Sentry.Handlers.errorHandler());
}

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
  });

  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
  });
});

async function startServer() {
  try {
    await pool.query('SELECT NOW()');
    logger.info('Database connected successfully');

    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`, {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
      });
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  logger.info('Shutting down gracefully...');
  await end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  await end();
  process.exit(0);
});

if (process.env.NODE_ENV !== 'test') {
  startServer().catch((err) => {
    logger.error('Failed to start server:', err);
    process.exit(1);
  });
}

export default app;
