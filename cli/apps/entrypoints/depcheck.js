import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const entrypointsDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(entrypointsDir, '..');

console.log('Running entrypoints dependency checks with dependency-cruiser...\n');

execFileSync('npm', [
  'exec',
  'depcruise',
  '--',
  '--config',
  '.dependency-cruiser.cjs',
  'cli/apps/entrypoints',
], {
  cwd: repoRoot,
  stdio: 'inherit',
});
