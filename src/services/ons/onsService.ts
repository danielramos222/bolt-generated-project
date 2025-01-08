/**
 * Serviço de alto nível para interação com a API do ONS
 */
import { ONSClient } from './onsClient';
import { ONSFallbackService } from './fallback';
import { defaultCredentials } from '../../config/onsCredentials';
import { logger } from '../../utils/logger';
import { transformONSIntervention } from '../../utils/transformers/onsTransformer';
import { getDateRange } from '../../utils/dateRange';
import type { Intervention } from '../../types/intervention';

export class ONSService {
  private static instance: ONSService;
  private client: ONSClient;
  private fallback: ONSFallbackService;
  private useMockData: boolean = false;
  private retryCount: number = 0;
  private readonly MAX_RETRIES = 3;

  private constructor() {
    this.client = ONSClient.getInstance();
    this.fallback = ONSFallbackService.getInstance();
  }

  public static getInstance(): ONSService {
    if (!ONSService.instance) {
      ONSService.instance = new ONSService();
    }
    return ONSService.instance;
  }

  private async tryAuthenticate(): Promise<void> {
    try {
      await this.client.authenticate(defaultCredentials);
      this.useMockData = false;
      this.retryCount = 0;
    } catch (error) {
      this.retryCount++;
      logger.error('Authentication failed', error);
      
      if (this.retryCount >= this.MAX_RETRIES) {
        logger.warn('Switching to mock data after authentication failures');
        this.useMockData = true;
      } else {
        throw error;
      }
    }
  }

  public async getInterventions(): Promise<{ intervencoes: Intervention[] }> {
    try {
      if (this.useMockData) {
        logger.info('Using mock data');
        return this.fallback.getMockInterventions();
      }

      const { startDate, endDate } = getDateRange();

      try {
        const onsInterventions = await this.client.getInterventions({
          dataInicio: startDate,
          dataFim: endDate
        });

        logger.info('Successfully fetched interventions', {
          count: onsInterventions.length,
          period: `${startDate} to ${endDate}`
        });

        return {
          intervencoes: onsInterventions.map(transformONSIntervention)
        };
      } catch (error) {
        if (error instanceof Error && error.message === 'Token expired') {
          logger.info('Token expired, attempting to re-authenticate');
          await this.tryAuthenticate();
          return this.getInterventions();
        }
        throw error;
      }
    } catch (error) {
      logger.error('Failed to get interventions, using fallback', error);
      return this.fallback.getMockInterventions();
    }
  }
}
