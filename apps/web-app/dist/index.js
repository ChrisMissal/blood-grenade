import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const VERSION = '0.0.0-dev';
export const ENVIRONMENT = 'development';
export const BUILD_TIME = '2026-02-09T22:42:45.838Z';

export function getAppInfo() {
  return {
    version: VERSION,
    environment: ENVIRONMENT,
    buildTime: BUILD_TIME,
  };
}

export function createHealthResponse() {
  return {
    status: 'healthy',
    version: VERSION,
    environment: ENVIRONMENT,
    buildTime: BUILD_TIME,
    timestamp: new Date().toISOString(),
  };
}

// Simple HTTP server for demonstration (no Express dependency for template simplicity)
export async function createServer() {
  const http = await import('node:http');
  
  const server = http.createServer((req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    // Route handling
    if (req.url === '/' && req.method === 'GET') {
      res.writeHead(200);
      res.end(JSON.stringify({
        message: 'Web App Server',
        version: VERSION,
        environment: ENVIRONMENT,
      }));
    } else if (req.url === '/health' && req.method === 'GET') {
      res.writeHead(200);
      res.end(JSON.stringify(createHealthResponse()));
    } else if (req.url === '/info' && req.method === 'GET') {
      res.writeHead(200);
      res.end(JSON.stringify(getAppInfo()));
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Not Found' }));
    }
  });

  return server;
}

// Main entry point
async function main() {
  const PORT = process.env.PORT || 3000;
  const server = await createServer();
  
  server.listen(PORT, () => {
    console.log(`Web App Server running on port ${PORT}`);
    console.log(`Environment: ${ENVIRONMENT}`);
    console.log(`Version: ${VERSION}`);
    console.log(`Build Time: ${BUILD_TIME}`);
    console.log(`\nEndpoints:`);
    console.log(`  GET /        - Server info`);
    console.log(`  GET /health  - Health check`);
    console.log(`  GET /info    - App metadata`);
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log('\nShutting down gracefully...');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  return server;
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
