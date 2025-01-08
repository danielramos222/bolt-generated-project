/**
 * Tratamento específico de erros da API do ONS
 */
import { HTTPError } from '../../utils/http/errorHandler';
import { logger } from '../../utils/logger';
import type { ONSAuthError } from './types';

export class ONSAuthenticationError extends HTTPError {
  constructor(message: string, public readonly details?: ONSAuthError) {
    super(message, 401);
    this.name = 'ONSAuthenticationError';
  }
}

export class ONSTimeoutError extends HTTPError {
  constructor(message: string) {
    super(message, 408);
    this.name = 'ONSTimeoutError';
  }
}

export class ONSServerError extends HTTPError {
  constructor(message: string, statusCode: number) {
    super(message, statusCode);
    this.name = 'ONSServerError';
  }
}

export function handleONSError(error: any): never {
  logger.error('ONS API Error', error);

  if (error.status === 401) {
    throw new ONSAuthenticationError('Falha na autenticação com o ONS');
  }

  if (error.status === 408 || error.code === 'ETIMEDOUT') {
    throw new ONSTimeoutError('Timeout na requisição ao ONS');
  }

  if (error.status >= 500) {
    throw new ONSServerError('Erro no servidor ONS', error.status);
  }

  throw error;
}
