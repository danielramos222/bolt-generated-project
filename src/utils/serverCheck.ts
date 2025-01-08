/**
 * Utilitário para verificar a disponibilidade de servidores
 */
export async function checkServerHealth(url: string): Promise<{
  isAvailable: boolean;
  responseTime: number;
  error?: string;
}> {
  const startTime = Date.now();
  
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      timeout: 5000
    });
    
    return {
      isAvailable: response.ok,
      responseTime: Date.now() - startTime
    };
  } catch (error) {
    return {
      isAvailable: false,
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
