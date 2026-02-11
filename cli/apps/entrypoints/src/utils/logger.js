// Graceful error handling and logging utilities

export function logInfo(message) {
  console.log(`ℹ  ${message}`);
}

export function logSuccess(message) {
  console.log(`✓  ${message}`);
}

export function logWarn(message) {
  console.warn(`⚠  ${message}`);
}

export function handleError(message) {
  console.error(`✗  ${message}`);
}

export function logVerbose(message, isVerbose = false) {
  if (isVerbose) {
    console.log(`→  ${message}`);
  }
}
