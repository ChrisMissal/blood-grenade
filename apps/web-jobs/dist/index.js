import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const VERSION = '0.0.0-dev';
export const ENVIRONMENT = 'development';
export const BUILD_TIME = '2026-02-09T22:43:38.122Z';

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

// Job queue management
const jobQueue = [];
const jobResults = new Map();
let jobIdCounter = 0;

export function createJob(type, data) {
  const jobId = ++jobIdCounter;
  const job = {
    id: jobId,
    type,
    data,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  jobQueue.push(job);
  return job;
}

export function getJob(jobId) {
  return jobResults.get(jobId) || jobQueue.find(j => j.id === jobId);
}

export function getAllJobs() {
  const pending = jobQueue.map(j => ({ ...j }));
  const completed = Array.from(jobResults.values());
  return { pending, completed };
}

// Job processor
export function processJobs() {
  while (jobQueue.length > 0) {
    const job = jobQueue.shift();
    job.status = 'processing';
    job.startedAt = new Date().toISOString();
    
    // Simulate job processing
    setTimeout(() => {
      job.status = 'completed';
      job.completedAt = new Date().toISOString();
      job.result = `Processed ${job.type} job with data: ${JSON.stringify(job.data)}`;
      jobResults.set(job.id, job);
    }, 100);
  }
}

// Simple HTTP server
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
        message: 'Web + Jobs Server',
        version: VERSION,
        environment: ENVIRONMENT,
      }));
    } else if (req.url === '/health' && req.method === 'GET') {
      res.writeHead(200);
      res.end(JSON.stringify(createHealthResponse()));
    } else if (req.url === '/info' && req.method === 'GET') {
      res.writeHead(200);
      res.end(JSON.stringify(getAppInfo()));
    } else if (req.url === '/jobs' && req.method === 'GET') {
      res.writeHead(200);
      res.end(JSON.stringify(getAllJobs()));
    } else if (req.url === '/jobs' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const { type, data } = JSON.parse(body);
          const job = createJob(type, data);
          res.writeHead(201);
          res.end(JSON.stringify(job));
        } catch (err) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });
      return;
    } else if (req.url.startsWith('/jobs/') && req.method === 'GET') {
      const jobId = parseInt(req.url.split('/')[2]);
      const job = getJob(jobId);
      if (job) {
        res.writeHead(200);
        res.end(JSON.stringify(job));
      } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Job not found' }));
      }
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
  
  // Start job processor
  setInterval(() => {
    processJobs();
  }, 1000);

  server.listen(PORT, () => {
    console.log(`Web + Jobs Server running on port ${PORT}`);
    console.log(`Environment: ${ENVIRONMENT}`);
    console.log(`Version: ${VERSION}`);
    console.log(`Build Time: ${BUILD_TIME}`);
    console.log(`\nEndpoints:`);
    console.log(`  GET  /          - Server info`);
    console.log(`  GET  /health    - Health check`);
    console.log(`  GET  /info      - App metadata`);
    console.log(`  GET  /jobs      - List all jobs`);
    console.log(`  POST /jobs      - Create new job`);
    console.log(`  GET  /jobs/:id  - Get job status`);
    console.log(`\nBackground job processor running...`);
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
