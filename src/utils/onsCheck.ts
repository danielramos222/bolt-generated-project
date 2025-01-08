/**
 * Utilitário específico para verificar o servidor ONS
 */
import { checkServerHealth } from './serverCheck';
import { logger } from './logger';

const ONS_URL = 'https://integra.ons.org.br';

export async function checkONSAvailability() {
  logger.info('Verificando disponibilidade do servidor ONS...');
  
  const result = await checkServerHealth(ONS_URL);
  
  if (!result.isAvailable) {
    logger.error('Servidor ONS indisponível', {
      error: result.error,
      responseTime: result.responseTime
    });
  } else {
    logger.info('Servidor ONS disponível', {
      responseTime: result.responseTime
    });
  }
  
  return result;
}
