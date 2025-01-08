import { MONITORING_CONFIG } from './MonitoringConfig';

export class TimeWindowChecker {
  public isWithinTimeWindow(): boolean {
    const now = new Date();
    const currentHour = now.getHours();
    
    return currentHour >= MONITORING_CONFIG.timeWindow.startHour && 
           currentHour < MONITORING_CONFIG.timeWindow.endHour;
  }

  public getNextCheckTime(): Date {
    const now = new Date();
    const nextCheck = new Date(now);

    if (!this.isWithinTimeWindow()) {
      nextCheck.setHours(MONITORING_CONFIG.timeWindow.startHour, 0, 0, 0);
      if (nextCheck < now) {
        nextCheck.setDate(nextCheck.getDate() + 1);
      }
    } else {
      nextCheck.setTime(now.getTime() + MONITORING_CONFIG.interval);
    }

    return nextCheck;
  }
}
