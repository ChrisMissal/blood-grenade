export const VERSION = '0.0.0-dev';
export const ENVIRONMENT = 'development';
export const BUILD_TIME = '2026-02-09T18:24:53.610Z';

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
