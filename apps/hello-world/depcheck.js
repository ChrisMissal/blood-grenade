import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const appDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(appDir, '..', '..');
const appName = path.basename(appDir);

console.log('Running app dependency checks with dependency-cruiser...\n');

execFileSync('npm', [
  'exec',
  'depcruise',
  '--',
  '--config',
  '.dependency-cruiser.cjs',
  `apps/${appName}`,
], {
  cwd: repoRoot,
  stdio: 'inherit',
});
