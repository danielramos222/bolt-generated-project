/**
 * Tipos da API do ONS baseados na especificação OpenAPI
 */
export interface ONSAuthRequest {
  usuario: string;
  senha: string;
}

export interface ONSAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: string;
  refresh_token: string;
}

export interface ONSAuthError {
  error: string;
  error_description: string;
}

export interface ONSErrorResponse {
  hasError: boolean;
  errorStack: Record<string, unknown>;
  messageId: string;
  errorMessage: string;
}

export interface ONSIntervencaoFiltro {
  numeroONS?: string;
  numeroAgente?: string;
  dataInicio: string;
  dataFim: string;
  agentesSolicitantes?: string[];
  uFs?: string[];
  situacoes?: number[];
  centroResponsavel?: string;
  malha?: number;
  tipo?: number;
  caracterizacao?: number;
  natureza?: number;
}
