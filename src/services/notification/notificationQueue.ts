/**
 * Queue manager for notifications with rate limiting
 */
import { logger } from '../../utils/logger';

interface QueuedNotification {
  id: string;
  params: {
    to: string;
    subject: string;
    content: string;
  };
  attempts: number;
}

export class NotificationQueue {
  private static instance: NotificationQueue;
  private queue: QueuedNotification[] = [];
  private processing = false;
  private readonly MAX_RETRIES = 2;
  private readonly RATE_LIMIT = 2000; // 2 seconds between notifications

  private constructor() {}

  public static getInstance(): NotificationQueue {
    if (!NotificationQueue.instance) {
      NotificationQueue.instance = new NotificationQueue();
    }
    return NotificationQueue.instance;
  }

  public async enqueue(id: string, params: QueuedNotification['params']): Promise<void> {
    const existing = this.queue.find(item => item.id === id);
    if (existing) {
      logger.debug('Notification already queued', { id });
      return;
    }

    this.queue.push({ id, params, attempts: 0 });
    
    if (!this.processing) {
      await this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;
    const client = new NotificationClient();

    while (this.queue.length > 0) {
      const notification = this.queue[0];
      
      try {
        await client.sendEmail(notification.params);
        this.queue.shift();
        logger.debug('Notification sent successfully', { id: notification.id });
        
        if (this.queue.length > 0) {
          await new Promise(resolve => setTimeout(resolve, this.RATE_LIMIT));
        }
      } catch (error) {
        notification.attempts++;
        
        if (notification.attempts <= this.MAX_RETRIES) {
          logger.warn('Notification failed, will retry', {
            id: notification.id,
            attempt: notification.attempts,
            error
          });
          this.queue.push(this.queue.shift()!);
          await new Promise(resolve => setTimeout(resolve, this.RATE_LIMIT * 2));
        } else {
          logger.error('Notification failed permanently', {
            id: notification.id,
            error
          });
          this.queue.shift();
        }
      }
    }

    this.processing = false;
  }
}
