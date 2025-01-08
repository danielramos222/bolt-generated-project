/**
 * Authentication configuration with improved retry and fallback settings
 */
export const ONS_AUTH_CONFIG = {
  credentials: {
    usuario: import.meta.env.VITE_ONS_USUARIO,
    senha: import.meta.env.VITE_ONS_SENHA
  },
  maxRetries: 2,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  },
  endpoints: {
    auth: '/autenticar',
    refresh: '/renovar'
  },
  fallbackMode: {
    cooldownPeriod: 5 * 60 * 1000, // 5 minutes
    resetAfter: 30 * 60 * 1000,    // 30 minutes
    maxFailures: 3
  }
} as const;
