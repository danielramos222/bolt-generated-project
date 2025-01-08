import { useState, useEffect } from 'react';
import { MonitoringService } from '../services/monitoring/MonitoringService';
import { logger } from '../utils/logger';

export function useMonitoring() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  useEffect(() => {
    const monitoringService = MonitoringService.getInstance();
    monitoringService.startMonitoring();

    return () => {
      monitoringService.stopMonitoring();
    };
  }, []);

  const sync = async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    try {
      await MonitoringService.getInstance().checkInterventions();
      setLastSyncTime(new Date());
    } catch (error) {
      logger.error('Manual sync failed', error);
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    sync,
    isSyncing,
    lastSyncTime
  };
}
