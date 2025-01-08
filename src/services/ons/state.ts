/**
 * Gerenciamento de estado da conexão com ONS
 */
import { logger } from '../../utils/logger';

interface ONSState {
  isConnected: boolean;
  lastAuthAttempt: Date | null;
  authFailures: number;
  lastError: Error | null;
}

export class ONSStateManager {
  private static instance: ONSStateManager;
  private state: ONSState = {
    isConnected: false,
    lastAuthAttempt: null,
    authFailures: 0,
    lastError: null
  };

  private constructor() {}

  public static getInstance(): ONSStateManager {
    if (!ONSStateManager.instance) {
      ONSStateManager.instance = new ONSStateManager();
    }
    return ONSStateManager.instance;
  }

  public setConnected(connected: boolean): void {
    this.state.isConnected = connected;
    if (connected) {
      this.state.authFailures = 0;
      this.state.lastError = null;
    }
  }

  public recordAuthFailure(error: Error): void {
    this.state.isConnected = false;
    this.state.lastAuthAttempt = new Date();
    this.state.authFailures++;
    this.state.lastError = error;

    logger.warn('ONS auth failure', {
      attempts: this.state.authFailures,
      error: error.message
    });
  }

  public shouldUseFallback(): boolean {
    return this.state.authFailures >= 3;
  }

  public getState(): ONSState {
    return { ...this.state };
  }

  public reset(): void {
    this.state = {
      isConnected: false,
      lastAuthAttempt: null,
      authFailures: 0,
      lastError: null
    };
  }
}
