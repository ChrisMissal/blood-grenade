import { execSync } from 'node:child_process';

console.log('Running dependency check...\n');

execSync('npm exec depcheck -- --ignore-patterns=dist', {
  stdio: 'inherit',
  shell: true,
});
