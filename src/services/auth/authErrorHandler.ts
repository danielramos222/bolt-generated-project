/**
 * Specialized error handler for authentication
 */
import { logger } from '../../utils/logger';

export class AuthErrorHandler {
  private static readonly MAX_FAILURES = 3;
  private static failures = 0;
  private static lastFailure: number | null = null;
  private static readonly COOLDOWN = 5 * 60 * 1000; // 5 minutes

  public static handleError(error: unknown): void {
    this.failures++;
    this.lastFailure = Date.now();

    logger.error('Authentication error', {
      failures: this.failures,
      error
    });
  }

  public static canRetry(): boolean {
    if (this.failures < this.MAX_FAILURES) return true;
    if (!this.lastFailure) return true;

    const cooldownEnded = Date.now() - this.lastFailure >= this.COOLDOWN;
    if (cooldownEnded) {
      this.reset();
      return true;
    }

    return false;
  }

  public static reset(): void {
    this.failures = 0;
    this.lastFailure = null;
  }
}
