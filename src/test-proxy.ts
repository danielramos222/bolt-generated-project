/**
 * Utility script for testing proxy configuration
 */
import { ProxyDiagnostics } from './services/proxy/proxyDiagnostics';
import { logger } from './utils/logger';

async function testProxyConfiguration() {
  const diagnostics = ProxyDiagnostics.getInstance();

  logger.info('Iniciando diagnóstico de proxy...');

  const { hasProxyIssues, recommendations } = await diagnostics.diagnoseConnection();

  if (hasProxyIssues) {
    logger.error('Problemas detectados com o proxy:', {
      recommendations
    });
  } else {
    logger.info('Configuração de proxy OK:', {
      recommendations
    });
  }

  // Test endpoint connectivity
  const endpointAccessible = await diagnostics.testEndpoint();
  logger.info('Teste de endpoint:', {
    success: endpointAccessible,
    endpoint: '/api/health'
  });
}

testProxyConfiguration().catch(error => {
  logger.error('Erro ao executar diagnóstico:', error);
  process.exit(1);
});
