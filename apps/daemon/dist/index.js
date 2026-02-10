import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const VERSION = '0.0.0-dev';
export const ENVIRONMENT = 'development';

export function getAppInfo() {
  return {
    version: VERSION,
    environment: ENVIRONMENT,
  };
}

export function createHealthResponse() {
  return {
    status: 'healthy',
    service: 'daemon',
    version: VERSION,
    environment: ENVIRONMENT,
    timestamp: new Date().toISOString(),
  };
}

// Main entry point
async function main() {
  console.log(`Daemon Service - Version: ${VERSION}, Environment: ${ENVIRONMENT}`);

  // Graceful shutdown
  const shutdown = () => {
    console.log('\nShutting down gracefully...');
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

// Run if this is the main module
const __filename = fileURLToPath(import.meta.url);
const mainModule = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);
if (mainModule) {
  main().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}
