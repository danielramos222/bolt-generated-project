/**
 * Low-level authentication client with enhanced error handling
 */
import { AUTH_CONFIG } from './authConfig';
import { logger } from '../../utils/logger';
import { ResponseParser } from '../../utils/http/responseParser';

export class AuthClient {
  private static instance: AuthClient;

  private constructor() {}

  public static getInstance(): AuthClient {
    if (!AuthClient.instance) {
      AuthClient.instance = new AuthClient();
    }
    return AuthClient.instance;
  }

  public async authenticate(credentials: { usuario: string; senha: string }): Promise<string> {
    try {
      logger.debug('Initiating authentication request', {
        url: AUTH_CONFIG.endpoint,
        headers: AUTH_CONFIG.headers
      });

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), AUTH_CONFIG.timeout);

      const response = await fetch(AUTH_CONFIG.endpoint, {
        method: 'POST',
        headers: AUTH_CONFIG.headers,
        body: JSON.stringify(credentials),
        credentials: 'include',
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Authentication failed (${response.status}): ${errorText}`);
      }

      const data = await ResponseParser.parseJSON(response);
      
      if (!data.access_token) {
        throw new Error('Invalid authentication response: missing token');
      }

      logger.info('Authentication successful');
      return data.access_token;

    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error('Authentication request timed out');
      }
      throw error;
    }
  }
}
