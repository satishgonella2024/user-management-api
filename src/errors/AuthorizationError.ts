// src/errors/AuthorizationError.ts
import { AppError } from './AppError';

export class AuthorizationError extends AppError {
  constructor(message = 'You do not have permission to perform this action') {
    super(message, 403, true);
  }
}