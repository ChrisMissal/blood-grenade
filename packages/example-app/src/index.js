export const VERSION = '__VERSION__';
export const ENVIRONMENT = '__ENVIRONMENT__';
export const BUILD_TIME = '__BUILD_TIME__';

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
