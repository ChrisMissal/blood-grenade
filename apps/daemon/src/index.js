import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Command } from 'commander';

export const VERSION = '__VERSION__';
export const ENVIRONMENT = '__ENVIRONMENT__';

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

async function main() {
  const program = new Command();
  program
    .name('daemon')
    .description('Background Daemon Service')
    .version(VERSION)
    .action(() => {
      console.log(`Daemon Service - Version: ${VERSION}, Environment: ${ENVIRONMENT}`);
      // Graceful shutdown
      const shutdown = () => {
        console.log('\nShutting down gracefully...');
      };
      process.on('SIGTERM', shutdown);
      process.on('SIGINT', shutdown);
    });
  await program.parseAsync(process.argv);
}

const __filename = fileURLToPath(import.meta.url);
const mainModule = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);
if (mainModule) {
  main().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}
