/**
 * Fallback authentication mechanism
 */
import { logger } from '../../utils/logger';

export class AuthFallback {
  public getMockAuth(): { access_token: string; expires_in: string } {
    logger.info('Using mock authentication');
    return {
      access_token: 'mock_token_' + Date.now(),
      expires_in: '3600'
    };
  }
}
