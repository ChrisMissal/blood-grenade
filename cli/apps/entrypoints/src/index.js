import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleError } from './utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

const todoCommands = {
  create: 'Create a new app from template',
  validate: 'Validate all configurations and structure',
  migrate: 'Migrate old app structure to new template',
  generate: 'Generate missing .env files from .env.example templates',
  doctor: 'Check system health and configuration issues'
};

function printHelp() {
  console.log(`
Usage:
  bg entrypoints <command> [options]

Available commands:
${Object.entries(commands)
  .map(([cmd, info]) => `  ${cmd.padEnd(10)} ${info.description}`)
  .join('\n')}

Planned commands:
${Object.entries(todoCommands)
  .map(([cmd, description]) => `  ${cmd.padEnd(10)} ${description}`)
  .join('\n')}
`);
}

export async function execute(args, context) {
  const repoRoot = context?.repoRoot ?? path.resolve(__dirname, '../../../..');

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h' || args[0] === 'help') {
    printHelp();
    return;
  }

  const command = args[0];

  if (!commands[command]) {
    handleError(`Unknown command: ${command}`);
    console.log('\nRun "bg entrypoints help" to see available commands.');
    process.exit(1);
  }

  try {
    const commandModule = await import(commands[command].file);
    await commandModule.execute(args.slice(1), { rootDir: repoRoot });
  } catch (error) {
    handleError(`Failed to execute command '${command}': ${error.message}`);
    process.exit(1);
  }
}
