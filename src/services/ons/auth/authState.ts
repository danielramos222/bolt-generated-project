/**
 * Centralized authentication state management
 */
import { logger } from '../../../utils/logger';

interface AuthState {
  token: string | null;
  tokenExpiration: Date | null;
  retryCount: number;
  lastAttempt: Date | null;
  isAuthenticating: boolean;
}

export class AuthStateManager {
  private static instance: AuthStateManager;
  private state: AuthState = {
    token: null,
    tokenExpiration: null,
    retryCount: 0,
    lastAttempt: null,
    isAuthenticating: false
  };

  private constructor() {}

  public static getInstance(): AuthStateManager {
    if (!AuthStateManager.instance) {
      AuthStateManager.instance = new AuthStateManager();
    }
    return AuthStateManager.instance;
  }

  public setAuthenticating(value: boolean): void {
    this.state.isAuthenticating = value;
    if (value) {
      this.state.lastAttempt = new Date();
    }
  }

  public isAuthenticating(): boolean {
    return this.state.isAuthenticating;
  }

  public setToken(token: string, expiresIn: number): void {
    this.state.token = token;
    this.state.tokenExpiration = new Date(Date.now() + expiresIn * 1000);
    this.state.retryCount = 0;
    logger.debug('Auth token updated', { expiresIn });
  }

  public clearToken(): void {
    this.state.token = null;
    this.state.tokenExpiration = null;
  }

  public isTokenValid(): boolean {
    if (!this.state.token || !this.state.tokenExpiration) return false;
    return this.state.tokenExpiration.getTime() > Date.now() + (5 * 60 * 1000);
  }

  public incrementRetry(): number {
    return ++this.state.retryCount;
  }

  public getRetryCount(): number {
    return this.state.retryCount;
  }

  public getToken(): string | null {
    return this.state.token;
  }

  public reset(): void {
    this.state = {
      token: null,
      tokenExpiration: null,
      retryCount: 0,
      lastAttempt: null,
      isAuthenticating: false
    };
  }
}
