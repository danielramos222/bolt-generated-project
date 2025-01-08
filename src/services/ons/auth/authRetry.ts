/**
 * Enhanced retry logic for authentication
 */
import { logger } from '../../../utils/logger';

export class AuthRetryManager {
  private static instance: AuthRetryManager;
  private retryCount = 0;
  private lastAttempt: number | null = null;
  private readonly MAX_RETRIES = 2;
  private readonly COOLDOWN_PERIOD = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  public static getInstance(): AuthRetryManager {
    if (!AuthRetryManager.instance) {
      AuthRetryManager.instance = new AuthRetryManager();
    }
    return AuthRetryManager.instance;
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
      maxRetries: this.MAX_RETRIES 
    });
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
      inCooldown: !this.checkCooldown()
    };
  }
}
