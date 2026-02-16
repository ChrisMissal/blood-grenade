const axios = require('axios');

describe('Docker Compose Integration', () => {

  it.skip('should respond to /health on task-runner', async () => {
    const res = await axios.get('http://localhost:4000/health');
    expect(res.status).toBe(200);
    expect(res.data.status).toBe('healthy');
  });

  it.skip('should respond to /health on web-app', async () => {
    const res = await axios.get('http://localhost:4001/health');
    expect(res.status).toBe(200);
    expect(res.data.status).toBe('healthy');
  });

  it.skip('should respond to /health on web-jobs', async () => {
    const res = await axios.get('http://localhost:4002/health');
    expect(res.status).toBe(200);
    expect(res.data.status).toBe('healthy');
  });
});
