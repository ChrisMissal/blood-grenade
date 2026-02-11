import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const appsDir = path.join(repoRoot, 'apps');

const requiredFiles = [
  'README.md',
  'Dockerfile',
  'build.js',
  'test.js',
  'commitlint.js',
  'depcheck.js',
  'package.js',
  'tag.js',
  'typecheck.js',
  'version.js',
  'package.json',
  'tsconfig.json',
  path.join('src', 'index.js'),
  path.join('dist', 'index.js'),
];

const appNames = fs.readdirSync(appsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

let failures = 0;

for (const appName of appNames) {
  const appPath = path.join(appsDir, appName);
  const missing = requiredFiles.filter((relativePath) => !fs.existsSync(path.join(appPath, relativePath)));

  if (missing.length > 0) {
    console.error(`❌ ${appName}: missing required files`);
    for (const file of missing) {
      console.error(`   - ${file}`);
    }
    failures++;
    continue;
  }

  const hasTestDir = fs.existsSync(path.join(appPath, 'test'));
  const hasGoldenDir = fs.existsSync(path.join(appPath, 'test', 'golden'));

  if (hasTestDir && !hasGoldenDir) {
    console.error(`❌ ${appName}: has test/ directory but missing test/golden/ directory`);
    failures++;
    continue;
  }

  console.log(`✅ ${appName}: structure aligned`);
}

if (failures > 0) {
  console.error(`\nFound ${failures} app structure issue(s).`);
  process.exit(1);
}

console.log(`\nAll ${appNames.length} apps have aligned structure.`);
