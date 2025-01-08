/**
 * Enhanced error handling with better error classification
 */
import { logger } from '../logger';

export enum ErrorType {
  AUTH = 'AUTH',
  NETWORK = 'NETWORK',
  TIMEOUT = 'TIMEOUT',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN'
}

export class HTTPError extends Error {
  constructor(
    message: string,
    public readonly type: ErrorType,
    public readonly statusCode?: number,
    public readonly retryable: boolean = false
  ) {
    super(message);
    this.name = 'HTTPError';
  }
}

export function classifyError(error: unknown): HTTPError {
  // Network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new HTTPError(
      'Network connection failed',
      ErrorType.NETWORK,
      undefined,
      true
    );
  }

  // Empty response
  if (error instanceof SyntaxError && error.message.includes('JSON')) {
    return new HTTPError(
      'Invalid server response',
      ErrorType.SERVER,
      undefined,
      true
    );
  }

  // Response errors
  if (error instanceof Response) {
    if (error.status === 401 || error.status === 403) {
      return new HTTPError(
        'Authentication failed',
        ErrorType.AUTH,
        error.status,
        true
      );
    }

    if (error.status === 408 || error.status === 429) {
      return new HTTPError(
        'Request timeout or rate limited',
        ErrorType.TIMEOUT,
        error.status,
        true
      );
    }

    if (error.status >= 500) {
      return new HTTPError(
        'Server error',
        ErrorType.SERVER,
        error.status,
        true
      );
    }
  }

  return new HTTPError(
    error instanceof Error ? error.message : 'Unknown error occurred',
    ErrorType.UNKNOWN,
    undefined,
    false
  );
}

export function handleRequestError(error: unknown): never {
  const httpError = classifyError(error);
  
  logger.error('Request failed', {
    type: httpError.type,
    status: httpError.statusCode,
    message: httpError.message,
    retryable: httpError.retryable
  });

  throw httpError;
}
