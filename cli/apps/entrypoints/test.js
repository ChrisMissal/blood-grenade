import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const requiredFiles = [
  'package.json',
  'README.md',
  'build.js',
  'typecheck.js',
  'depcheck.js',
  'src/index.js',
  'src/utils/logger.js',
  'src/commands/list.js',
  'src/commands/sync.js'
];

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(__dirname, file))) {
    throw new Error(`Missing required file: ${file}`);
  }
}

const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
if (!packageJson.scripts?.start?.includes('src/index.js')) {
  throw new Error('entrypoints start script must use src/index.js');
}

console.log('✓ entrypoints app structure tests passed');
