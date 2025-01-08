/**
 * Specialized retry logic for authentication requests
 */
import { logger } from '../logger';
import { ONS_AUTH_CONFIG } from '../../config/onsAuth';

interface RetryState {
  attempt: number;
  lastAttempt: number | null;
}

export class AuthRetryHandler {
  private state: RetryState = {
    attempt: 0,
    lastAttempt: null
  };

  public shouldRetry(): boolean {
    const now = Date.now();
    
    // Reset attempts if enough time has passed
    if (this.state.lastAttempt && 
        now - this.state.lastAttempt >= ONS_AUTH_CONFIG.fallbackMode.resetAfter) {
      this.reset();
      return true;
    }

    // Check if we're in cooldown
    if (this.state.lastAttempt && 
        now - this.state.lastAttempt < ONS_AUTH_CONFIG.fallbackMode.cooldownPeriod) {
      logger.debug('Auth in cooldown period', {
        remainingCooldown: ONS_AUTH_CONFIG.fallbackMode.cooldownPeriod - (now - this.state.lastAttempt)
      });
      return false;
    }

    const shouldRetry = this.state.attempt < ONS_AUTH_CONFIG.maxRetries;
    
    if (!shouldRetry) {
      logger.debug('Max auth retries reached', {
        attempts: this.state.attempt,
        maxRetries: ONS_AUTH_CONFIG.maxRetries
      });
    }

    return shouldRetry;
  }

  public recordAttempt(): void {
    this.state.attempt++;
    this.state.lastAttempt = Date.now();
    
    logger.debug('Auth retry recorded', {
      attempt: this.state.attempt,
      maxRetries: ONS_AUTH_CONFIG.maxRetries
    });
  }

  public reset(): void {
    logger.debug('Auth retry state reset');
    this.state = {
      attempt: 0,
      lastAttempt: null
    };
  }

  public getState(): RetryState {
    return { ...this.state };
  }
}
