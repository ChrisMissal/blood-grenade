# Contributing to this Project

Thank you for your interest in contributing! This guide will help you understand our development workflow and standards.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)
- [Code Standards](#code-standards)
- [Testing](#testing)
- [Architecture](#architecture)

## Getting Started

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/ChrisMissal/blood-grenade.git
   cd blood-grenade
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Verify your setup**
   ```bash
   npm run typecheck
   npm run depcruise
npm run check:apps
   npm test
   ```

## Development Workflow

We use a **trunk-based development** workflow with squash merges:

1. **Create a feature branch**
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make your changes**
   - Write clean, focused code
   - Add tests for new functionality
   - Update documentation as needed

3. **Commit your changes** (see [Commit Message Guidelines](#commit-message-guidelines))
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

4. **Push your branch**
   ```bash
   git push origin feat/your-feature-name
   ```

5. **Create a Pull Request**
   - Ensure your PR title follows conventional commit format
   - Fill out the PR template
   - Wait for CI checks to pass
   - Address review feedback

6. **Squash and merge**
   - Once approved, your PR will be squashed into a single commit
   - The PR title becomes the commit message on main
   - Automatic release may be triggered based on commit type

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification. This enables automatic versioning and changelog generation.

**Quick Reference**: See [.github/COMMIT_CONVENTION.md](.github/COMMIT_CONVENTION.md) for a condensed format guide.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type

Must be one of the following:

- **feat**: A new feature (triggers minor version bump)
- **fix**: A bug fix (triggers patch version bump)
- **docs**: Documentation only changes (no release)
- **style**: Code style changes (formatting, missing semicolons, etc.) (no release)
- **refactor**: Code changes that neither fix bugs nor add features (no release)
- **perf**: Performance improvements (triggers patch version bump)
- **test**: Adding or updating tests (no release)
- **build**: Changes to build system or dependencies (no release)
- **ci**: Changes to CI configuration (no release)
- **chore**: Other changes that don't modify src or test files (no release)
- **revert**: Reverts a previous commit (triggers patch version bump)

### Subject

- **Start with lowercase** (e.g., "add feature" not "Add feature")
- **Use imperative mood** (e.g., "add" not "added" or "adds")
- **No period at the end**
- **Be concise but descriptive** (50 characters or less recommended)

### Scope (Optional)

The scope should identify the area of the codebase:
- `api` - API changes
- `ui` - User interface changes
- `auth` - Authentication/authorization
- `db` - Database changes
- `docs` - Documentation
- Custom scopes based on your app structure

### Body (Optional)

- Explain **why** the change was made
- Describe any side effects
- Contrast with previous behavior

### Footer (Optional)

- **Breaking changes**: `BREAKING CHANGE: description`
- **Issue references**: `Closes #123`, `Fixes #456`, `Refs #789`

### Examples

**Feature with scope:**
```
feat(auth): add OAuth2 authentication

Implements OAuth2 authentication flow with support for
Google and GitHub providers.

Closes #123
```

**Bug fix:**
```
fix: prevent memory leak in event listener

Previously, event listeners were not being cleaned up
when components unmounted, causing memory leaks.
```

**Breaking change:**
```
feat!: redesign authentication API

BREAKING CHANGE: The authentication API has been redesigned.
All authentication endpoints now require the `X-API-Version: 2`
header. See migration guide for details.
```

**Documentation:**
```
docs: update installation instructions
```

### Validation

Commits are validated automatically in PRs using:
- **commitlint** - Validates commit message format
- **semantic-pr** - Validates PR title format

You can validate locally before pushing:
```bash
npm run commitlint
```

## Pull Request Process

### PR Title Requirements

**CRITICAL**: Your PR title must follow conventional commit format because it becomes the commit message when merged.

✅ **Good PR titles:**
```
feat: add user profile page
fix: resolve authentication timeout
docs: update API documentation
refactor: simplify error handling
```

❌ **Bad PR titles:**
```
Add feature
fix: Fix bug (uppercase subject)
update code (missing type)
New feature. (ends with period)
```

### PR Checklist

Before submitting your PR:

- [ ] PR title follows conventional commit format
- [ ] Code follows project style guidelines
- [ ] Tests added/updated for changes
- [ ] Documentation updated (if needed)
- [ ] All tests pass (`npm test`)
- [ ] Type checking passes (`npm run typecheck`)
- [ ] Architecture rules pass (`npm run depcruise`)
- [ ] App structure check passes (`npm run check:apps`)
- [ ] Commits validated (`npm run commitlint`)
- [ ] No merge conflicts with main

### Review Process

1. **Automated checks** run on every PR:
   - Conventional commit validation
   - Build verification
   - Test suite
   - Architecture validation

2. **Code review** by maintainers:
   - Code quality and style
   - Test coverage
   - Documentation completeness
   - Architecture compliance

3. **Approval and merge**:
   - At least one approval required
   - All checks must pass
   - Squash merge only (no merge commits or rebases)

## Code Standards

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Avoid `any` types
- Document public APIs with JSDoc

### Code Style

- Follow existing code patterns
- Use meaningful variable/function names
- Keep functions small and focused
- Add comments for complex logic

### Testing

- Write tests for new features
- Maintain or improve code coverage
- Use descriptive test names
- Follow existing test patterns

## AI-Assisted Contributions

AI-assisted changes are welcome, but contributors remain responsible for correctness and policy compliance.

When using Codex, Copilot, Claude, or similar agents:

- Start with [AI_AGENTS.md](AI_AGENTS.md) for repository-specific operating guidance
- Use the tool-specific entry file when available (`AGENTS.md`, `.github/copilot-instructions.md`, `CLAUDE.md`)
- Run and report required validations (`npm run typecheck`, `npm test`, `npm run depcruise`)
- Keep prompts and generated changes focused to one logical concern per PR

## Testing

Run tests locally before submitting:

```bash
# Run all tests
npm test

# Run tests in watch mode (during development)
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## Architecture

This repository enforces architectural rules using `dependency-cruiser`.

### Validation

```bash
# Validate architecture
npm run depcruise
npm run check:apps

# Generate dependency graph
npm run depcruise:graph

# Generate architecture diagram
npm run depcruise:graph:archi
```

### Rules

- Follow the established monorepo structure
- Respect module boundaries
- Avoid circular dependencies
- Keep apps independent

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed guidelines.

## Monorepo Structure

```
blood-grenade/
├── .github/
│   ├── agents/                 # Agent-specific instructions
│   └── workflows/              # CI/CD workflows
├── apps/                       # Application packages
│   └── example/
├── packages/                   # Shared packages
├── scripts/                    # Build and utility scripts
├── tools/                      # Development tools
├── commitlint.config.cjs       # Commit message linting
├── .dependency-cruiser.cjs     # Architecture rules
└── package.json                # Workspace configuration
```

## Release Process

Releases are automated based on conventional commits:

- **feat**: Minor version bump (1.2.3 → 1.3.0)
- **fix, perf, revert**: Patch version bump (1.2.3 → 1.2.4)
- **docs, style, refactor, test, build, ci, chore**: No release

When a PR is merged to main:
1. Semantic-release analyzes the commit
2. Version is bumped (if applicable)
3. Changelog is generated
4. GitHub Release is created
5. Container images are published
6. Git tag is created

See [PIPELINE.md](PIPELINE.md) for complete release pipeline documentation.

## Getting Help

- **Issues**: Open an issue for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions
- **Documentation**: See README.md, PIPELINE.md, ARCHITECTURE.md

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Follow project guidelines

## License

By contributing, you agree that your contributions will be licensed under the project's MIT License.
