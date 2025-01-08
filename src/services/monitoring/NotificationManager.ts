/**
 * Centralized notification manager with improved error handling and rate limiting
 */
import { NotificationQueue } from './NotificationQueue';
import { logger } from '../../utils/logger';
import type { Intervention } from '../../types/intervention';

interface NotificationState {
  sentNotifications: Set<string>;
  lastNotificationTime: number | null;
  failedAttempts: Map<string, number>;
}

export class NotificationManager {
  private static instance: NotificationManager;
  private queue: NotificationQueue;
  private state: NotificationState = {
    sentNotifications: new Set(),
    lastNotificationTime: null,
    failedAttempts: new Map()
  };
  private readonly RATE_LIMIT = 2000; // 2 seconds between notifications
  private readonly MAX_RETRIES = 3;
  private readonly NOTIFICATION_TTL = 30 * 60 * 1000; // 30 minutes

  private constructor() {
    this.queue = NotificationQueue.getInstance();
    setInterval(() => this.cleanup(), this.NOTIFICATION_TTL);
  }

  public static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  private cleanup(): void {
    const expiryTime = Date.now() - this.NOTIFICATION_TTL;
    this.state.sentNotifications.clear();
    this.state.failedAttempts.clear();
    this.state.lastNotificationTime = null;
    logger.debug('Notification state cleaned up');
  }

  private async enforceRateLimit(): Promise<void> {
    if (!this.state.lastNotificationTime) return;

    const timeSinceLastNotification = Date.now() - this.state.lastNotificationTime;
    if (timeSinceLastNotification < this.RATE_LIMIT) {
      await new Promise(resolve => 
        setTimeout(resolve, this.RATE_LIMIT - timeSinceLastNotification)
      );
    }
  }

  public async queueNotification(
    numeroONS: string,
    type: 'novo' | 'alterado' | 'removido',
    changes: string[],
    intervention?: Intervention
  ): Promise<void> {
    const notificationId = `${numeroONS}-${type}-${Date.now()}`;
    
    if (this.state.sentNotifications.has(notificationId)) {
      logger.debug('Duplicate notification prevented', { numeroONS, type });
      return;
    }

    const failCount = this.state.failedAttempts.get(numeroONS) || 0;
    if (failCount >= this.MAX_RETRIES) {
      logger.warn('Notification skipped due to max failures', { numeroONS, failCount });
      return;
    }

    await this.enforceRateLimit();
    
    try {
      await this.queue.enqueue(notificationId, async () => {
        await this.processNotification(notificationId, numeroONS, type, changes, intervention);
      });
      
      this.state.lastNotificationTime = Date.now();
    } catch (error) {
      this.handleNotificationError(numeroONS, error);
    }
  }

  private async processNotification(
    id: string,
    numeroONS: string,
    type: string,
    changes: string[],
    intervention?: Intervention
  ): Promise<void> {
    try {
      // Process notification logic here
      // This would integrate with your notification service
      
      this.state.sentNotifications.add(id);
      this.state.failedAttempts.delete(numeroONS);
      logger.info('Notification processed successfully', { numeroONS, type });
    } catch (error) {
      this.handleNotificationError(numeroONS, error);
      throw error;
    }
  }

  private handleNotificationError(numeroONS: string, error: unknown): void {
    const failCount = (this.state.failedAttempts.get(numeroONS) || 0) + 1;
    this.state.failedAttempts.set(numeroONS, failCount);
    
    logger.error('Notification failed', {
      numeroONS,
      failCount,
      error
    });
  }

  public getState() {
    return {
      queueSize: this.queue.getQueueState().length,
      sentCount: this.state.sentNotifications.size,
      failedCount: this.state.failedAttempts.size
    };
  }
}
