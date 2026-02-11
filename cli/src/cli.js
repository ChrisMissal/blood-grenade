#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cliRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(cliRoot, '..');
const appsRoot = path.join(cliRoot, 'apps');

function discoverApps() {
  if (!fs.existsSync(appsRoot)) {
    return [];
  }

  return fs.readdirSync(appsRoot)
    .filter((name) => {
      const appRoot = path.join(appsRoot, name);
      return fs.statSync(appRoot).isDirectory() && fs.existsSync(path.join(appRoot, 'src', 'index.js'));
    })
    .sort();
}

function printHelp(apps) {
  console.log(`
Usage:
  bg <app> [args]

Available apps:
${apps.map((app) => `  - ${app}`).join('\n')}

Examples:
  bg entrypoints list
  bg entrypoints sync --dry-run
`);
}

async function run() {
  const apps = discoverApps();
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === 'help' || command === '--help' || command === '-h') {
    printHelp(apps);
    process.exit(0);
  }

  if (!apps.includes(command)) {
    console.error(`Unknown CLI app: ${command}`);
    printHelp(apps);
    process.exit(1);
  }

  const appRoot = path.join(appsRoot, command);
  const appEntry = path.join(appRoot, 'src', 'index.js');
  const appModule = await import(pathToFileURL(appEntry).href);

  if (typeof appModule.execute !== 'function') {
    console.error(`CLI app '${command}' does not export an execute(args, context) function`);
    process.exit(1);
  }

  await appModule.execute(args.slice(1), {
    repoRoot,
    cliRoot,
    appsRoot,
    appRoot,
    appName: command
  });
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
