import { execFileSync } from 'node:child_process';

execFileSync(process.execPath, ['--check', 'src/cli.js'], { stdio: 'inherit' });
console.log('✓ cli syntax checks passed');
