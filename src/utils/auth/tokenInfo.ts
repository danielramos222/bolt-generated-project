/**
 * Utilitário para informações seguras sobre o token
 */
import { logger } from '../logger';

export class TokenInfo {
  public static logTokenInfo(token: string | null): void {
    if (!token) {
      logger.info('Token não disponível');
      return;
    }

    try {
      // Divide o token em partes (header.payload.signature)
      const [header, payload] = token.split('.');
      
      if (!header || !payload) {
        logger.info('Token inválido ou mal formatado');
        return;
      }

      // Decodifica o payload (parte segura para log)
      const decodedPayload = JSON.parse(atob(payload));
      
      // Log apenas de informações não sensíveis
      logger.info('Informações do Token', {
        expiresIn: new Date(decodedPayload.exp * 1000).toLocaleString('pt-BR'),
        issuedAt: new Date(decodedPayload.iat * 1000).toLocaleString('pt-BR'),
        tokenType: decodedPayload.typ || 'Não especificado'
      });

    } catch (error) {
      logger.error('Erro ao processar informações do token', error);
    }
  }
}
