export const NOTIFICATION_CONFIG = {
  maxRetries: 3,
  retryDelay: 2000,
  maxDelay: 10000,
  fallback: {
    enabled: true,
    storageKey: 'failed_notifications',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  },
  rateLimit: {
    interval: 2000, // 2 seconds between notifications
    maxBurst: 5 // Maximum notifications to send in burst
  }
} as const;
