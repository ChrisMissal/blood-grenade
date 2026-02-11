import { execFileSync } from 'node:child_process';

const files = [
  'src/index.js',
  'src/utils/logger.js',
  'src/commands/list.js',
  'src/commands/sync.js',
];

for (const file of files) {
  execFileSync(process.execPath, ['--check', file], { stdio: 'inherit' });
}

console.log('✓ entrypoints app syntax checks passed');
