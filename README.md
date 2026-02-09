# __PROJECT_NAME__

Reusable template monorepo with an automated release pipeline for Node + Docker apps.

## Features

- 🔒 **Protected Main Branch**: Squash PRs only
- 📝 **Conventional Commits**: Enforced on all PRs
- 🚀 **Semantic Releases**: Automatic versioning with vX.Y.Z tags
- 🏗️ **Immutable Releases**: No rebuilds, version injection at build time
- 📦 **GitHub Releases**: Automated release notes
- 🐳 **Container Publishing**: Container images published automatically
- 🎯 **Manual Deployments**: Tag-based deployments to environments
- 📊 **Build Metadata**: Version, environment, and timestamp injection
- 🏛️ **Architecture Rules**: Enforced file structure with dependency-cruiser

## Quick Start

See [PIPELINE.md](PIPELINE.md), [TEMPLATE_SETUP.md](TEMPLATE_SETUP.md), and [ARCHITECTURE.md](ARCHITECTURE.md) for complete documentation.

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
4. Squash merge to main
5. Automatic release created (if applicable)

### Deploy a Release

1. Go to Actions → Deploy → Run workflow
2. Enter release tag (e.g., `v1.2.3`)
3. Select environment (`development`, `staging`, or `production`)
4. Run workflow

## Workflows

- **PR Check**: Validates conventional commit format
- **Build**: Builds the example app with version injection
- **Release**: Creates semantic releases and publishes to __CONTAINER_REGISTRY__
- **Deploy**: Manual deployment by tag and environment

## License

MIT
