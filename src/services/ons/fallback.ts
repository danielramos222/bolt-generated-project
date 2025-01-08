/**
 * Serviço de fallback para quando a API do ONS está indisponível
 */
import { mockInterventions } from './mockData';
import { logger } from '../../utils/logger';
import { getInterventionDateRange } from '../../utils/date/interventionDateRange';

export class ONSFallbackService {
  private static instance: ONSFallbackService;
  
  private constructor() {}
  
  public static getInstance(): ONSFallbackService {
    if (!ONSFallbackService.instance) {
      ONSFallbackService.instance = new ONSFallbackService();
    }
    return ONSFallbackService.instance;
  }

  public getMockAuth() {
    logger.info('Using mock authentication');
    return {
      access_token: 'mock_token',
      token_type: 'Bearer',
      expires_in: '3600',
      refresh_token: 'mock_refresh_token'
    };
  }

  public getMockInterventions() {
    logger.info('Using mock intervention data');
    const { startDate, endDate } = getInterventionDateRange();
    
    return {
      intervencoes: mockInterventions.map(intervention => ({
        ...intervention,
        dataHoraInicio: `${startDate}T08:00:00Z`,
        dataHoraFim: `${endDate}T17:00:00Z`
      })),
      total: mockInterventions.length,
      timestamp: new Date().toISOString()
    };
  }
}
