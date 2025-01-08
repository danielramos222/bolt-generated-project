import express from 'express';
import { corsMiddleware } from './middleware/cors';
import { errorHandler } from './middleware/error';
import { proxyMiddleware } from './middleware/proxy';
import { PORT } from './config';

const app = express();

// Apply CORS before other middleware
app.use(corsMiddleware);
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Apply proxy middleware
app.use('/api', proxyMiddleware);

// Error handling should be last
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});

// Global error handlers
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});
