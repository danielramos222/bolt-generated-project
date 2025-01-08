/**
 * Utility for testing proxy connectivity
 */
import { logger } from '../logger';

export class ProxyTester {
  private static readonly TEST_ENDPOINTS = [
    { url: '/api/health', method: 'HEAD' },
    { url: '/api/autenticar', method: 'OPTIONS' }
  ];

  public static async testConnectivity(): Promise<{
    success: boolean;
    blockedEndpoints: string[];
    details: string;
  }> {
    const results = await Promise.all(
      this.TEST_ENDPOINTS.map(async endpoint => {
        try {
          const response = await fetch(endpoint.url, {
            method: endpoint.method,
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          });

          return {
            url: endpoint.url,
            success: response.ok,
            status: response.status,
            statusText: response.statusText
          };
        } catch (error) {
          return {
            url: endpoint.url,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      })
    );

    const blockedEndpoints = results
      .filter(result => !result.success)
      .map(result => result.url);

    const success = blockedEndpoints.length === 0;

    logger.info('Proxy connectivity test results', {
      success,
      endpoints: results
    });

    return {
      success,
      blockedEndpoints,
      details: this.formatDetails(results)
    };
  }

  private static formatDetails(results: any[]): string {
    return results
      .map(result => {
        if (result.success) {
          return `✅ ${result.url}: OK (${result.status})`;
        }
        return `❌ ${result.url}: ${result.error || result.statusText}`;
      })
      .join('\n');
  }
}
