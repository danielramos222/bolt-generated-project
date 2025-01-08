/**
 * Handles notification sending with retries
 */
import { supabase } from '../../lib/supabase';
import { logger } from '../../utils/logger';
import { NotificationRateLimiter } from './notificationRateLimiter';

export class NotificationSender {
  private static instance: NotificationSender;
  private rateLimiter: NotificationRateLimiter;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 2000;

  private constructor() {
    this.rateLimiter = NotificationRateLimiter.getInstance();
  }

  public static getInstance(): NotificationSender {
    if (!NotificationSender.instance) {
      NotificationSender.instance = new NotificationSender();
    }
    return NotificationSender.instance;
  }

  public async send(params: {
    to: string;
    subject: string;
    content: string;
  }): Promise<void> {
    let attempt = 0;

    while (attempt < this.MAX_RETRIES) {
      try {
        await this.rateLimiter.waitIfNeeded();

        const { error } = await supabase.functions.invoke('send-email', {
          body: params,
          headers: { 'Cache-Control': 'no-cache' }
        });

        if (error) throw error;
        return;

      } catch (error) {
        attempt++;
        logger.warn(`Notification attempt ${attempt} failed`, { error });

        if (attempt < this.MAX_RETRIES) {
          await new Promise(resolve => 
            setTimeout(resolve, this.RETRY_DELAY * attempt)
          );
        } else {
          throw error;
        }
      }
    }
  }
}
