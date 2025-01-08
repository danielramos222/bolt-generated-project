/**
 * Enhanced retry manager for authentication with better state management
 */
import { logger } from '../../../utils/logger';

export class AuthRetryManager {
  private static instance: AuthRetryManager;
  private retryCount = 0;
  private lastAttempt: number | null = null;
  private readonly MAX_RETRIES = 2;
  private readonly COOLDOWN_PERIOD = 5 * 60 * 1000; // 5 minutes
  private readonly RESET_PERIOD = 30 * 60 * 1000;   // 30 minutes

  private constructor() {
    // Reset retry count periodically
    setInterval(() => this.checkReset(), this.RESET_PERIOD);
  }

  public static getInstance(): AuthRetryManager {
    if (!AuthRetryManager.instance) {
      AuthRetryManager.instance = new AuthRetryManager();
    }
    return AuthRetryManager.instance;
  }

  private checkReset(): void {
    if (this.lastAttempt && Date.now() - this.lastAttempt >= this.RESET_PERIOD) {
      this.reset();
    }
  }

  public canRetry(): boolean {
    if (this.retryCount >= this.MAX_RETRIES) {
      return this.checkCooldown();
    }
    return true;
  }

  private checkCooldown(): boolean {
    if (!this.lastAttempt) return true;
    const timeSinceLastAttempt = Date.now() - this.lastAttempt;
    return timeSinceLastAttempt >= this.COOLDOWN_PERIOD;
  }

  public recordAttempt(): void {
    this.retryCount++;
    this.lastAttempt = Date.now();
    logger.debug('Auth attempt recorded', { 
      attempts: this.retryCount, 
      maxRetries: this.MAX_RETRIES,
      nextRetryIn: this.getNextRetryTime()
    });
  }

  private getNextRetryTime(): number | null {
    if (!this.lastAttempt || this.retryCount < this.MAX_RETRIES) return null;
    const cooldownEnd = this.lastAttempt + this.COOLDOWN_PERIOD;
    return Math.max(0, cooldownEnd - Date.now());
  }

  public reset(): void {
    this.retryCount = 0;
    this.lastAttempt = null;
    logger.debug('Auth retry state reset');
  }

  public getState() {
    return {
      retryCount: this.retryCount,
      lastAttempt: this.lastAttempt,
      inCooldown: !this.checkCooldown(),
      nextRetryIn: this.getNextRetryTime()
    };
  }
}
