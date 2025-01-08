/**
 * Tratamento específico de erros da API do ONS
 */
import { HTTPError } from './errorHandler';
import { logger } from '../logger';
import type { ONSAuthError, ONSErrorResponse } from '../../types/ons/api';

export class ONSError extends HTTPError {
  constructor(
    message: string,
    statusCode: number,
    public readonly onsError?: ONSAuthError | ONSErrorResponse
  ) {
    super(message, statusCode);
    this.name = 'ONSError';
  }
}

export function handleONSError(response: Response, data: ONSAuthError | ONSErrorResponse): never {
  const message = 'error_description' in data 
    ? data.error_description 
    : data.errorMessage;

  logger.error('ONS API Error', {
    status: response.status,
    error: data
  });

  throw new ONSError(message, response.status, data);
}
