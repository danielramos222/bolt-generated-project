import { logger } from '../../utils/logger';

const TIMEOUT = 5000;

export async function checkConnectivity(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

    const response = await fetch('/health', {
      signal: controller.signal,
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    clearTimeout(timeoutId);
    
    if (!response.ok) {
      logger.warn('Health check failed', { status: response.status });
      return false;
    }

    const data = await response.json();
    
    if (!data.ons?.available) {
      logger.warn('ONS server is not available', data.ons);
      return false;
    }
    
    return true;
  } catch (error) {
    if (error instanceof Error) {
      logger.error('Network check failed', { 
        message: error.message,
        name: error.name 
      });
    }
    return false;
  }
}
