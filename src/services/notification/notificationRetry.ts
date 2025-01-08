/**
 * Notification retry handler
 */
import { logger } from '../../utils/logger';
import { RateLimiter } from '../../utils/http/rateLimiter';

export class NotificationRetry {
  private rateLimiter: RateLimiter;
  
  constructor() {
    this.rateLimiter = new RateLimiter(2000); // 2 seconds between notifications
  }

  public async beforeSend(): Promise<void> {
    await this.rateLimiter.waitIfNeeded();
  }

  public handleError(error: unknown, context: string): void {
    logger.error(`Notification error: ${context}`, { error });
  }
}
