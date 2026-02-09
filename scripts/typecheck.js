import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(scriptDir, '..');
const tsconfigPath = path.join(repoRoot, 'tsconfig.json');
const tscPath = path.join(repoRoot, 'node_modules', '.bin', 'tsc');

console.log('Running typecheck on repo root files...\n');

execFileSync(tscPath, ['--noEmit', '--project', tsconfigPath], {
  stdio: 'inherit',
});
