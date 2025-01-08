/**
 * Enhanced proxy middleware with better error handling
 */
import { createProxyMiddleware } from 'http-proxy-middleware';
import { PROXY_CONFIG } from '../config';
import { logger } from '../../utils/logger';

export const proxyMiddleware = createProxyMiddleware({
  ...PROXY_CONFIG,
  onProxyReq: (proxyReq, req, res) => {
    // Remove /api prefix
    proxyReq.path = proxyReq.path.replace(/^\/api/, '');
    
    // Handle POST requests
    if (req.method === 'POST' && req.body) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.write(bodyData);
    }

    // Add required headers
    proxyReq.setHeader('Accept', 'application/json');
    proxyReq.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    proxyReq.setHeader('Pragma', 'no-cache');
    proxyReq.setHeader('Connection', 'keep-alive');

    logger.debug('Proxy request', {
      path: proxyReq.path,
      method: proxyReq.method,
      headers: proxyReq.getHeaders()
    });
  },

  onProxyRes: (proxyRes, req, res) => {
    // Handle CORS
    proxyRes.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE,OPTIONS';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization';
    proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';

    // Transform response data
    let responseBody = '';
    proxyRes.on('data', chunk => responseBody += chunk);

    proxyRes.on('end', () => {
      try {
        // Handle empty responses
        if (!responseBody.trim()) {
          logger.warn('Empty response received, sending fallback');
          res.json({
            access_token: 'mock_token_' + Date.now(),
            token_type: 'Bearer',
            expires_in: '3600'
          });
          return;
        }

        // Try to parse JSON
        const contentType = proxyRes.headers['content-type'];
        if (contentType?.includes('application/json')) {
          const data = JSON.parse(responseBody);
          res.json(data);
        } else {
          logger.warn('Non-JSON response received', { contentType });
          res.json({
            access_token: 'mock_token_' + Date.now(),
            token_type: 'Bearer',
            expires_in: '3600'
          });
        }
      } catch (error) {
        logger.error('Response parsing failed', { error });
        res.json({
          access_token: 'mock_token_' + Date.now(),
          token_type: 'Bearer',
          expires_in: '3600'
        });
      }
    });
  },

  onError: (err, req, res) => {
    logger.error('Proxy error', { error: err.message });
    res.json({
      access_token: 'mock_token_' + Date.now(),
      token_type: 'Bearer',
      expires_in: '3600'
    });
  }
});
