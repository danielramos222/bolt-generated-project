/**
 * Dedicated notification queue manager
 */
import { logger } from '../../utils/logger';

interface QueuedNotification {
  id: string;
  task: () => Promise<void>;
  retries: number;
  lastAttempt?: number;
}

export class NotificationQueue {
  private static instance: NotificationQueue;
  private queue: QueuedNotification[] = [];
  private isProcessing = false;
  private readonly MAX_RETRIES = 2;
  private readonly RETRY_DELAY = 2000;
  private readonly RATE_LIMIT = 1000;

  private constructor() {}

  public static getInstance(): NotificationQueue {
    if (!NotificationQueue.instance) {
      NotificationQueue.instance = new NotificationQueue();
    }
    return NotificationQueue.instance;
  }

  public async enqueue(id: string, task: () => Promise<void>): Promise<void> {
    const existing = this.queue.find(item => item.id === id);
    if (existing) {
      logger.debug('Notification already queued', { id });
      return;
    }

    this.queue.push({ id, task, retries: 0 });
    logger.debug('Notification queued', { id, queueLength: this.queue.length });
    
    if (!this.isProcessing) {
      await this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;
    logger.debug('Starting queue processing', { queueLength: this.queue.length });

    while (this.queue.length > 0) {
      const notification = this.queue[0];
      
      try {
        await notification.task();
        this.queue.shift();
        logger.debug('Notification processed successfully', { id: notification.id });
        
        if (this.queue.length > 0) {
          await new Promise(resolve => setTimeout(resolve, this.RATE_LIMIT));
        }
      } catch (error) {
        await this.handleError(notification, error);
      }
    }

    this.isProcessing = false;
    logger.debug('Queue processing completed');
  }

  private async handleError(notification: QueuedNotification, error: unknown): Promise<void> {
    notification.lastAttempt = Date.now();
    
    if (notification.retries < this.MAX_RETRIES) {
      notification.retries++;
      const delay = this.RETRY_DELAY * Math.pow(2, notification.retries - 1);
      
      logger.warn('Notification failed, will retry', {
        id: notification.id,
        attempt: notification.retries,
        delay,
        error
      });

      await new Promise(resolve => setTimeout(resolve, delay));
      this.queue.push(this.queue.shift()!);
    } else {
      logger.error('Notification failed permanently', {
        id: notification.id,
        error
      });
      this.queue.shift();
    }
  }

  public clear(): void {
    this.queue = [];
    logger.debug('Notification queue cleared');
  }

  public getQueueState() {
    return {
      length: this.queue.length,
      isProcessing: this.isProcessing,
      items: this.queue.map(({ id, retries, lastAttempt }) => ({
        id,
        retries,
        lastAttempt
      }))
    };
  }
}
