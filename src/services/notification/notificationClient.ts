/**
 * Enhanced notification client with rate limiting and retries
 */
import { supabase } from '../../lib/supabase';
import { NotificationErrorHandler } from './notificationErrorHandler';
import { RetryStrategy } from '../../utils/http/retryStrategy';
import { logger } from '../../utils/logger';

const NOTIFICATION_CONFIG = {
  maxRetries: 2,
  initialDelay: 2000,
  maxDelay: 10000
};

export class NotificationClient {
  private retryStrategy: RetryStrategy;

  constructor() {
    this.retryStrategy = new RetryStrategy(NOTIFICATION_CONFIG);
  }

  public async sendEmail(params: {
    to: string;
    subject: string;
    content: string;
  }): Promise<void> {
    await NotificationErrorHandler.handleRateLimit();

    return this.retryStrategy.execute(async () => {
      try {
        const { error } = await supabase.functions.invoke('send-email', {
          body: params,
          headers: {
            'Cache-Control': 'no-cache'
          }
        });

        if (error) {
          logger.error('Supabase function error', { error });
          throw error;
        }

        logger.info('Email sent successfully', { 
          to: params.to,
          subject: params.subject 
        });
      } catch (error) {
        NotificationErrorHandler.handleError(error, 'email sending');
        throw error;
      }
    });
  }
}
