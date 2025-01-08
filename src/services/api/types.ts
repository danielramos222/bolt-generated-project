/**
 * Tipos para configuração de requisições HTTP e respostas da API
 */
export interface RequestConfig extends RequestInit {
  retries?: number;
  initialDelay?: number;
  maxDelay?: number;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
}

export interface ErrorResponse {
  error: string;
  error_description: string;
}

export interface APIError {
  code: string;
  message: string;
  details?: unknown;
}
