import { defaultCredentials } from '../config/onsCredentials';
import { logger } from '../utils/logger';
import API_CONFIG from '../config/api';

export class ONSService {
  private static instance: ONSService;
  private token: string | null = null;
  private tokenExpiration: Date | null = null;

  private constructor() {}

  public static getInstance(): ONSService {
    if (!ONSService.instance) {
      ONSService.instance = new ONSService();
    }
    return ONSService.instance;
  }

  private async makeRequest<T>(url: string, options: RequestInit): Promise<T> {
    const { maxRetries, initialDelay, maxDelay } = API_CONFIG.retryConfig;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        logger.debug('Making HTTP request', { 
          url, 
          method: options.method,
          attempt: attempt + 1
        });

        // Use the proxy server instead of direct API calls
        const response = await fetch(url, {
          ...options,
          credentials: 'include', // Important for CORS
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            ...options.headers,
          }
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error_description || `HTTP Error: ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt < maxRetries) {
          const delay = Math.min(initialDelay * Math.pow(2, attempt), maxDelay);
          logger.warn(`Request failed, retrying in ${delay}ms`, { attempt: attempt + 1, error });
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('Request failed after all retries');
  }

  private isTokenExpired(): boolean {
    if (!this.token || !this.tokenExpiration) return true;
    return new Date() > new Date(this.tokenExpiration.getTime() - 5 * 60 * 1000);
  }

  public async authenticate(): Promise<void> {
    try {
      logger.info('Starting authentication');
      
      const data = await this.makeRequest<any>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.auth}`, {
        method: 'POST',
        body: JSON.stringify(defaultCredentials)
      });

      if (!data.access_token) {
        throw new Error('Token not found in response');
      }

      this.token = data.access_token;
      this.tokenExpiration = new Date(Date.now() + (data.expires_in * 1000));
      
      logger.info('Authentication successful');
    } catch (error) {
      logger.error('Authentication failed', error);
      throw error;
    }
  }

  public async getInterventions() {
    try {
      if (this.isTokenExpired()) {
        await this.authenticate();
      }

      const today = new Date().toISOString().split('T')[0];
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 89);
      
      const url = new URL(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.interventions}`);
      url.searchParams.append('filtro.dataInicio', today);
      url.searchParams.append('filtro.dataFim', endDate.toISOString().split('T')[0]);

      const data = await this.makeRequest(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      return data;
    } catch (error) {
      logger.error('Failed to fetch interventions', error);
      throw error;
    }
  }
}
