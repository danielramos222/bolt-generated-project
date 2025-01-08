/**
 * Utility for detecting and handling proxy configurations
 */
import { logger } from '../logger';

export class ProxyDetector {
  public static async checkProxyInterference(): Promise<{
    hasProxy: boolean;
    details: string;
  }> {
    try {
      const response = await fetch('/api/health', {
        method: 'HEAD',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      const proxyHeaders = [
        'via',
        'x-forwarded-for',
        'x-forwarded-host',
        'x-forwarded-proto',
        'x-real-ip'
      ];

      const foundProxyHeaders = proxyHeaders.filter(header => 
        response.headers.has(header)
      );

      const hasProxy = foundProxyHeaders.length > 0;
      
      logger.info('Proxy detection results', {
        hasProxy,
        proxyHeaders: foundProxyHeaders,
        status: response.status,
        statusText: response.statusText
      });

      return {
        hasProxy,
        details: hasProxy 
          ? `Proxy detectado: ${foundProxyHeaders.join(', ')}` 
          : 'Nenhum proxy detectado'
      };
    } catch (error) {
      logger.error('Erro ao verificar proxy', error);
      return {
        hasProxy: true,
        details: 'Possível bloqueio de proxy detectado'
      };
    }
  }
}
