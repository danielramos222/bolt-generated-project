/**
 * Enhanced authentication configuration
 */
export const AUTH_CONFIG = {
  endpoint: '/api/autenticar',
  headers: {
    'Accept': 'application/json',
    'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Connection': 'keep-alive',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  },
  retry: {
    maxAttempts: 3,
    initialDelay: 2000,
    maxDelay: 10000,
    backoffFactor: 2,
    cooldownPeriod: 5 * 60 * 1000 // 5 minutes
  },
  timeout: 30000, // 30 seconds
  validation: {
    requiredFields: ['access_token', 'token_type', 'expires_in'],
    minResponseLength: 50 // Minimum expected response length
  }
} as const;
