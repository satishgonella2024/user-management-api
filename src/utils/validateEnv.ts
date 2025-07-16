import { authConfig } from './auth.config';

// Validate required environment variables
if (!authConfig.jwtSecret) {
  throw new Error('JWT_SECRET environment variable is required');
}

if (!authConfig.refreshSecret) {
  throw new Error('REFRESH_SECRET environment variable is required');
}