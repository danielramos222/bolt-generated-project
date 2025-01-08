/**
 * Utility for calculating retry delays with exponential backoff
 */
export function calculateRetryDelay(
  attempt: number, 
  config: { 
    maxRetries: number;
    initialDelay: number;
    maxDelay: number;
  }
): number {
  const { initialDelay, maxDelay } = config;
  const exponentialDelay = initialDelay * Math.pow(2, attempt);
  const jitter = Math.random() * 1000; // Add randomness to prevent thundering herd
  return Math.min(exponentialDelay + jitter, maxDelay);
}
