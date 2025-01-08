/**
 * Service for diagnosing proxy-related issues
 */
import { logger } from '../../utils/logger';
import { ProxyHealthCheck } from './proxyHealthCheck';
import { PROXY_CONFIG } from '../../utils/proxy/proxyConfig';

export class ProxyDiagnostics {
  private static instance: ProxyDiagnostics;

  private constructor() {}

  public static getInstance(): ProxyDiagnostics {
    if (!ProxyDiagnostics.instance) {
      ProxyDiagnostics.instance = new ProxyDiagnostics();
    }
    return ProxyDiagnostics.instance;
  }

  public async diagnoseConnection(): Promise<{
    hasProxyIssues: boolean;
    recommendations: string[];
  }> {
    try {
      logger.info('Running proxy diagnostics...');

      // Check proxy health
      const { isHealthy, details } = await ProxyHealthCheck.checkProxyStatus();

      if (!isHealthy) {
        return {
          hasProxyIssues: true,
          recommendations: [
            'Detectamos problemas com o proxy corporativo:',
            ...details,
            '',
            'Recomendações:',
            '1. Verifique se você está conectado à VPN corporativa',
            '2. Solicite ao suporte de TI a liberação do domínio: integra.ons.org.br',
            '3. Verifique se há bloqueios de firewall para os endpoints da API',
            '4. Confirme se os certificados corporativos estão atualizados'
          ]
        };
      }

      return {
        hasProxyIssues: false,
        recommendations: ['Conexão com proxy está funcionando corretamente']
      };

    } catch (error) {
      logger.error('Proxy diagnostics failed', error);
      return {
        hasProxyIssues: true,
        recommendations: [
          'Não foi possível completar o diagnóstico do proxy',
          'Por favor, entre em contato com o suporte de TI'
        ]
      };
    }
  }

  public async testEndpoint(): Promise<boolean> {
    try {
      const response = await fetch('/api/health', {
        method: 'HEAD',
        headers: PROXY_CONFIG.headers
      });

      return response.ok;
    } catch (error) {
      logger.error('Endpoint test failed', error);
      return false;
    }
  }
}
