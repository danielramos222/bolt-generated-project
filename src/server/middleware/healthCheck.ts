import { Request, Response } from 'express';
import { checkONSAvailability } from '../../utils/onsCheck';
import { logger } from '../../utils/logger';

export async function healthCheckHandler(req: Request, res: Response) {
  try {
    const onsStatus = await checkONSAvailability();
    
    res.json({
      timestamp: new Date().toISOString(),
      status: 'ok',
      proxy: true,
      ons: {
        available: onsStatus.isAvailable,
        responseTime: onsStatus.responseTime,
        error: onsStatus.error
      }
    });
  } catch (error) {
    logger.error('Health check failed', error);
    res.status(500).json({
      timestamp: new Date().toISOString(),
      status: 'error',
      proxy: true,
      ons: {
        available: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
}
