// src/errors/AuthenticationError.ts
import { AppError } from './AppError';

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401, true);
  }
}