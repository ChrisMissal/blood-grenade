import { execFileSync } from 'node:child_process';

console.log('Running dependency check...\n');

execFileSync('npx', ['depcheck', '--ignore-patterns=dist'], {
  stdio: 'inherit',
});
