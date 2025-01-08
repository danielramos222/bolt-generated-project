type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
}

class Logger {
  private static instance: Logger;
  private isDebugEnabled: boolean;
  private logHistory: LogEntry[] = [];
  private readonly maxHistorySize = 100;

  private constructor() {
    this.isDebugEnabled = import.meta.env.DEV || false;
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private addToHistory(entry: LogEntry): void {
    this.logHistory.unshift(entry);
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory.pop();
    }
  }

  private formatMessage(level: LogLevel, message: string, data?: any): LogEntry {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data: data ? this.sanitizeData(data) : undefined
    };

    this.addToHistory(entry);
    return entry;
  }

  private sanitizeData(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const sanitized = { ...data };
    const sensitiveKeys = ['senha', 'password', 'token', 'key'];
    
    Object.keys(sanitized).forEach(key => {
      if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
        sanitized[key] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  public debug(message: string, data?: any): void {
    if (this.isDebugEnabled) {
      const entry = this.formatMessage('debug', message, data);
      console.debug(`[${entry.timestamp}] DEBUG: ${entry.message}`, entry.data || '');
    }
  }

  public info(message: string, data?: any): void {
    const entry = this.formatMessage('info', message, data);
    console.info(`[${entry.timestamp}] INFO: ${entry.message}`, entry.data || '');
  }

  public warn(message: string, data?: any): void {
    const entry = this.formatMessage('warn', message, data);
    console.warn(`[${entry.timestamp}] WARN: ${entry.message}`, entry.data || '');
  }

  public error(message: string, error?: any): void {
    const entry = this.formatMessage('error', message, error);
    console.error(`[${entry.timestamp}] ERROR: ${entry.message}`, entry.data || '');
    if (error instanceof Error) {
      console.error(error.stack);
    }
  }

  public getRecentLogs(): LogEntry[] {
    return this.logHistory;
  }

  public clearLogs(): void {
    this.logHistory = [];
  }
}

export const logger = Logger.getInstance();
