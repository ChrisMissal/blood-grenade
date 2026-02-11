import fs from 'node:fs';
import path from 'node:path';
import { logInfo, logSuccess, handleError, logVerbose } from '../utils/logger.js';

export async function execute(args, context) {
  const { rootDir } = context;
  const verbose = args.includes('--verbose') || args.includes('-v');
  const helpRequested = args.includes('--help') || args.includes('-h');

  if (helpRequested) {
    console.log(`
bg entrypoints list - List available applications, templates, and entrypoints

USAGE:
  bg entrypoints list [options]

OPTIONS:
  --verbose, -v   Show detailed configuration for each app
  --help, -h      Show this help message

DESCRIPTION:
  Displays all applications in the monorepo with their:
  - Location (relative path)
  - Type (Console, Web Server, etc.)
  - Configuration status (.env files)
  - Available templates

EXAMPLES:
  bg entrypoints list           Show all apps
  bg entrypoints list --verbose Show detailed configuration info
`);
    return;
  }

  try {
    const appsDir = path.join(rootDir, 'apps');
    
    if (!fs.existsSync(appsDir)) {
      handleError(`Apps directory not found: ${appsDir}`);
      process.exit(1);
    }

    const apps = fs.readdirSync(appsDir).filter(name => {
      const fullPath = path.join(appsDir, name);
      return fs.statSync(fullPath).isDirectory();
    });

    if (apps.length === 0) {
      logInfo('No applications found.');
      return;
    }

    logVerbose(`Found ${apps.length} application(s)`, verbose);
    console.log(`\n📦 Applications (${apps.length}):\n`);

    apps.forEach((app, index) => {
      const appPath = path.join(appsDir, app);
      const packageJsonPath = path.join(appPath, 'package.json');
      const envExamplePath = path.join(appPath, 'env');
      
      let packageJson = {};
      let type = 'Unknown';
      
      try {
        if (fs.existsSync(packageJsonPath)) {
          const content = fs.readFileSync(packageJsonPath, 'utf8');
          packageJson = JSON.parse(content);
          
          // Determine type based on keywords or content
          if (packageJson.keywords) {
            if (packageJson.keywords.includes('console')) type = 'Console App';
            else if (packageJson.keywords.includes('web-server')) type = 'Web Server';
            else if (packageJson.keywords.includes('background-jobs')) type = 'Web + Background Jobs';
            else if (packageJson.keywords.includes('task-executor')) type = 'Task Executor + Web UI';
          }
        }
      } catch (e) {
        logVerbose(`Failed to parse package.json for ${app}: ${e.message}`, verbose);
      }

      const description = packageJson.description || 'No description';
      const hasEnv = fs.existsSync(envExamplePath);

      console.log(`  ${index + 1}. ${app}`);
      console.log(`     Location: apps/${app}`);
      console.log(`     Type: ${type}`);
      console.log(`     Environment: ${hasEnv ? '✓ Configured' : '✗ Not configured'}`);
      
      if (verbose) {
        console.log(`     Description: ${description}`);
        const configFiles = getConfigFiles(appPath);
        if (configFiles.length > 0) {
          console.log(`     Config files: ${configFiles.join(', ')}`);
        }
      }
      console.log();
    });

    const envDir = path.join(rootDir, 'env');
    if (fs.existsSync(envDir)) {
      const envTemplates = fs.readdirSync(envDir).filter(f => f.endsWith('.env.example'));
      if (envTemplates.length > 0) {
        console.log(`\n⚙️  Environment Templates (${envTemplates.length}):\n`);
        envTemplates.forEach((template, index) => {
          console.log(`  ${index + 1}. ${template}`);
        });
        console.log();
      }
    }

    logSuccess(`Listing complete. Run "bg entrypoints list --verbose" for more details.`);
  } catch (error) {
    handleError(`Failed to list applications: ${error.message}`);
    process.exit(1);
  }
}

function getConfigFiles(appPath) {
  const files = [];
  try {
    const items = fs.readdirSync(appPath);
    if (items.includes('package.json')) files.push('package.json');
    if (items.includes('.env.example')) files.push('.env.example');
    if (items.includes('tsconfig.json')) files.push('tsconfig.json');
  } catch (e) {
    // Silently fail
  }
  return files;
}
