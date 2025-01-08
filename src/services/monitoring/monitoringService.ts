import { MonitoringState } from './monitoringState';
import { logger } from '../../utils/logger';

export class MonitoringService {
  private static instance: MonitoringService;
  private state: MonitoringState;
  private readonly INTERVAL = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    this.state = MonitoringState.getInstance();
  }

  public static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  public startMonitoring(): void {
    if (this.state.isActive()) {
      logger.info('Monitoring already active');
      return;
    }

    if (this.state.start(this.INTERVAL)) {
      logger.info('Monitoring started', {
        interval: this.INTERVAL / 1000,
        window: {
          startHour: 8,
          endHour: 18
        }
      });
    }
  }

  public stopMonitoring(): void {
    this.state.stop();
    logger.info('Monitoring stopped');
  }

  public isMonitoring(): boolean {
    return this.state.isActive();
  }

  public getLastCheckTime(): Date | null {
    return this.state.getLastCheck();
  }
}
