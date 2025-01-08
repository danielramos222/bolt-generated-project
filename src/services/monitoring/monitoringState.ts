/**
 * Manages monitoring state to prevent parallel execution
 */
export class MonitoringState {
  private static instance: MonitoringState;
  private isRunning = false;
  private lastCheck: Date | null = null;
  private intervalId: number | null = null;

  private constructor() {}

  public static getInstance(): MonitoringState {
    if (!MonitoringState.instance) {
      MonitoringState.instance = new MonitoringState();
    }
    return MonitoringState.instance;
  }

  public start(intervalMs: number): boolean {
    if (this.isRunning) {
      return false;
    }

    this.isRunning = true;
    this.intervalId = window.setInterval(() => {
      this.lastCheck = new Date();
    }, intervalMs);

    return true;
  }

  public stop(): void {
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  public isActive(): boolean {
    return this.isRunning;
  }

  public getLastCheck(): Date | null {
    return this.lastCheck;
  }
}
