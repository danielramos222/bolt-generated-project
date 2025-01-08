/**
 * Custom error types and handlers for ONS API
 */
import { logger } from '../../../utils/logger';

export class ONSError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'ONSError';
  }
}

export class ONSAuthError extends ONSError {
  constructor(message: string, details?: unknown) {
    super(message, 401, details);
    this.name = 'ONSAuthError';
  }
}

export class ONSTimeoutError extends ONSError {
  constructor(message: string) {
    super(message, 408);
    this.name = 'ONSTimeoutError';
  }
}

export function handleONSError(error: unknown): never {
  logger.error('ONS API Error', error);

  if (error instanceof Response) {
    if (error.status === 401) {
      throw new ONSAuthError('Authentication failed');
    }
    if (error.status === 408) {
      throw new ONSTimeoutError('Request timeout');
    }
    throw new ONSError(`HTTP Error: ${error.status}`, error.status);
  }

  throw new ONSError('Unknown error occurred', undefined, error);
}
