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
    service: 'task-runner',
    version: VERSION,
    environment: ENVIRONMENT,
    timestamp: new Date().toISOString(),
  };
}

// Task management
const tasks = new Map();
const taskQueue = [];
let taskIdCounter = 0;

export function createTask({ name, githubRepo, dockerImage, command, args = {} }) {
  const taskId = ++taskIdCounter;
  const task = {
    id: String(taskId),
    name,
    githubRepo,
    dockerImage,
    command,
    args,
    status: 'pending',
    progress: 0,
    output: '',
    createdAt: new Date().toISOString(),
    startedAt: null,
    completedAt: null,
  };
  tasks.set(task.id, task);
  return task;
}

export function getTask(taskId) {
  return tasks.get(String(taskId));
}

export function getAllTasks() {
  return Array.from(tasks.values());
}

export function updateTaskArgs(taskId, newArgs) {
  const task = tasks.get(String(taskId));
  if (task) {
    task.args = { ...task.args, ...newArgs };
    return task;
  }
  return null;
}

// GitHub integration
export async function fetchGitHubRepo(repoName) {
  // Simulate fetching repo info from GitHub API
  // In production, would use: https://api.github.com/repos/{owner}/{repo}
  const [owner, repo] = repoName.split('/');
  if (!owner || !repo) {
    throw new Error('Invalid repo format. Use: owner/repo');
  }
  return {
    name: repo,
    owner,
    url: `https://github.com/${owner}/${repo}`,
    description: `GitHub repository ${owner}/${repo}`,
    isPublic: true,
  };
}

export async function listGitHubRepos(query) {
  // Simulate listing repos based on query
  return [
    { name: 'nodejs-app', owner: 'example', url: 'https://github.com/example/nodejs-app' },
    { name: 'react-frontend', owner: 'example', url: 'https://github.com/example/react-frontend' },
    { name: 'api-server', owner: 'example', url: 'https://github.com/example/api-server' },
  ].filter(r => r.name.includes(query) || r.owner.includes(query));
}

// Docker task execution framework
export async function runTask(taskId) {
  const task = getTask(String(taskId));
  if (!task) throw new Error('Task not found');

  task.status = 'running';
  task.startedAt = new Date().toISOString();
  task.output = `Starting task: ${task.name}\n`;
  task.output += `Repository: ${task.githubRepo}\n`;
  task.output += `Docker Image: ${task.dockerImage}\n`;
  task.output += `Command: ${task.command}\n`;
  task.output += `Arguments: ${JSON.stringify(task.args)}\n\n`;
  task.output += '--- Task Output ---\n';

  // Simulate Docker task execution
  simulateTaskExecution(task);
  return task;
}

function simulateTaskExecution(task) {
  // Simulate progress updates
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 30;
    if (progress > 100) progress = 100;
    task.progress = Math.min(Math.round(progress), 100);

    const step = Math.floor(progress / 25);
    const steps = [
      'Cloning repository...',
      'Installing dependencies...',
      'Building Docker image...',
      'Running container and executing command...',
    ];

    if (step < steps.length) {
      task.output += `[${new Date().toISOString()}] ${steps[step]}\n`;
    }

    if (progress >= 100) {
      clearInterval(interval);
      task.status = 'completed';
      task.completedAt = new Date().toISOString();
      task.output += `\n✓ Task completed successfully\n`;
      task.output += `Completed at: ${task.completedAt}`;
      task.progress = 100;
    }
  }, 300);
}

export function getTaskProgress(taskId) {
  const task = getTask(String(taskId));
  if (!task) throw new Error('Task not found');

  return {
    progress: task.progress,
    status: task.status,
    output: task.output,
  };
}

// HTTP Server
export async function createServer() {
  const http = await import('node:http');
  const url = await import('node:url');

  const server = http.createServer(async (req, res) => {
    const pathname = url.parse(req.url, true).pathname;
    const query = url.parse(req.url, true).query;

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    try {
      // Routes
      if (pathname === '/' && req.method === 'GET') {
        res.setHeader('Content-Type', 'text/html');
        const fs = await import('node:fs');
        const htmlPath = import.meta.url.replace('file://', '').replace(/src[\\\/]index\.js$/, 'public/index.html');
        const html = fs.readFileSync(htmlPath.replace(/\\/g, '/').match(/[A-Za-z0-9:\/\-_.]+public[\\\/]index\.html/)[0], 'utf8').replace(/\\\\/g, '/');
        res.writeHead(200);
        res.end(html);
        return;
      }

      if (pathname === '/health' && req.method === 'GET') {
        res.writeHead(200);
        res.end(JSON.stringify(createHealthResponse()));
        return;
      }

      if (pathname === '/info' && req.method === 'GET') {
        res.writeHead(200);
        res.end(JSON.stringify(getAppInfo()));
        return;
      }

      if (pathname === '/api/tasks' && req.method === 'GET') {
        res.writeHead(200);
        res.end(JSON.stringify(getAllTasks()));
        return;
      }

      if (pathname === '/api/tasks' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
          const { name, githubRepo, dockerImage, command, args } = JSON.parse(body);
          const task = createTask({ name, githubRepo, dockerImage, command, args });
          res.writeHead(201);
          res.end(JSON.stringify(task));
        });
        return;
      }

      const taskMatch = pathname.match(/^\/api\/tasks\/(\d+)$/);
      if (taskMatch && req.method === 'GET') {
        const taskId = taskMatch[1];
        const task = getTask(taskId);
        if (task) {
          res.writeHead(200);
          res.end(JSON.stringify(task));
        } else {
          res.writeHead(404);
          res.end(JSON.stringify({ error: 'Task not found' }));
        }
        return;
      }

      const runMatch = pathname.match(/^\/api\/tasks\/(\d+)\/run$/);
      if (runMatch && req.method === 'POST') {
        const taskId = runMatch[1];
        try {
          const task = await runTask(taskId);
          res.writeHead(200);
          res.end(JSON.stringify(task));
        } catch (err) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: err.message }));
        }
        return;
      }

      const progressMatch = pathname.match(/^\/api\/tasks\/(\d+)\/progress$/);
      if (progressMatch && req.method === 'GET') {
        const taskId = progressMatch[1];
        try {
          const progress = getTaskProgress(taskId);
          res.writeHead(200);
          res.end(JSON.stringify(progress));
        } catch (err) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: err.message }));
        }
        return;
      }

      if (pathname === '/api/github/repos' && req.method === 'GET') {
        const searchQuery = query.q || '';
        const repos = await listGitHubRepos(searchQuery);
        res.writeHead(200);
        res.end(JSON.stringify(repos));
        return;
      }

      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Not Found' }));
    } catch (err) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: err.message }));
    }
  });

  return server;
}

// Main entry point
async function main() {
  const PORT = process.env.PORT || 3000;
  const server = await createServer();

  server.listen(PORT, () => {
    console.log(`Task Runner Server running on port ${PORT}`);
    console.log(`Environment: ${ENVIRONMENT}`);
    console.log(`Version: ${VERSION}`);
    console.log(`\nOpen http://localhost:${PORT} in your browser`);
    console.log(`\nAPI Endpoints:`);
    console.log(`  GET  /              - Web UI`);
    console.log(`  GET  /health        - Health check`);
    console.log(`  GET  /info          - App metadata`);
    console.log(`  GET  /api/tasks     - List all tasks`);
    console.log(`  POST /api/tasks     - Create task`);
    console.log(`  GET  /api/tasks/:id - Get task details`);
    console.log(`  POST /api/tasks/:id/run - Run task`);
    console.log(`  GET  /api/tasks/:id/progress - Get task progress`);
    console.log(`  GET  /api/github/repos - Search GitHub repos`);
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
  const program = new Command();
  program
    .name('task-runner')
    .description('Task Runner App')
    .version(VERSION)
    .option('--port <port>', 'Port to run the server on', process.env.PORT || '3000')
    .option('--healthcheck', 'Start server, check /health, then exit')
    .action(async (opts) => {
      if (opts.healthcheck) {
        const PORT = opts.port || process.env.PORT || 3000;
        const server = await createServer();
        server.listen(PORT, async () => {
          try {
            const actualPort = server.address().port;
            const http = await import('node:http');
            const req = http.request({
              hostname: '127.0.0.1',
              port: actualPort,
              path: '/health',
              method: 'GET',
            }, (res) => {
              let data = '';
              res.on('data', chunk => data += chunk);
              res.on('end', () => {
                console.log('Health check response:', data);
                server.close(() => process.exit(0));
              });
            });
            req.on('error', (err) => {
              console.error('Health check failed:', err);
              server.close(() => process.exit(1));
            });
            req.end();
          } catch (err) {
            console.error('Health check error:', err);
            server.close(() => process.exit(1));
          }
        });
      } else {
        main().catch((err) => {
          console.error('Failed to start server:', err);
          process.exit(1);
        });
      }
    });
  program.parse(process.argv);
}
