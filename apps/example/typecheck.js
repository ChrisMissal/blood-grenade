import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const appDir = path.dirname(fileURLToPath(import.meta.url));
const tsconfigPath = path.join(appDir, 'tsconfig.json');
// Use tsc from root node_modules
const tscPath = path.join(appDir, '..', '..', 'node_modules', '.bin', 'tsc');

console.log('Running typecheck...\n');

execFileSync(tscPath, ['--noEmit', '--project', tsconfigPath], {
  stdio: 'inherit',
});
