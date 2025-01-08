/**
 * Monitoramento do estado da conexão com ONS
 */
import { logger } from '../../utils/logger';
import { ONSStateManager } from './state';
import { checkONSAvailability } from '../../utils/onsCheck';

export class ONSMonitoring {
  private static instance: ONSMonitoring;
  private stateManager: ONSStateManager;
  private checkInterval: number | null = null;

  private constructor() {
    this.stateManager = ONSStateManager.getInstance();
  }

  public static getInstance(): ONSMonitoring {
    if (!ONSMonitoring.instance) {
      ONSMonitoring.instance = new ONSMonitoring();
    }
    return ONSMonitoring.instance;
  }

  public startMonitoring(): void {
    if (this.checkInterval) return;

    this.checkInterval = window.setInterval(async () => {
      try {
        const status = await checkONSAvailability();
        
        if (!status.isAvailable && this.stateManager.getState().isConnected) {
          logger.warn('ONS connection lost', {
            responseTime: status.responseTime,
            error: status.error
          });
          this.stateManager.setConnected(false);
        }
      } catch (error) {
        logger.error('Error checking ONS availability', error);
      }
    }, 60000); // Check every minute
  }

  public stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}
