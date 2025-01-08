/**
 * Configuração centralizada para retry de requisições
 */
export const RETRY_CONFIG = {
  auth: {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 5000,
    shouldRetry: (error: any) => {
      return error.status === 500 || 
             error.status === 502 || 
             error.status === 503;
    }
  },
  api: {
    maxRetries: 2,
    initialDelay: 2000,
    maxDelay: 10000,
    shouldRetry: (error: any) => {
      return error.status >= 500 || 
             error.code === 'ECONNRESET';
    }
  }
} as const;
