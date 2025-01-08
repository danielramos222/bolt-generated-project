/**
 * Enhanced retry strategy with better error handling
 */
import { calculateRetryDelay } from './retryDelay';
import { shouldRetryRequest } from './retryConditions';
import { logger } from '../logger';

export interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
}

export class RetryStrategy {
  constructor(private config: RetryConfig) {}

  public async execute<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt < this.config.maxRetries && shouldRetryRequest(error)) {
          const delay = calculateRetryDelay(attempt, this.config);
          logger.warn(`Request failed, retrying in ${delay}ms`, { 
            attempt: attempt + 1,
            error: lastError.message
          });
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        break;
      }
    }

    throw lastError;
  }
}

export { calculateRetryDelay, shouldRetryRequest };
