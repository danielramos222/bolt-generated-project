/**
 * Core authentication service with improved error handling
 */
import { APIClient } from '../../../utils/http/apiClient';
import { AuthStateManager } from './authState';
import { ONSFallbackService } from '../fallback';
import { logger } from '../../../utils/logger';
import { ONS_AUTH_CONFIG } from '../../../config/onsAuth';

export class AuthService {
  private static instance: AuthService;
  private stateManager: AuthStateManager;
  private fallbackService: ONSFallbackService;

  private constructor(private apiClient: APIClient) {
    this.stateManager = AuthStateManager.getInstance();
    this.fallbackService = ONSFallbackService.getInstance();
  }

  public static getInstance(apiClient: APIClient): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService(apiClient);
    }
    return AuthService.instance;
  }

  public async getValidToken(): Promise<string | null> {
    if (this.stateManager.isTokenValid()) {
      return this.stateManager.getToken();
    }

    if (this.stateManager.isAuthenticating()) {
      await this.waitForAuthentication();
      return this.stateManager.getToken();
    }

    return this.authenticate();
  }

  private async authenticate(): Promise<string | null> {
    this.stateManager.setAuthenticating(true);

    try {
      if (this.stateManager.getRetryCount() >= ONS_AUTH_CONFIG.maxRetries) {
        logger.info('Max retries reached, using fallback auth');
        return this.useFallbackAuth();
      }

      const response = await this.apiClient.request('/autenticar', {
        method: 'POST',
        body: JSON.stringify({
          usuario: ONS_AUTH_CONFIG.credentials.usuario,
          senha: ONS_AUTH_CONFIG.credentials.senha
        }),
        headers: ONS_AUTH_CONFIG.headers,
        retries: 1
      });

      if (!response.access_token) {
        throw new Error('Invalid auth response');
      }

      this.stateManager.setToken(response.access_token, response.expires_in);
      logger.info('Authentication successful');
      return response.access_token;

    } catch (error) {
      this.stateManager.incrementRetry();
      logger.error('Authentication failed', { 
        error,
        retryCount: this.stateManager.getRetryCount()
      });
      return this.useFallbackAuth();

    } finally {
      this.stateManager.setAuthenticating(false);
    }
  }

  private async useFallbackAuth(): Promise<string> {
    const mockAuth = this.fallbackService.getMockAuth();
    this.stateManager.setToken(mockAuth.access_token, parseInt(mockAuth.expires_in));
    return mockAuth.access_token;
  }

  private async waitForAuthentication(timeout = 10000): Promise<void> {
    const start = Date.now();
    while (this.stateManager.isAuthenticating() && Date.now() - start < timeout) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}
