export const PROXY_CONFIG = {
  target: 'https://integra.ons.org.br',
  changeOrigin: true,
  secure: false,
  timeout: 30000,
  proxyTimeout: 30000,
  followRedirects: true,
  ws: true,
  xfwd: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Connection': 'keep-alive',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  },
  pathRewrite: {
    '^/api': ''
  },
  onProxyReq: (proxyReq: any) => {
    proxyReq.setHeader('X-Forwarded-Proto', 'https');
  }
} as const;

export const AUTH_CONFIG = {
  endpoint: '/api/autenticar',
  timeout: 30000,
  retries: 3,
  retryDelay: 2000
} as const;
export const PORT = 3003; // Ou qualquer outra porta desejada
