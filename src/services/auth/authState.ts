/**
 * Authentication state manager with proper locking
 */
import { logger } from '../../utils/logger';

export class AuthState {
  private static instance: AuthState;
  private locked = false;
  private lockTime: number | null = null;
  private readonly LOCK_TIMEOUT = 30000; // 30 seconds

  private constructor() {}

  public static getInstance(): AuthState {
    if (!AuthState.instance) {
      AuthState.instance = new AuthState();
    }
    return AuthState.instance;
  }

  public async acquireLock(): Promise<boolean> {
    if (this.locked) {
      if (this.lockTime && Date.now() - this.lockTime > this.LOCK_TIMEOUT) {
        logger.warn('Force releasing stale auth lock');
        this.releaseLock();
      } else {
        return false;
      }
    }
    
    this.locked = true;
    this.lockTime = Date.now();
    return true;
  }

  public releaseLock(): void {
    this.locked = false;
    this.lockTime = null;
  }

  public isLocked(): boolean {
    return this.locked;
  }
}
