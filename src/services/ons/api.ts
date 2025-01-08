/**
 * Cliente de baixo nível para API do ONS
 */
import { APIClient } from '../../utils/http/apiClient';
import { logger } from '../../utils/logger';
import type { ONSResponse, ONSIntervencaoDetalhada } from './types';

export class ONSApi {
  private static instance: ONSApi;
  private client: APIClient;

  private constructor() {
    this.client = APIClient.getInstance();
  }

  public static getInstance(): ONSApi {
    if (!ONSApi.instance) {
      ONSApi.instance = new ONSApi();
    }
    return ONSApi.instance;
  }

  public async getIntervencoes(params: {
    dataInicio: string;
    dataFim: string;
  }): Promise<ONSResponse<ONSIntervencaoDetalhada[]>> {
    try {
      const queryParams = new URLSearchParams({
        'filtro.dataInicio': params.dataInicio,
        'filtro.dataFim': params.dataFim
      });

      logger.debug('Buscando intervenções ONS', params);

      const response = await this.client.request<ONSResponse<ONSIntervencaoDetalhada[]>>(
        `/sgi/intervencoes?${queryParams}`,
        {
          method: 'GET',
          retries: 3,
          initialDelay: 1000,
          maxDelay: 5000
        }
      );

      if (response.indErro) {
        throw new Error(response.mensagemErro?.Mensagem || 'Erro desconhecido na API do ONS');
      }

      return response;
    } catch (error) {
      logger.error('Erro ao buscar intervenções ONS', error);
      throw error;
    }
  }
}
