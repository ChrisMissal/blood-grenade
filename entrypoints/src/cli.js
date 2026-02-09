#!/usr/bin/env node

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { handleError, logInfo, logSuccess } from './utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

// Available commands
const commands = {
  list: {
    file: './commands/list.js',
    description: 'List available applications, templates, and entrypoints'
  },
  sync: {
    file: './commands/sync.js',
    description: 'Synchronize environment and output configuration'
  }
};

// TODO: Add these commands
const todoCommands = {
  create: 'Create a new app from template',
  validate: 'Validate all configurations and structure',
  migrate: 'Migrate old app structure to new template',
  generate: 'Generate missing .env files from .env.example templates',
  doctor: 'Check system health and configuration issues'
};

function printHelp() {
  console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║                    Entrypoints CLI (ep)                           ║
║             Manage templates, configuration & apps               ║
╚═══════════════════════════════════════════════════════════════════╝

USAGE:
  ep <command> [options]

AVAILABLE COMMANDS:
`);

  Object.entries(commands).forEach(([cmd, info]) => {
    console.log(`  ep ${cmd.padEnd(12)} ${info.description}`);
  });

  console.log(`
PLANNED COMMANDS (TODO):
`);

  Object.entries(todoCommands).forEach(([cmd, description]) => {
    console.log(`  ep ${cmd.padEnd(12)} ${description}`);
  });

  console.log(`
OPTIONS:
  --help, -h             Show this help message
  --verbose, -v          Enable verbose output

EXAMPLES:
  ep list                 Show all applications and templates
  ep sync                 Sync environment configuration
  ep help                 Show this help message

For command-specific help:
  ep <command> --help
`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h' || args[0] === 'help') {
    printHelp();
    process.exit(0);
  }

  const command = args[0];

  if (!commands[command]) {
    handleError(`Unknown command: ${command}`);
    console.log(`\nRun "ep help" to see available commands.`);
    process.exit(1);
  }

  try {
    const commandModule = await import(commands[command].file);
    await commandModule.execute(args.slice(1), { rootDir, __dirname });
  } catch (error) {
    handleError(`Failed to execute command '${command}': ${error.message}`);
    process.exit(1);
  }
}

main().catch((error) => {
  handleError(`Fatal error: ${error.message}`);
  process.exit(1);
});
