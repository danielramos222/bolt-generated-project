/**
 * Cliente HTTP unificado com melhor tratamento de erros
 */
import { logger } from '../logger';
import { calculateRetryDelay, shouldRetryRequest } from './retryStrategy';

export class APIClient {
  private static instance: APIClient;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = '/api';
  }

  public static getInstance(): APIClient {
    if (!APIClient.instance) {
      APIClient.instance = new APIClient();
    }
    return APIClient.instance;
  }

  public async request<T>(endpoint: string, config: RequestInit & {
    params?: Record<string, string>;
    retries?: number;
    retryDelay?: number;
  }): Promise<T> {
    const { 
      params, 
      retries = 3, 
      retryDelay = 1000,
      ...fetchConfig 
    } = config;

    let url = this.baseUrl + endpoint;

    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.append(key, value);
      });
      url += `?${searchParams.toString()}`;
    }

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, {
          ...fetchConfig,
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            ...fetchConfig.headers,
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }

        const contentType = response.headers.get('content-type');
        return contentType?.includes('application/json') 
          ? await response.json()
          : await response.text();

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt === retries || !shouldRetryRequest(error)) {
          throw lastError;
        }
        
        const delay = calculateRetryDelay(attempt, {
          maxRetries: retries,
          initialDelay: retryDelay,
          maxDelay: retryDelay * Math.pow(2, retries)
        });

        logger.warn(`Request failed (attempt ${attempt + 1}/${retries + 1}), retrying in ${delay}ms`, {
          error: lastError.message,
          endpoint
        });

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError || new Error('Request failed after all retries');
  }
}
