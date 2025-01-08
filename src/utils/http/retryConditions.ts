/**
 * Conditions for determining if a request should be retried
 */
export function shouldRetryRequest(error: unknown): boolean {
  if (error instanceof Error) {
    // Network errors should be retried
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return true;
    }
    
    // Timeout errors should be retried
    if (error.name === 'TimeoutError') {
      return true;
    }
  }

  // Response errors
  if (error instanceof Response) {
    // Retry server errors
    if (error.status >= 500) {
      return true;
    }
    
    // Retry rate limiting
    if (error.status === 429) {
      return true;
    }
  }

  return false;
}
