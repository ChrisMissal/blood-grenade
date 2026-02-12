const { execSync } = require('child_process');
const axios = require('axios');

describe('Docker Compose Integration', () => {
  beforeAll(() => {
    execSync('docker compose up -d --build', { cwd: __dirname, stdio: 'inherit' });
    // Wait for healthchecks (max 60s)
    let healthy = false;
    const start = Date.now();
    while (!healthy && Date.now() - start < 60000) {
      try {
        const task = execSync('docker inspect --format="{{.State.Health.Status}}" tests_docker-task-runner-1', { encoding: 'utf8' }).trim();
        const web = execSync('docker inspect --format="{{.State.Health.Status}}" tests_docker-web-app-1', { encoding: 'utf8' }).trim();
        const jobs = execSync('docker inspect --format="{{.State.Health.Status}}" tests_docker-web-jobs-1', { encoding: 'utf8' }).trim();
        healthy = task === 'healthy' && web === 'healthy' && jobs === 'healthy';
      } catch (e) {
        // ignore
      }
      if (!healthy) execSync('sleep 2');
    }
    if (!healthy) throw new Error('Containers did not become healthy in time');
  }, 90000);

  afterAll(() => {
    execSync('docker compose down', { cwd: __dirname, stdio: 'inherit' });
  });

  it('should respond to /health on task-runner', async () => {
    const res = await axios.get('http://localhost:4000/health');
    expect(res.status).toBe(200);
    expect(res.data.status).toBe('healthy');
  });

  it('should respond to /health on web-app', async () => {
    const res = await axios.get('http://localhost:4001/health');
    expect(res.status).toBe(200);
    expect(res.data.status).toBe('healthy');
  });

  it('should respond to /health on web-jobs', async () => {
    const res = await axios.get('http://localhost:4002/health');
    expect(res.status).toBe(200);
    expect(res.data.status).toBe('healthy');
  });
});
