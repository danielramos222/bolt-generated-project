/**
 * Service for checking proxy health and connectivity
 */
import { ProxyDetector } from '../../utils/proxy/proxyDetector';
import { ProxyTester } from '../../utils/proxy/proxyTester';
import { logger } from '../../utils/logger';

export class ProxyHealthCheck {
  public static async checkProxyStatus(): Promise<{
    isHealthy: boolean;
    details: string[];
  }> {
    try {
      logger.info('Iniciando verificação de proxy...');

      // Verifica se há proxy
      const { hasProxy, details: proxyDetails } = 
        await ProxyDetector.checkProxyInterference();

      // Testa conectividade
      const { success, details: connectivityDetails } = 
        await ProxyTester.testConnectivity();

      const details = [
        proxyDetails,
        connectivityDetails
      ];

      if (hasProxy && !success) {
        details.push(
          'ATENÇÃO: Proxy detectado e bloqueando conexões.',
          'Sugestões:',
          '1. Verifique as configurações de proxy da sua rede',
          '2. Contate o suporte de TI para liberar acesso aos endpoints necessários',
          '3. Verifique se há regras de firewall bloqueando as conexões'
        );
      }

      return {
        isHealthy: !hasProxy || success,
        details
      };

    } catch (error) {
      logger.error('Erro ao verificar status do proxy', error);
      return {
        isHealthy: false,
        details: ['Erro ao verificar status do proxy']
      };
    }
  }
}
