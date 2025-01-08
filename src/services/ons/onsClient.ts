import { APIClient } from '../../utils/http/apiClient';
import { logger } from '../../utils/logger';
import { ONSFallbackService } from './fallback';
import { ONSAuth } from './auth/onsAuth';
import { AuthHandler } from './auth/authHandler';
import { DEFAULT_SEARCH_CONFIG } from '../../config/searchDefaults';
import type { SearchFilters } from '../../components/search/SearchForm';

export class ONSClient {
  private static instance: ONSClient;
  private auth: ONSAuth;
  private authHandler: AuthHandler;
  private fallbackService: ONSFallbackService;
  private apiClient: APIClient;
  private useFallback = false;

  private constructor() {
    this.apiClient = APIClient.getInstance();
    this.auth = new ONSAuth(this.apiClient);
    this.authHandler = AuthHandler.getInstance(this.apiClient);
    this.fallbackService = ONSFallbackService.getInstance();
  }

  public static getInstance(): ONSClient {
    if (!ONSClient.instance) {
      ONSClient.instance = new ONSClient();
    }
    return ONSClient.instance;
  }

  public async getInterventions(filters?: SearchFilters) {
    if (this.useFallback) {
      return this.fallbackService.getMockInterventions();
    }

    try {
      const token = await this.authHandler.getValidToken();
      
      if (!token) {
        this.useFallback = true;
        return this.fallbackService.getMockInterventions();
      }

      const defaultDates = DEFAULT_SEARCH_CONFIG.getDefaultDates();
      const searchParams = new URLSearchParams();

      // Add date filters
      searchParams.append('filtro.dataInicio', filters?.startDate || defaultDates.startDate);
      searchParams.append('filtro.dataFim', filters?.endDate || defaultDates.endDate);

      // Add CEMIG agents
      const agents = filters?.agents?.length 
        ? filters.agents 
        : DEFAULT_SEARCH_CONFIG.defaultAgents;

      agents.forEach(agent => {
        searchParams.append('filtro.agentesSolicitantes', agent);
      });

      logger.info('Fetching interventions', { 
        dates: {
          start: filters?.startDate || defaultDates.startDate,
          end: filters?.endDate || defaultDates.endDate
        },
        agents 
      });

      const response = await this.apiClient.request(
        `/sgi/intervencoes?${searchParams.toString()}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      this.useFallback = false;
      return response;

    } catch (error) {
      logger.error('Failed to fetch interventions', error);
      this.useFallback = true;
      return this.fallbackService.getMockInterventions();
    }
  }
}
