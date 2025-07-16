// src/errors/NotFoundError.ts
import { AppError } from './AppError';

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, true);
  }
}