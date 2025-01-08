/**
 * Enhanced authentication request handler with better error handling
 */
import { logger } from '../../utils/logger';
import { AUTH_CONFIG } from './authConfig';
import { ResponseParser } from '../../utils/http/responseParser';

export class AuthRequestHandler {
  private static instance: AuthRequestHandler;

  private constructor() {}

  public static getInstance(): AuthRequestHandler {
    if (!AuthRequestHandler.instance) {
      AuthRequestHandler.instance = new AuthRequestHandler();
    }
    return AuthRequestHandler.instance;
  }

  public async makeAuthRequest(credentials: { usuario: string; senha: string }): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AUTH_CONFIG.timeout);

    try {
      // First try OPTIONS to check server availability
      const preflightResponse = await fetch(AUTH_CONFIG.endpoint, {
        method: 'OPTIONS',
        headers: AUTH_CONFIG.headers
      });

      if (!preflightResponse.ok) {
        throw new Error(`Server unavailable: ${preflightResponse.status}`);
      }

      logger.debug('Auth preflight successful', {
        status: preflightResponse.status,
        headers: Object.fromEntries(preflightResponse.headers)
      });

      // Make actual auth request
      const response = await fetch(AUTH_CONFIG.endpoint, {
        method: 'POST',
        headers: {
          ...AUTH_CONFIG.headers,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          usuario: credentials.usuario.trim(),
          senha: credentials.senha.trim()
        }),
        credentials: 'include',
        signal: controller.signal
      });

      // Check response headers
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        throw new Error(`Unexpected content type: ${contentType}`);
      }

      // Read response as text first
      const text = await response.text();
      if (!text.trim()) {
        throw new Error('Empty response received from server');
      }

      // Try to parse as JSON
      try {
        const data = JSON.parse(text);
        if (!response.ok) {
          throw new Error(data.error_description || `HTTP Error: ${response.status}`);
        }
        return new Response(text, response);
      } catch (parseError) {
        logger.error('Failed to parse auth response', {
          status: response.status,
          contentType,
          text: text.substring(0, 100) // Log first 100 chars
        });
        throw new Error('Invalid response format');
      }

    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error('Authentication request timed out');
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
