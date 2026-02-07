# blood-grenade

Monorepo with automated release pipeline demonstrating Git &amp; GitHub automation.

## Features

- 🔒 **Protected Main Branch**: Squash PRs only
- 📝 **Conventional Commits**: Enforced on all PRs
- 🚀 **Semantic Releases**: Automatic versioning with vX.Y.Z tags
- 🏗️ **Immutable Releases**: No rebuilds, version injection at build time
- 📦 **GitHub Releases**: Automated release notes
- 🐳 **GHCR Publishing**: Container images published automatically
- 🎯 **Manual Deployments**: Tag-based deployments to environments
- 📊 **Build Metadata**: Version, environment, and timestamp injection

## Quick Start

See [PIPELINE.md](PIPELINE.md) for complete documentation.

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
- **Build**: Builds packages with version injection
- **Release**: Creates semantic releases and publishes to GHCR
- **Deploy**: Manual deployment by tag and environment

## License

MIT
