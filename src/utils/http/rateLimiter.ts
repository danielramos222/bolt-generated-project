/**
 * Rate limiting utility to prevent request flooding
 */
export class RateLimiter {
  private lastRequest: number = 0;
  
  constructor(private minInterval: number) {}

  public async waitIfNeeded(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequest;
    
    if (timeSinceLastRequest < this.minInterval) {
      await new Promise(resolve => 
        setTimeout(resolve, this.minInterval - timeSinceLastRequest)
      );
    }
    
    this.lastRequest = Date.now();
  }
}
