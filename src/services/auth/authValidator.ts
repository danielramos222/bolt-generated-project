/**
 * Enhanced authentication response validator
 */
import { logger } from '../../utils/logger';

interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number | string;
  refresh_token?: string;
}

export class AuthValidator {
  public static validateResponse(data: unknown): asserts data is AuthResponse {
    if (!data || typeof data !== 'object') {
      logger.error('Invalid auth response format', { 
        received: typeof data,
        value: data 
      });
      throw new Error('Invalid response format');
    }

    const response = data as Partial<AuthResponse>;
    const missingFields: string[] = [];
    
    if (!response.access_token) missingFields.push('access_token');
    if (!response.token_type) missingFields.push('token_type');
    if (!response.expires_in) missingFields.push('expires_in');

    if (missingFields.length > 0) {
      logger.error('Missing required fields in auth response', { 
        missingFields,
        receivedFields: Object.keys(response)
      });
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
  }
}
