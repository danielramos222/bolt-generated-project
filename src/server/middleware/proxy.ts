import { createProxyMiddleware } from 'http-proxy-middleware';
import { PROXY_CONFIG } from '../config';

export const proxyMiddleware = createProxyMiddleware({
  ...PROXY_CONFIG,
  onProxyReq: (proxyReq, req, res) => {
    // Strip /api prefix
    proxyReq.path = proxyReq.path.replace(/^\/api/, '');
    
    if (req.method === 'POST' && req.body) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    // Add CORS headers
    proxyRes.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE,OPTIONS';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization';
    proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
  },
  onError: (err, req, res) => {
    console.error('Proxy Error:', err);
    res.writeHead(500, {
      'Content-Type': 'application/json',
    });
    res.end(JSON.stringify({ error: 'Proxy Error', message: err.message }));
  },
});
