// src/errors/ValidationError.ts
import { AppError } from './AppError';

export class ValidationError extends AppError {
  public readonly errors: Record<string, string[]>;

  constructor(message: string, errors: Record<string, string[]>) {
    super(message, 400, true);
    this.errors = errors;
  }
}