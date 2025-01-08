/**
 * Configuração específica para integração com ONS
 */
export const ONS_CONFIG = {
  baseUrl: 'https://integra.ons.org.br',
  endpoints: {
    auth: '/api/autenticar',
    interventions: '/api/sgi/intervencoes'
  },
  fallback: {
    enabled: true,
    maxAuthRetries: 3,
    tokenExpirationBuffer: 5 * 60 * 1000 // 5 minutes
  }
} as const;
