/**
 * Enhanced notification manager with better error handling
 */
import { supabase } from '../../lib/supabase';
import { logger } from '../../utils/logger';
import { RateLimiter } from '../../utils/http/rateLimiter';

export class NotificationManager {
  private static instance: NotificationManager;
  private rateLimiter: RateLimiter;
  private readonly RETRY_DELAY = 2000;
  private readonly MAX_RETRIES = 3;

  private constructor() {
    this.rateLimiter = new RateLimiter(2000); // 2 seconds between notifications
  }

  public static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  public async sendNotification(params: {
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
          headers: {
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/json'
          }
        });

        if (error) throw error;
        logger.info('Notification sent successfully');
        return;

      } catch (error) {
        attempt++;
        logger.warn(`Notification attempt ${attempt} failed`, { error });

        if (attempt < this.MAX_RETRIES) {
          await new Promise(resolve => 
            setTimeout(resolve, this.RETRY_DELAY * Math.pow(2, attempt - 1))
          );
        } else {
          logger.error('All notification attempts failed', { error });
          // Store failed notification for later retry
          this.storeFailedNotification(params);
          throw error;
        }
      }
    }
  }

  private storeFailedNotification(params: any): void {
    try {
      const failed = this.getFailedNotifications();
      failed.push({
        params,
        timestamp: Date.now()
      });
      localStorage.setItem('failed_notifications', JSON.stringify(failed));
    } catch (error) {
      logger.error('Failed to store notification', { error });
    }
  }

  private getFailedNotifications(): any[] {
    try {
      const stored = localStorage.getItem('failed_notifications');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
}
