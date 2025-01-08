/**
 * Fallback mechanism for failed notifications
 */
import { logger } from '../../utils/logger';
import type { Intervention } from '../../types/intervention';

interface FailedNotification {
  id: string;
  numeroONS: string;
  type: 'novo' | 'alterado' | 'removido';
  changes: string[];
  intervention?: Intervention;
  timestamp: number;
}

export class NotificationFallback {
  private static instance: NotificationFallback;
  private readonly STORAGE_KEY = 'failed_notifications';
  private readonly MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours

  private constructor() {
    // Clean up old notifications periodically
    setInterval(() => this.cleanup(), 60 * 60 * 1000); // Every hour
  }

  public static getInstance(): NotificationFallback {
    if (!NotificationFallback.instance) {
      NotificationFallback.instance = new NotificationFallback();
    }
    return NotificationFallback.instance;
  }

  public store(notification: Omit<FailedNotification, 'timestamp'>): void {
    try {
      const failed = this.getFailedNotifications();
      failed.push({ ...notification, timestamp: Date.now() });
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(failed));
      logger.info('Stored failed notification for retry', { id: notification.id });
    } catch (error) {
      logger.error('Failed to store notification', { error });
    }
  }

  public getFailedNotifications(): FailedNotification[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  public remove(id: string): void {
    try {
      const failed = this.getFailedNotifications();
      const filtered = failed.filter(n => n.id !== id);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      logger.error('Failed to remove notification', { error });
    }
  }

  private cleanup(): void {
    try {
      const failed = this.getFailedNotifications();
      const now = Date.now();
      const valid = failed.filter(n => now - n.timestamp < this.MAX_AGE);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(valid));
    } catch (error) {
      logger.error('Failed to cleanup notifications', { error });
    }
  }
}
