/**
 * Centralized authentication handler
 */
import { APIClient } from '../../../utils/http/apiClient';
import { AuthRetryHandler } from '../../../utils/http/authRetry';
import { logger } from '../../../utils/logger';
import { ONS_AUTH_CONFIG } from '../../../config/onsAuth';
import { ONSAuthError } from '../errors/onsErrors';
import type { ONSAuthResponse } from '../../../types/ons/api';

export class AuthHandler {
  private static instance: AuthHandler;
  private retryHandler: AuthRetryHandler;
  private token: string | null = null;
  private tokenExpiration: Date | null = null;
  private isAuthenticating = false;

  private constructor(private apiClient: APIClient) {
    this.retryHandler = new AuthRetryHandler();
  }

  public static getInstance(apiClient: APIClient): AuthHandler {
    if (!AuthHandler.instance) {
      AuthHandler.instance = new AuthHandler(apiClient);
    }
    return AuthHandler.instance;
  }

  public async getValidToken(): Promise<string | null> {
    if (this.hasValidToken()) {
      return this.token;
    }

    if (this.isAuthenticating) {
      await this.waitForAuthentication();
      return this.token;
    }

    try {
      this.isAuthenticating = true;
      return await this.authenticate();
    } finally {
      this.isAuthenticating = false;
    }
  }

  private async authenticate(): Promise<string | null> {
    if (!this.retryHandler.shouldRetry()) {
      logger.info('Auth in cooldown period, using fallback');
      return null;
    }

    try {
      const response = await this.apiClient.request<ONSAuthResponse>(
        ONS_AUTH_CONFIG.endpoints.auth,
        {
          method: 'POST',
          body: JSON.stringify(ONS_AUTH_CONFIG.credentials),
          headers: ONS_AUTH_CONFIG.headers
        }
      );

      this.updateToken(response);
      this.retryHandler.reset();
      return this.token;

    } catch (error) {
      this.retryHandler.recordAttempt();
      logger.error('Authentication failed', { 
        error,
        retryState: this.retryHandler.getState()
      });
      return null;
    }
  }

  private updateToken(response: ONSAuthResponse): void {
    this.token = response.access_token;
    this.tokenExpiration = new Date(Date.now() + parseInt(response.expires_in) * 1000);
  }

  private hasValidToken(): boolean {
    return !!(
      this.token && 
      this.tokenExpiration && 
      this.tokenExpiration.getTime() > Date.now() + (5 * 60 * 1000)
    );
  }

  private async waitForAuthentication(): Promise<void> {
    const maxWait = 10000;
    const interval = 100;
    let waited = 0;

    while (this.isAuthenticating && waited < maxWait) {
      await new Promise(resolve => setTimeout(resolve, interval));
      waited += interval;
    }

    if (waited >= maxWait) {
      throw new ONSAuthError('Authentication timeout');
    }
  }
}
