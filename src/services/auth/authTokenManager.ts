/**
 * Token management with validation and refresh handling
 */
import { logger } from '../../utils/logger';

interface TokenData {
  token: string;
  expiresAt: Date;
}

export class AuthTokenManager {
  private static instance: AuthTokenManager;
  private currentToken: TokenData | null = null;
  private readonly TOKEN_BUFFER = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  public static getInstance(): AuthTokenManager {
    if (!AuthTokenManager.instance) {
      AuthTokenManager.instance = new AuthTokenManager();
    }
    return AuthTokenManager.instance;
  }

  public setToken(token: string, expiresIn: number | string): void {
    const expiresInMs = typeof expiresIn === 'string' ? 
      parseInt(expiresIn) * 1000 : 
      expiresIn * 1000;

    this.currentToken = {
      token,
      expiresAt: new Date(Date.now() + expiresInMs)
    };

    logger.info('Token updated', {
      expiresIn: Math.floor(expiresInMs / 1000),
      expiresAt: this.currentToken.expiresAt.toISOString()
    });
  }

  public getToken(): string | null {
    if (!this.isTokenValid()) {
      return null;
    }
    return this.currentToken?.token ?? null;
  }

  public isTokenValid(): boolean {
    if (!this.currentToken) return false;
    return this.currentToken.expiresAt.getTime() > Date.now() + this.TOKEN_BUFFER;
  }

  public clear(): void {
    this.currentToken = null;
    logger.debug('Token cleared');
  }
}
