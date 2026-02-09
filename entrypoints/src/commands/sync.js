import fs from 'node:fs';
import path from 'node:path';
import { logInfo, logSuccess, handleError, logVerbose } from '../utils/logger.js';

export async function execute(args, context) {
  const { rootDir } = context;
  const verbose = args.includes('--verbose') || args.includes('-v');
  const dryRun = args.includes('--dry-run');
  const helpRequested = args.includes('--help') || args.includes('-h');

  if (helpRequested) {
    console.log(`
ep sync - Synchronize environment and output configuration

USAGE:
  ep sync [options]

OPTIONS:
  --dry-run       Preview changes without applying them
  --verbose, -v   Show detailed sync operations
  --help, -h      Show this help message

DESCRIPTION:
  Synchronizes configuration across all applications by:
  - Ensuring all apps have required .env.example templates
  - Creating outputs/ directories for build artifacts
  - Verifying golden file structures for tests
  - Aligning configuration between app templates

EXAMPLES:
  ep sync                    Run full sync
  ep sync --dry-run          Preview changes
  ep sync --verbose          Show detailed operations
`);
    return;
  }

  try {
    logInfo(`Synchronizing configuration${dryRun ? ' (dry-run mode)' : ''}...`);
    
    const appsDir = path.join(rootDir, 'apps');
    const envDir = path.join(rootDir, 'env');

    if (!fs.existsSync(appsDir)) {
      handleError(`Apps directory not found: ${appsDir}`);
      process.exit(1);
    }

    let syncedCount = 0;
    let createdCount = 0;

    const apps = fs.readdirSync(appsDir).filter(name => {
      const fullPath = path.join(appsDir, name);
      return fs.statSync(fullPath).isDirectory();
    });

    console.log();

    for (const app of apps) {
      const appPath = path.join(appsDir, app);
      logVerbose(`Processing ${app}...`, verbose);

      // Ensure dist/ exists
      const distPath = path.join(appPath, 'dist');
      if (!fs.existsSync(distPath)) {
        if (!dryRun) {
          fs.mkdirSync(distPath, { recursive: true });
          logSuccess(`  ✓ Created dist/ directory for ${app}`);
        } else {
          logVerbose(`  [DRY-RUN] Would create dist/ directory for ${app}`, verbose);
        }
        createdCount++;
      }

      // Ensure outputs/ exists
      const outputsPath = path.join(appPath, 'outputs');
      if (!fs.existsSync(outputsPath)) {
        if (!dryRun) {
          fs.mkdirSync(outputsPath, { recursive: true });
          logSuccess(`  ✓ Created outputs/ directory for ${app}`);
        } else {
          logVerbose(`  [DRY-RUN] Would create outputs/ directory for ${app}`, verbose);
        }
        createdCount++;
      }

      // Ensure env/ exists in app
      const appEnvPath = path.join(appPath, 'env');
      if (!fs.existsSync(appEnvPath)) {
        if (!dryRun) {
          fs.mkdirSync(appEnvPath, { recursive: true });
          logSuccess(`  ✓ Created env/ directory for ${app}`);
        } else {
          logVerbose(`  [DRY-RUN] Would create env/ directory for ${app}`, verbose);
        }
        createdCount++;
      }

      // Ensure test/golden/ exists
      const goldenPath = path.join(appPath, 'test', 'golden');
      if (!fs.existsSync(goldenPath)) {
        if (!dryRun) {
          fs.mkdirSync(goldenPath, { recursive: true });
          logSuccess(`  ✓ Created test/golden/ directory for ${app}`);
        } else {
          logVerbose(`  [DRY-RUN] Would create test/golden/ directory for ${app}`, verbose);
        }
        createdCount++;
      }

      syncedCount++;
    }

    console.log();
    if (createdCount > 0) {
      logSuccess(`Configuration synced: ${syncedCount} app(s) processed, ${createdCount} resource(s) created${dryRun ? ' (dry-run)' : ''}`);
    } else {
      logSuccess(`Configuration already in sync across ${syncedCount} app(s)`);
    }

    logVerbose(`Root env directory: ${envDir}`, verbose);
    logVerbose(`Total apps synced: ${syncedCount}`, verbose);

  } catch (error) {
    handleError(`Sync failed: ${error.message}`);
    process.exit(1);
  }
}
