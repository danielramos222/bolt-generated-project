/**
 * Rate limiter for notifications
 */
export class NotificationRateLimiter {
  private static instance: NotificationRateLimiter;
  private lastSent: number = 0;
  private readonly MIN_INTERVAL = 2000; // 2 seconds between notifications

  private constructor() {}

  public static getInstance(): NotificationRateLimiter {
    if (!NotificationRateLimiter.instance) {
      NotificationRateLimiter.instance = new NotificationRateLimiter();
    }
    return NotificationRateLimiter.instance;
  }

  public async waitIfNeeded(): Promise<void> {
    const now = Date.now();
    const timeSinceLastSent = now - this.lastSent;

    if (timeSinceLastSent < this.MIN_INTERVAL) {
      await new Promise(resolve => 
        setTimeout(resolve, this.MIN_INTERVAL - timeSinceLastSent)
      );
    }

    this.lastSent = Date.now();
  }
}
