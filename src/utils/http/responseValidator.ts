/**
 * Enhanced response validation
 */
import { logger } from '../logger';

export class ResponseValidator {
  public static validateAuthResponse(response: Response, text: string): void {
    // Check content type
    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      logger.warn('Unexpected content type', { 
        contentType,
        status: response.status
      });
    }

    // Check response length
    if (!text.trim()) {
      logger.error('Empty response received', {
        status: response.status,
        contentType
      });
      throw new Error('Empty response from server');
    }

    // Log response details (safely)
    logger.debug('Response received', {
      status: response.status,
      contentType,
      length: text.length,
      preview: text.substring(0, 100) // First 100 chars
    });
  }

  public static validateJSONStructure(data: unknown): void {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response format');
    }

    const response = data as Record<string, unknown>;
    const requiredFields = ['access_token', 'token_type', 'expires_in'];
    const missingFields = requiredFields.filter(field => !response[field]);

    if (missingFields.length > 0) {
      logger.error('Missing required fields', {
        missing: missingFields,
        received: Object.keys(response)
      });
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
  }
}
