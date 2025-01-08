/**
 * Sistema de logs para o navegador usando localStorage
 */
export class BrowserLogger {
  private static instance: BrowserLogger;
  private readonly MAX_LOGS = 1000;
  private readonly STORAGE_KEYS = {
    app: 'app_logs',
    error: 'error_logs'
  };

  private constructor() {}

  public static getInstance(): BrowserLogger {
    if (!BrowserLogger.instance) {
      BrowserLogger.instance = new BrowserLogger();
    }
    return BrowserLogger.instance;
  }

  private getStoredLogs(key: string): string[] {
    try {
      const logs = localStorage.getItem(key);
      return logs ? JSON.parse(logs) : [];
    } catch {
      return [];
    }
  }

  private storeLogs(key: string, logs: string[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(logs.slice(-this.MAX_LOGS)));
    } catch (error) {
      console.error('Error storing logs:', error);
    }
  }

  private addLog(key: string, message: string): void {
    const logs = this.getStoredLogs(key);
    const timestamp = new Date().toISOString();
    logs.push(`[${timestamp}] ${message}`);
    this.storeLogs(key, logs);
  }

  public log(message: string): void {
    this.addLog(this.STORAGE_KEYS.app, message);
  }

  public error(message: string): void {
    this.addLog(this.STORAGE_KEYS.error, message);
  }

  public getLogs(type: 'app' | 'error' = 'app'): string[] {
    return this.getStoredLogs(this.STORAGE_KEYS[type]);
  }

  public clearLogs(type?: 'app' | 'error'): void {
    if (!type) {
      localStorage.removeItem(this.STORAGE_KEYS.app);
      localStorage.removeItem(this.STORAGE_KEYS.error);
    } else {
      localStorage.removeItem(this.STORAGE_KEYS[type]);
    }
  }
}
