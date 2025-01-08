/**
 * Centralized authentication configuration
 */
export const AUTH_CONFIG = {
  credentials: {
    usuario: import.meta.env.VITE_ONS_USUARIO,
    senha: import.meta.env.VITE_ONS_SENHA
  },
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Connection': 'keep-alive'
  },
  retry: {
    maxAttempts: 2,
    initialDelay: 1000,
    maxDelay: 5000,
    backoffFactor: 2
  },
  token: {
    expirationBuffer: 5 * 60 * 1000, // 5 minutes
    refreshThreshold: 10 * 60 * 1000  // 10 minutes
  }
} as const;
