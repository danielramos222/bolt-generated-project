import { logger } from '../../utils/logger';
import { calculateRetryDelay } from '../../utils/http/retryStrategy';
import { HTTPError, handleHTTPError } from '../../utils/http/errorHandler';
import type { RequestConfig } from './types';

export class HttpClient {
  private static instance: HttpClient;

  private constructor() {}

  public static getInstance(): HttpClient {
    if (!HttpClient.instance) {
      HttpClient.instance = new HttpClient();
    }
    return HttpClient.instance;
  }

  public async request<T>(url: string, config: RequestConfig): Promise<T> {
    const { retries = 3, initialDelay = 1000, maxDelay = 5000 } = config;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, {
          ...config,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            ...config.headers,
          }
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          handleHTTPError(response);
        }

        return await response.json();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt < retries) {
          const delay = calculateRetryDelay(attempt, { maxRetries: retries, initialDelay, maxDelay });
          logger.warn(`Request failed, retrying in ${delay}ms`, { 
            attempt: attempt + 1, 
            url,
            error: error instanceof HTTPError ? error.statusCode : error
          });
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('Request failed after all retries');
  }
}
