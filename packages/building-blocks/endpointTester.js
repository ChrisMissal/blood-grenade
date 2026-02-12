// LEGACY: This file is for sample/legacy use only. All new endpoint testing should use core/container.ts abstractions.
// Deprecated: building-blocks utilities will be removed as advanced features are implemented.

const axios = require('axios');
const { App, Container } = require('../core/container');

/**
 * Endpoint tester for sample apps. Accepts App or Container instances from core/container.ts.
 * @deprecated Use core/container.ts and new endpoint testing utilities for advanced features.
 */
async function endpointTester(target, portOverride) {
  if (!(target instanceof App) && !(target instanceof Container)) {
    throw new Error('endpointTester expects an App or Container instance');
  }
  const endpoints = target.endpoints || (target.app && target.app.endpoints) || [];
  const host = target.host || 'localhost';
  const port = portOverride || target.port || (target.ports && target.ports[0]) || 3000;
  for (const ep of endpoints) {
    const url = `http://${host}:${port}${ep.path}`;
    const res = await axios({ method: ep.method, url });
    if (ep.expect?.status) expect(res.status).toBe(ep.expect.status);
    if (ep.expect?.body) expect(res.data).toMatchObject(ep.expect.body);
  }
}

module.exports = { endpointTester };
