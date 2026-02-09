import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const packageJsonPath = path.join(rootDir, 'package.json');

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

console.log(`Web app version: ${packageJson.version}`);
