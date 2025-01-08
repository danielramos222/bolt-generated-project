/**
 * Enhanced authentication debugging utility
 */
import { logger } from '../logger';

export class AuthDebugger {
  private static readonly AUTH_URL = '/api/autenticar';

  public static async testConnection(): Promise<void> {
    try {
      const response = await fetch(this.AUTH_URL, {
        method: 'OPTIONS',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });

      logger.info('Connection test result', {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries())
      });

    } catch (error) {
      logger.error('Connection test failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        url: this.AUTH_URL
      });
    }
  }

  public static async testAuth(credentials: { usuario: string; senha: string }): Promise<void> {
    try {
      logger.info('Starting auth test...');

      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Connection': 'keep-alive'
      };

      logger.debug('Auth request details', {
        url: this.AUTH_URL,
        method: 'POST',
        headers
      });

      const response = await fetch(this.AUTH_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(credentials),
        credentials: 'include'
      });

      const responseText = await response.text();
      
      logger.info('Auth test response', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        responsePreview: responseText.substring(0, 500) // First 500 chars
      });

      if (!response.ok) {
        throw new Error(`Auth failed: ${response.status} - ${responseText}`);
      }

      try {
        const data = JSON.parse(responseText);
        logger.info('Auth response parsed successfully', {
          hasToken: !!data.access_token,
          tokenType: data.token_type,
          expiresIn: data.expires_in
        });
      } catch (error) {
        logger.error('Failed to parse auth response', {
          error: error instanceof Error ? error.message : 'Unknown error',
          responsePreview: responseText.substring(0, 100) // First 100 chars
        });
      }

    } catch (error) {
      logger.error('Auth test failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        url: this.AUTH_URL
      });
      throw error;
    }
  }

  public static validateAuthResponse(data: unknown): void {
    if (!data || typeof data !== 'object') {
      logger.error('Invalid response type', { received: typeof data });
      return;
    }

    const response = data as Record<string, unknown>;
    const requiredFields = ['access_token', 'token_type', 'expires_in'];
    const missingFields = requiredFields.filter(field => !response[field]);

    if (missingFields.length > 0) {
      logger.error('Missing required fields', {
        missing: missingFields,
        received: Object.keys(response)
      });
    }

    logger.debug('Response validation', {
      hasRequiredFields: missingFields.length === 0,
      fields: Object.keys(response)
    });
  }
}
