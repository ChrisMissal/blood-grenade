import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Command } from 'commander';

export const VERSION = '__VERSION__';
export const ENVIRONMENT = '__ENVIRONMENT__';

export function getAppInfo() {
  return {
    version: VERSION,
    environment: ENVIRONMENT,
  };
}

export function greet(name) {
  return `Hello, ${name}! Running version ${VERSION} in ${ENVIRONMENT}`;
}

function main() {
  const program = new Command();
  program
    .name('hello-world')
    .description('Hello World Example App')
    .version(VERSION)
    .option('-n, --name <name>', 'Name to greet', 'World')
    .action((opts) => {
      console.log(greet(opts.name));
      const appInfo = getAppInfo();
      console.log('\nApp Info:');
      console.log(`  Version: ${appInfo.version}`);
      console.log(`  Environment: ${appInfo.environment}`);
    });
  program.parse(process.argv);
}

const __filename = fileURLToPath(import.meta.url);
const mainModule = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);
if (mainModule) {
  main();
}
