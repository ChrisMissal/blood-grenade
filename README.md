# __PROJECT_NAME__

Template monorepo for Node.js services with automated validation, release, and deployment workflows.

## Features

- 🔒 **Protected Main Branch**: Squash PRs only
- 📝 **Conventional Commits**: Enforced on all PRs
- 🚀 **Semantic Releases**: Automatic versioning with vX.Y.Z tags
- 🏗️ **Immutable Releases**: No rebuilds, version injection at build time
- 📦 **GitHub Releases**: Automated release notes
- 🧾 **Changelog Automation**: `CHANGELOG.md` updated on release
- 🐳 **Container Publishing**: Container images published automatically
- 🎯 **Manual Deployments**: Tag-based deployments to environments
- 📊 **Build Metadata**: Version, environment, and timestamp injection
- 🏛️ **Architecture Rules**: Enforced file structure with dependency-cruiser

## Quick Start

See [PIPELINE.md](PIPELINE.md), [TEMPLATE_SETUP.md](TEMPLATE_SETUP.md), [ARCHITECTURE.md](ARCHITECTURE.md), and [CONTRIBUTING.md](CONTRIBUTING.md) for complete documentation.

### Validation Commands

Run these commands from the repository root before opening a PR:

```bash
npm run typecheck
npm test
npm run depcruise
npm run commitlint
```

### Template Setup

1. Replace placeholders (or run the helper script):
   ```bash
   ./scripts/rename-project.sh "__PROJECT_NAME__" "__CONTAINER_REGISTRY__" "__DEFAULT_ENVIRONMENTS__"
   ```
2. Configure GitHub settings:
   ```bash
   ./scripts/setup-github.sh
   ```

### Development Workflow

1. Create feature branch: `git checkout -b feat/my-feature`
2. Make changes and commit (any format)
3. Create PR with conventional title: `feat: add new feature`
4. Squash merge to `main` (or your configured release branch strategy)
5. Automatic release created (if applicable)

### Deploy a Release

1. Go to Actions → Deploy → Run workflow
2. Enter release tag (e.g., `v1.2.3`)
3. Select environment (`development`, `staging`, or `production`)
4. Run workflow

## Workflows

- **PR Check**: Validates conventional commit format
- **Build**: Builds workspace apps with version injection
- **Release**: Creates semantic releases and publishes to __CONTAINER_REGISTRY__
- **Deploy**: Manual deployment by tag and environment

## Applications Registry

This monorepo contains the following applications:

| App | Location | Type | Description |
|-----|----------|------|-------------|
| **hello-world** | [`apps/hello-world`](apps/hello-world) | Starter Template | Console app demonstrating the build pipeline, testing, and release structure. Use as a template for new apps. |
| **daemon** | [`apps/daemon`](apps/daemon) | Long-running Worker | Non-HTTP daemon baseline with lifecycle logging and graceful shutdown behavior. |
| **web-app** | [`apps/web-app`](apps/web-app) | Web Server | HTTP server with health checks and metadata endpoints. Demonstrates web service patterns with graceful shutdown. |
| **web-jobs** | [`apps/web-jobs`](apps/web-jobs) | Web + Background Jobs | HTTP server with background job processing. Demonstrates job queue management, async processing, and API endpoints for job control. |
| **task-runner** | [`apps/task-runner`](apps/task-runner) | Task Executor + Web UI | Execute tasks with editable arguments on Docker images, fetch and run code from public GitHub repositories, and monitor progress via single-page web application with real-time output display. |

## Local Development

To run each app locally, build it first, then execute it. All web apps run on port 3000 by default (configurable via `PORT` environment variable).

### hello-world (Console App)

```bash
cd apps/hello-world
npm run build
node dist/index.js
```

Output: Displays greeting, version, environment, and build time.

### web-app (HTTP Server)

```bash
cd apps/web-app
npm run build
node dist/index.js
```

Access the server at `http://localhost:3000`:
- `GET /` – Root endpoint
- `GET /health` – Health check with status and metadata
- `GET /info` – App information (version, environment, build time)

### daemon (Long-running Process)

```bash
cd apps/daemon
npm run build
node dist/index.js
```

Output: periodic heartbeat logs with graceful shutdown handling when the process receives a termination signal.

### web-jobs (HTTP Server + Job Queue)

```bash
cd apps/web-jobs
npm run build
node dist/index.js
```

Access the server at `http://localhost:3000`:
- `GET /` – Root endpoint
- `GET /health` – Health check with status and metadata
- `GET /info` – App information
- `GET /api/jobs` – List all jobs (pending and completed)
- `POST /api/jobs` – Create a new job (submit `type` and `data` in JSON body)
- `GET /api/jobs/:id` – Get a specific job by ID

### task-runner (Task Executor + Web UI)

```bash
cd apps/task-runner
npm run build
node dist/index.js
```

Access the web application at `http://localhost:3000`:
- **Web UI** – Single-page app for creating and monitoring tasks
- `GET /health` – Health check endpoint
- `GET /info` – App information
- `POST /api/tasks` – Create a task (JSON: `{name, githubRepo, dockerImage, command, args}`)
- `GET /api/tasks` – List all tasks
- `GET /api/tasks/:id` – Get task details
- `POST /api/tasks/:id/run` – Execute a task
- `GET /api/tasks/:id/progress` – Poll task progress and output
- `GET /api/github/repos?query=...` – Search GitHub repositories

**Features:**
- Create tasks with editable arguments
- Fetch code from public GitHub repositories
- Monitor task execution progress in real-time
- View live task output with syntax highlighting
- Task management API for automation

### Running All Apps

Build and test all apps at once:

```bash
npm run build --workspaces
npm run test --workspaces
npm run check:apps
```

### Adding New Apps

To add a new app to the monorepo:

1. Copy the entire `apps/hello-world` directory as a template
2. Update `package.json` with your new app name and description
3. Update `src/index.js` with your app's business logic
4. Update `version.js` output message
5. Run tests: `npm test` (structural tests validate the setup)
6. Commit with conventional format: `feat: add new-app`

The entire build pipeline, testing, linting, and release automation will work automatically for your new app.

## AI Agent Guidance

If you use AI coding assistants (Codex, Copilot, Claude, etc.), start with [AI_AGENTS.md](AI_AGENTS.md).
Tool-specific entry points:

- [AGENTS.md](AGENTS.md) for Codex/OpenAI-compatible agents
- [.github/copilot-instructions.md](.github/copilot-instructions.md) for GitHub Copilot
- [CLAUDE.md](CLAUDE.md) for Claude Code

## Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) for details on:

- Commit message guidelines (conventional commits)
- Pull request process
- Code standards and architecture rules
- Testing requirements

**Quick reference for commits:**
- Use conventional commit format: `type(scope): subject`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`
- Subject must start with lowercase
- PR titles must follow the same format

## License

MIT
