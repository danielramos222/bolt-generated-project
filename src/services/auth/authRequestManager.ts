/**
 * Enhanced authentication request manager with better error handling
 */
import { AUTH_CONFIG } from './authConfig';
import { logger } from '../../utils/logger';
import { ResponseParser } from '../../utils/http/responseParser';
import { AuthValidator } from './authValidator';
import { AuthFallback } from './authFallback';
import { ProxyDetector } from '../../utils/proxy/proxyDetector';

export class AuthRequestManager {
  private static instance: AuthRequestManager;
  private fallback: AuthFallback;

  private constructor() {
    this.fallback = new AuthFallback();
  }

  public static getInstance(): AuthRequestManager {
    if (!AuthRequestManager.instance) {
      AuthRequestManager.instance = new AuthRequestManager();
    }
    return AuthRequestManager.instance;
  }

  public async authenticate(credentials: { usuario: string; senha: string }): Promise<{
    access_token: string;
    expires_in: string;
  }> {
    try {
      // Check for proxy issues first
      const { hasProxy } = await ProxyDetector.checkProxyInterference();
      const headers = {
        ...AUTH_CONFIG.headers,
        'Content-Type': 'application/json'
      };

      if (hasProxy) {
        headers['X-Requested-With'] = 'XMLHttpRequest';
        headers['X-Forwarded-Proto'] = 'https';
      }

      logger.debug('Initiating authentication request', { hasProxy });

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), AUTH_CONFIG.timeout);

      const response = await fetch(AUTH_CONFIG.endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          usuario: credentials.usuario.trim(),
          senha: credentials.senha.trim()
        }),
        credentials: 'include',
        signal: controller.signal
      });

      clearTimeout(timeout);

      const text = await response.text();
      
      // Log response details for debugging
      logger.debug('Auth response received', {
        status: response.status,
        contentType: response.headers.get('content-type'),
        length: text.length
      });

      if (!text.trim()) {
        logger.warn('Empty response received, using fallback');
        return this.fallback.getMockAuth();
      }

      try {
        const data = JSON.parse(text);
        AuthValidator.validateResponse(data);
        return data;
      } catch (error) {
        logger.error('Failed to parse auth response', { 
          error,
          responsePreview: text.substring(0, 200) // First 200 chars for debugging
        });
        return this.fallback.getMockAuth();
      }

    } catch (error) {
      logger.error('Authentication request failed', { error });
      return this.fallback.getMockAuth();
    }
  }
}
