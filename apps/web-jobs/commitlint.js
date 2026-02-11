import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const appDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(appDir, '..', '..');
const commitlintScript = path.join(repoRoot, 'scripts', 'commitlint.js');

execFileSync(process.execPath, [commitlintScript], {
  cwd: repoRoot,
  stdio: 'inherit',
});
