import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(rootDir, 'dist');
const packageJsonPath = path.join(rootDir, 'package.json');

console.log('Packaging example app...\n');

execFileSync(process.execPath, ['build.js'], {
  cwd: rootDir,
  stdio: 'inherit',
});

fs.mkdirSync(distDir, { recursive: true });

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const packageInfo = {
  name: packageJson.name,
  version: packageJson.version,
  packagedAt: new Date().toISOString(),
};

const outputPath = path.join(distDir, 'package-info.json');
fs.writeFileSync(outputPath, JSON.stringify(packageInfo, null, 2));

console.log(`\nCreated package artifact: ${outputPath}`);
