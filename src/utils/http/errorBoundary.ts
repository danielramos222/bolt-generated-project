/**
 * Generic error boundary for HTTP requests
 */
import { logger } from '../logger';

export class RequestErrorBoundary {
  public static async execute<T>(
    operation: () => Promise<T>,
    fallback: () => T | Promise<T>,
    context: string
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      logger.error(`Error in ${context}`, { error });
      return fallback();
    }
  }
}
