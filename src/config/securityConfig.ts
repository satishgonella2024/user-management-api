// src/security/securityConfig.ts
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Express } from 'express';
import cors from 'cors';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';

/**
 * Configures security middleware for the Express application
 * @param app Express application instance
 */
export const configureSecurityMiddleware = (app: Express): void => {
  // Set security HTTP headers
  app.use(helmet());

  // Parse cookies - required for JWT stored in cookies
  app.use(cookieParser());

  // Implement CORS with restrictive options
  app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400, // 24 hours
  }));

  // Prevent HTTP Parameter Pollution attacks
  app.use(hpp());

  // Rate limiting to prevent brute force and DoS attacks
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  });
  app.use('/api/', apiLimiter);

  // Stricter rate limits for authentication endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10, // 10 attempts per 15 minutes
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many login attempts, please try again after 15 minutes',
  });
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/register', authLimiter);
  app.use('/api/auth/refresh-token', authLimiter);
};