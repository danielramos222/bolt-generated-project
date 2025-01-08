/**
 * Sistema de logs em arquivo
 */
import fs from 'fs';
import path from 'path';

const LOG_DIR = 'logs';
const APP_LOG = 'app.log';
const ERROR_LOG = 'error.log';
const PROXY_LOG = 'proxy.log';

export class FileLogger {
  private static instance: FileLogger;
  private logDir: string;

  private constructor() {
    this.logDir = path.join(process.cwd(), LOG_DIR);
    this.ensureLogDirectory();
  }

  public static getInstance(): FileLogger {
    if (!FileLogger.instance) {
      FileLogger.instance = new FileLogger();
    }
    return FileLogger.instance;
  }

  private ensureLogDirectory(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private writeLog(filename: string, message: string): void {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;
    fs.appendFileSync(path.join(this.logDir, filename), logEntry);
  }

  public log(message: string): void {
    this.writeLog(APP_LOG, message);
  }

  public error(message: string): void {
    this.writeLog(ERROR_LOG, message);
  }

  public proxy(message: string): void {
    this.writeLog(PROXY_LOG, message);
  }
}
