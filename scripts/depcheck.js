import { execFileSync } from 'node:child_process';

console.log('Running architecture dependency checks with dependency-cruiser...\n');

execFileSync('npm', ['run', 'depcruise'], {
  stdio: 'inherit',
});
