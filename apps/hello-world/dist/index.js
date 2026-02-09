import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const VERSION = '0.0.0-dev';
export const ENVIRONMENT = 'development';
export const BUILD_TIME = '2026-02-09T22:36:12.233Z';

export function getAppInfo() {
  return {
    version: VERSION,
    environment: ENVIRONMENT,
    buildTime: BUILD_TIME,
  };
}

export function greet(name) {
  return `Hello, ${name}! Running version ${VERSION} in ${ENVIRONMENT}`;
}

// Main entry point
function main() {
  console.log(greet('World'));
  const appInfo = getAppInfo();
  console.log('\nApp Info:');
  console.log(`  Version: ${appInfo.version}`);
  console.log(`  Environment: ${appInfo.environment}`);
  console.log(`  Build Time: ${appInfo.buildTime}`);
}

// Run if this is the main module
const __filename = fileURLToPath(import.meta.url);
const mainModule = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);
if (mainModule) {
  main();
}
