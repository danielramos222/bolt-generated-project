/**
 * Enhanced response parser with better error handling
 */
import { logger } from '../logger';

export class ResponseParser {
  public static async parseJSON<T>(response: Response): Promise<T> {
    try {
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        throw new Error(`Unexpected content type: ${contentType}`);
      }

      const text = await response.text();
      if (!text.trim()) {
        logger.error('Empty response received', {
          status: response.status,
          contentType,
          url: response.url
        });
        throw new Error('Empty response from server');
      }

      logger.debug('Response received', {
        status: response.status,
        contentType,
        length: text.length,
        preview: text.substring(0, 100) // First 100 chars
      });

      try {
        const data = JSON.parse(text);
        
        // Check for error responses
        if (!response.ok) {
          const errorMessage = data.error_description || data.message || 'Unknown error';
          throw new Error(`Request failed: ${errorMessage}`);
        }

        return data as T;
      } catch (parseError) {
        logger.error('JSON parsing failed', { 
          text: text.substring(0, 200), // First 200 chars
          status: response.status,
          contentType
        });
        throw new Error('Invalid JSON response');
      }
    } catch (error) {
      logger.error('Response parsing failed', {
        status: response.status,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }
}
