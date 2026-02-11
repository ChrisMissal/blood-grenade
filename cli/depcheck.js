import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const cliDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(cliDir, '..');

console.log('Running cli dependency checks with dependency-cruiser...\n');

execFileSync('npm', [
  'exec',
  'depcruise',
  '--',
  '--config',
  '.dependency-cruiser.cjs',
  'cli',
], {
  cwd: repoRoot,
  stdio: 'inherit',
});
