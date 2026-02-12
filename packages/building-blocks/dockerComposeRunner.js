// LEGACY: This file is for sample/legacy use only. All new orchestration should use core/container.ts abstractions.
// Deprecated: building-blocks utilities will be removed as advanced features are implemented.

const fs = require('fs');
const path = require('path');
const { execa } = require('execa');
const { composeConfigBuilder } = require('./composeConfigBuilder');
const { Container } = require('../core/container');

/**
 * Docker Compose runner for sample apps. Accepts Container instance from core/container.ts.
 * @deprecated Use core/container.ts and new orchestration utilities for advanced features.
 */
async function dockerComposeRunner(containerInstance) {
  if (!(containerInstance instanceof Container)) {
    throw new Error('dockerComposeRunner expects a Container instance');
  }
  const composeConfig = composeConfigBuilder(containerInstance);
  const project = 'project'; // or containerInstance.project if available
  const service = containerInstance.name;
  const tempDir = path.join('/tmp', `compose-${project}-${service}-${Date.now()}`);
  fs.mkdirSync(tempDir, { recursive: true });
  const composePath = path.join(tempDir, 'docker-compose.yml');
  fs.writeFileSync(composePath, JSON.stringify(composeConfig, null, 2));
  console.log(`Generated docker-compose.yml at ${composePath}`);
  try {
    await execa('docker', ['compose', '-f', composePath, 'up', '-d', '--build'], { stdio: 'inherit' });
    // Wait for health
    let healthy = false;
    const containerName = `${project}_${service}_1`;
    const start = Date.now();
    while (!healthy && Date.now() - start < 60000) {
      try {
        const { stdout } = await execa('docker', ['inspect', `--format={{.State.Health.Status}}`, containerName]);
        healthy = stdout.trim() === 'healthy';
      } catch {}
      if (!healthy) await new Promise(res => setTimeout(res, 2000));
    }
    if (!healthy) throw new Error('Container did not become healthy in time');
  } finally {
    await execa('docker', ['compose', '-f', composePath, 'down'], { stdio: 'inherit' });
  }
}

module.exports = { dockerComposeRunner };
