import { logger } from '../../utils/logger';
import { AUTH_CONFIG } from '../../server/config';

export class AuthService {
  private static instance: AuthService;
  private token: string | null = null;
  private tokenExpiration: Date | null = null;
  private isAuthenticating = false;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async authenticate(): Promise<boolean> {
    if (this.isAuthenticating) {
      logger.info('Authentication already in progress');
      return false;
    }

    if (this.hasValidToken()) {
      return true;
    }

    this.isAuthenticating = true;

    try {
      const response = await fetch('/api/autenticar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify({
          usuario: import.meta.env.VITE_ONS_USUARIO,
          senha: import.meta.env.VITE_ONS_SENHA
        }),
        credentials: 'include'
      });

      const data = await response.json();

      if (data.access_token) {
        this.token = data.access_token;
        this.tokenExpiration = new Date(Date.now() + parseInt(data.expires_in) * 1000);
        logger.info('Authentication successful');
        return true;
      }

      throw new Error('Invalid authentication response');

    } catch (error) {
      logger.error('Authentication failed', error);
      return false;
    } finally {
      this.isAuthenticating = false;
    }
  }

  private hasValidToken(): boolean {
    return !!(
      this.token && 
      this.tokenExpiration && 
      this.tokenExpiration.getTime() > Date.now() + (5 * 60 * 1000)
    );
  }

  public getToken(): string | null {
    return this.hasValidToken() ? this.token : null;
  }
}
