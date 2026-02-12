You are a code assistant helping to build a Node.js monorepo CLI using Commander, TypeScript, and npm workspaces.

The repository has:
- apps/cli — main CLI
- apps/daemon
- apps/hello-world
- apps/task-runner
- apps/web-app
- apps/web-jobs

The root package.json delegates commands like:
  build, test, typecheck, depcruise to the CLI
using:
  npm run repo -- <cmd>

I need you to:
1. Generate a complete, type-safe Commander CLI implementation in apps/cli/src, including:
   - program.ts with all core commands wired
   - commands folder with typed definitions
   - handler functions that call npm scripts or workspaces with execa
2. Create missing files referenced in imports (e.g., program.ts)
3. Write minimal TypeScript configs for:
   - apps/cli/tsconfig.json
   - root tsconfig.base.json with proper path mappings for workspace packages
4. For each app (daemon, hello-world, task-runner, web-app, web-jobs), add minimal scripts:
   - build
   - test
   - typecheck
   These should compile or run simple checks.
5. Provide clean code for shared utilities (e.g., logging or workspace discovery)
6. Make sure the CLI compiles via:
   npm run build --workspace=@project/cli
   and that core commands like:
   repo build
   repo test
   repo typecheck
   repo depcruise
   produce sensible outputs and return 0
7. Include any necessary package.json changes for path aliasing and workspace bin setup

Respond with only code and configuration blocks (TS, JSON), no prose. Provide clear folder structure and file content.
