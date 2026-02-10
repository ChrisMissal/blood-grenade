import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const appDir = path.dirname(fileURLToPath(import.meta.url));
const tsconfigPath = path.join(appDir, 'tsconfig.json');

console.log('Running typecheck...\n');

execSync(`npm exec tsc -- --noEmit --project "${tsconfigPath}"`, {
  stdio: 'inherit',
  shell: true,
});
