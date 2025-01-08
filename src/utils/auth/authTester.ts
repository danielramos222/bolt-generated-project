/**
 * Utility for testing ONS authentication
 */
import { logger } from '../logger';
import { ResponseParser } from '../http/responseParser';

export class AuthTester {
  public static async testAuth(credentials: { usuario: string; senha: string }): Promise<void> {
    try {
      logger.info('Testing ONS authentication...');

      const response = await fetch('/api/autenticar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(credentials),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.status}`);
      }

      const data = await ResponseParser.parseJSON(response);
      
      // Log only non-sensitive information
      logger.info('Authentication successful', {
        status: response.status,
        tokenType: (data as any).token_type,
        expiresIn: (data as any).expires_in
      });

    } catch (error) {
      logger.error('Authentication test failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }
}
