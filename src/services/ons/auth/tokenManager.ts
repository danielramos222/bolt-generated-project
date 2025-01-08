/**
 * Token management and validation
 */
import { logger } from '../../../utils/logger';
import { AUTH_CONFIG } from './authConfig';

interface TokenInfo {
  token: string;
  expiresAt: Date;
}

export class TokenManager {
  private currentToken: TokenInfo | null = null;

  public setToken(token: string, expiresIn: number): void {
    this.currentToken = {
      token,
      expiresAt: new Date(Date.now() + expiresIn * 1000)
    };
    logger.debug('Token updated', { 
      expiresIn: Math.floor((this.currentToken.expiresAt.getTime() - Date.now()) / 1000) 
    });
  }

  public getToken(): string | null {
    return this.currentToken?.token ?? null;
  }

  public isValid(): boolean {
    if (!this.currentToken) return false;
    
    const now = Date.now();
    const expiresAt = this.currentToken.expiresAt.getTime();
    return expiresAt > now + AUTH_CONFIG.token.expirationBuffer;
  }

  public needsRefresh(): boolean {
    if (!this.currentToken) return true;
    
    const now = Date.now();
    const expiresAt = this.currentToken.expiresAt.getTime();
    return expiresAt <= now + AUTH_CONFIG.token.refreshThreshold;
  }

  public clear(): void {
    this.currentToken = null;
    logger.debug('Token cleared');
  }
}
