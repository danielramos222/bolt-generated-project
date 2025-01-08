import { AuthDebugger } from './utils/auth/authDebugger';
import { logger } from './utils/logger';

async function runAuthTests() {
  try {
    logger.info('Starting authentication tests...');

    // Test basic connectivity first
    await AuthDebugger.testConnection();

    // Test authentication
    await AuthDebugger.testAuth({
      usuario: import.meta.env.VITE_ONS_USUARIO,
      senha: import.meta.env.VITE_ONS_SENHA
    });

    logger.info('Authentication tests completed successfully');
  } catch (error) {
    logger.error('Authentication tests failed:', error);
    process.exit(1);
  }
}

runAuthTests();
