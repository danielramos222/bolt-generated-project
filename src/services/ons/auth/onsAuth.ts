import { APIClient } from '../../../utils/http/apiClient';
import { logger } from '../../../utils/logger';
import { ONS_AUTH_CONFIG } from '../../../config/onsAuth';
import { ONSFallbackService } from '../fallback';
import { AuthStateManager } from './authState';
import { AuthRetryHandler } from '../../../utils/http/authRetry';
import { ONSAuthError } from '../errors/onsErrors';
import type { ONSAuthResponse } from '../../../types/ons/api';

export class ONSAuth {
  private stateManager: AuthStateManager;
  private fallbackService: ONSFallbackService;
  private retryHandler: AuthRetryHandler;
  private isAuthenticating = false;
  private authPromise: Promise<string | null> | null = null;

  constructor(private apiClient: APIClient) {
    this.stateManager = AuthStateManager.getInstance();
    this.fallbackService = ONSFallbackService.getInstance();
    this.retryHandler = new AuthRetryHandler();
  }

  public async getValidToken(): Promise<string | null> {
    const state = this.stateManager.getState();

    if (state.token && !this.isTokenExpired(state.tokenExpiration)) {
      return state.token;
    }

    if (this.isAuthenticating && this.authPromise) {
      return this.authPromise;
    }

    this.isAuthenticating = true;
    this.authPromise = this.authenticate();

    try {
      const token = await this.authPromise;
      return token;
    } finally {
      this.isAuthenticating = false;
      this.authPromise = null;
    }
  }

  private async authenticate(): Promise<string | null> {
    if (!this.retryHandler.shouldRetry()) {
      logger.info('Using fallback auth due to retry limits');
      return this.useFallbackAuth();
    }

    try {
      const response = await this.apiClient.request<ONSAuthResponse>(
        '/autenticar',
        {
          method: 'POST',
          body: JSON.stringify({
            usuario: ONS_AUTH_CONFIG.credentials.usuario,
            senha: ONS_AUTH_CONFIG.credentials.senha
          }),
          headers: {
            ...ONS_AUTH_CONFIG.headers,
            'User-Agent': ONS_AUTH_CONFIG.userAgent
          },
          retries: 1
        }
      );

      if (!response.access_token) {
        throw new ONSAuthError('Invalid auth response');
      }

      this.updateAuthState(response);
      this.retryHandler.reset();
      logger.info('Authentication successful');
      return response.access_token;

    } catch (error) {
      this.retryHandler.recordAttempt();
      logger.error('Authentication failed', { 
        error,
        retryState: this.retryHandler.getState()
      });
      return this.useFallbackAuth();
    }
  }

  private updateAuthState(response: ONSAuthResponse): void {
    this.stateManager.updateState({
      token: response.access_token,
      refreshToken: response.refresh_token,
      tokenExpiration: new Date(Date.now() + parseInt(response.expires_in) * 1000),
      retryCount: 0
    });
  }

  private async useFallbackAuth(): Promise<string> {
    const mockAuth = this.fallbackService.getMockAuth();
    this.updateAuthState(mockAuth);
    return mockAuth.access_token;
  }

  private isTokenExpired(expiration: Date | null): boolean {
    if (!expiration) return true;
    return new Date() > new Date(expiration.getTime() - 5 * 60 * 1000);
  }
}
