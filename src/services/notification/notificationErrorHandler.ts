/**
 * Specialized error handler for notifications
 */
import { logger } from '../../utils/logger';

export class NotificationErrorHandler {
  private static readonly RATE_LIMIT = 2000; // 2 seconds
  private static lastAttempt: number | null = null;

  public static async handleRateLimit(): Promise<void> {
    if (!this.lastAttempt) {
      this.lastAttempt = Date.now();
      return;
    }

    const elapsed = Date.now() - this.lastAttempt;
    if (elapsed < this.RATE_LIMIT) {
      await new Promise(resolve => 
        setTimeout(resolve, this.RATE_LIMIT - elapsed)
      );
    }

    this.lastAttempt = Date.now();
  }

  public static handleError(error: unknown, context: string): void {
    logger.error(`Notification error: ${context}`, { error });
  }
}
