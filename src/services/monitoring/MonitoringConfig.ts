/**
 * Configuration for monitoring service
 */
export const MONITORING_CONFIG = {
  timeWindow: {
    startHour: 8,
    endHour: 18
  },
  agents: ['CMG', 'CD1', '792', 'CG1', 'GIT', 'DMO', 'SGG', 'TMG', 'ESI', 'SIE'],
  interval: 5 * 60 * 1000, // 5 minutes
  dateRange: {
    futuredays: 45 // Changed from 89 to 45 as requested
  }
} as const;
