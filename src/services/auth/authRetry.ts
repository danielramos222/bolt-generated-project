/**
 * Enhanced retry handler for authentication
 */
import { logger } from '../../utils/logger';

export class AuthRetry {
  private attempts = 0;
  private lastAttempt: number | null = null;
  private readonly MAX_ATTEMPTS = 3;
  private readonly COOLDOWN = 5 * 60 * 1000; // 5 minutes

  public canRetry(): boolean {
    if (this.attempts >= this.MAX_ATTEMPTS) {
      if (!this.lastAttempt) return true;
      
      const cooldownEnded = Date.now() - this.lastAttempt >= this.COOLDOWN;
      if (cooldownEnded) {
        this.reset();
        return true;
      }
      return false;
    }
    return true;
  }

  public recordAttempt(): void {
    this.attempts++;
    this.lastAttempt = Date.now();
    logger.debug('Auth retry recorded', { 
      attempts: this.attempts,
      maxRetries: this.MAX_ATTEMPTS 
    });
  }

  public reset(): void {
    this.attempts = 0;
    this.lastAttempt = null;
  }

  public getState() {
    return {
      attempts: this.attempts,
      lastAttempt: this.lastAttempt,
      inCooldown: this.attempts >= this.MAX_ATTEMPTS && 
        this.lastAttempt && 
        Date.now() - this.lastAttempt < this.COOLDOWN
    };
  }
}
