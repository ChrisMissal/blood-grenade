

// LEGACY: This file is for sample/legacy use only. All new orchestration should use core/container.ts abstractions.
// Deprecated: building-blocks utilities will be removed as advanced features are implemented.

const path = require('path');
const { Container } = require('../core/container');

/**
 * Compose config builder for sample apps. Use Container instances from core/container.ts.
 * @deprecated Use core/container.ts and new orchestration utilities for advanced features.
 */
function composeConfigBuilder(containerInstance) {
  const service = containerInstance.name;
  const port = containerInstance.ports[0] || 3000;
  const env = Object.entries(containerInstance.env).map(([k, v]) => `${k}=${v}`);
  const healthEndpoint = containerInstance.healthcheck?.path || '/health';
  return {
    version: '3.8',
    services: {
      [service]: {
        build: {
          context: path.relative(process.cwd(), path.join('..', '..', 'apps', service)),
        },
        ports: [ `${port}:3000` ],
        environment: [
          ...env,
          'NODE_ENV=test',
          'PORT=3000',
        ],
        healthcheck: {
          test: [ 'CMD', 'curl', '-f', `http://localhost:3000${healthEndpoint}` ],
          interval: containerInstance.healthcheck?.interval || '5s',
          timeout: containerInstance.healthcheck?.timeout || '3s',
          retries: containerInstance.healthcheck?.retries || 3,
        },
      },
    },
  };
}

module.exports = { composeConfigBuilder };
