# __PROJECT_NAME__

Reusable template monorepo with an automated release pipeline for Node + Docker apps.

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
4. Squash merge to `releases/**`
5. Automatic release created (if applicable)

### Deploy a Release

1. Go to Actions → Deploy → Run workflow
2. Enter release tag (e.g., `v1.2.3`)
3. Select environment (`development`, `staging`, or `production`)
4. Run workflow

## Workflows

- **PR Check**: Validates conventional commit format
- **Build**: Builds the hello-world app with version injection
- **Release**: Creates semantic releases and publishes to __CONTAINER_REGISTRY__
- **Deploy**: Manual deployment by tag and environment

## Applications Registry

This monorepo contains the following applications:

| App | Location | Type | Description |
|-----|----------|------|-------------|
| **hello-world** | [`apps/hello-world`](apps/hello-world) | Starter Template | Console app demonstrating the build pipeline, testing, and release structure. Use as a template for new apps. |
| **web-app** | [`apps/web-app`](apps/web-app) | Web Server | HTTP server with health checks and metadata endpoints. Demonstrates web service patterns with graceful shutdown. |
| **web-jobs** | [`apps/web-jobs`](apps/web-jobs) | Web + Background Jobs | HTTP server with background job processing. Demonstrates job queue management, async processing, and API endpoints for job control. |
| **task-runner** | [`apps/task-runner`](apps/task-runner) | Task Executor + Web UI | Execute tasks with editable arguments on Docker images, fetch and run code from public GitHub repositories, and monitor progress via single-page web application with real-time output display. |

### Adding New Apps

To add a new app to the monorepo:

1. Copy the entire `apps/hello-world` directory as a template
2. Update `package.json` with your new app name and description
3. Update `src/index.js` with your app's business logic
4. Update `version.js` output message
5. Run tests: `npm run test` (34 structural tests will validate the setup)
6. Commit with conventional format: `feat: add new-app`

The entire build pipeline, testing, linting, and release automation will work automatically for your new app.

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
