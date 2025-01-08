import { env } from './env';

const API_CONFIG = {
  baseUrl: env.isDev ? `http://localhost:${env.port}/api` : '/api',
  endpoints: {
    auth: '/autenticar',
    interventions: '/sgi/intervencoes'
  },
  retryConfig: {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 5000
  }
} as const;

export default API_CONFIG;
