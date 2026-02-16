#!/usr/bin/env node
// Usage: node scripts/create-github-token.mjs
// Guides user to create a GitHub personal access token for test/dev use

import open from 'open';
import readline from 'readline';

console.log('\nTo create a GitHub personal access token for CLI tests:');
console.log('1. Visit: https://github.com/settings/tokens?type=beta\n');
console.log('2. Click "Generate new token".');
console.log('3. Give it a name, select "public_repo" scope (or more if needed), and create the token.');
console.log('4. Copy the token and paste it into .env.test.github as GITHUB_TOKEN=...\n');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.question('Open GitHub token page in your browser now? (y/N): ', answer => {
  if (answer.trim().toLowerCase() === 'y') {
    open('https://github.com/settings/tokens?type=beta');
  }
  rl.close();
});
