# Copilot and AI Agent Instructions

This document provides guidance for GitHub Copilot and other AI agents working in this repository.

## Commit Message Guidelines

**ALWAYS** follow the conventional commit format when creating commits or suggesting commit messages:

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Required Format Rules
1. **Type**: Must be one of the following:
   - `feat`: A new feature
   - `fix`: A bug fix
   - `docs`: Documentation only changes
   - `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc)
   - `refactor`: A code change that neither fixes a bug nor adds a feature
   - `perf`: A code change that improves performance
   - `test`: Adding missing tests or correcting existing tests
   - `build`: Changes that affect the build system or external dependencies
   - `ci`: Changes to CI configuration files and scripts
   - `chore`: Other changes that don't modify src or test files
   - `revert`: Reverts a previous commit

2. **Scope** (optional): The scope should identify the area of the codebase affected (e.g., `api`, `ui`, `auth`)

3. **Subject**: 
   - **MUST** start with a lowercase letter
   - **MUST** be concise and descriptive
   - **MUST NOT** end with a period
   - Use imperative mood ("add" not "added" or "adds")

4. **Body** (optional): Explain the motivation for the change and contrast with previous behavior

5. **Footer** (optional): Reference issues, breaking changes
   - Breaking changes: `BREAKING CHANGE: <description>`
   - Issue references: `Closes #123`, `Fixes #456`

### Examples

✅ **Good commit messages:**
```
feat: add user authentication
fix: resolve memory leak in parser
docs: update API documentation
refactor(auth): simplify login logic
feat!: redesign authentication API
```

❌ **Bad commit messages:**
```
Add feature (missing type)
feat: Add feature (uppercase subject)
update code (missing type and unclear)
Fix bug. (ends with period)
```

### Breaking Changes

For breaking changes, use either:
- `<type>!: <subject>` (e.g., `feat!: redesign API`)
- Or add `BREAKING CHANGE:` in the footer with description

## Commitlint Configuration

This repository uses `@commitlint/config-conventional` with the following customization:
- Subject case validation is disabled, allowing flexible casing (though lowercase is recommended)

Configuration file: `commitlint.config.cjs`

## Pull Request Guidelines

### PR Title Format
PR titles **MUST** follow the conventional commit format because they become the commit message when squashed and merged to main. The same rules apply as for commit messages.

### PR Workflow
1. Feature branches can have any commit messages (they will be squashed)
2. PR title must follow conventional commit format
3. On merge, PR is squashed into a single commit with the PR title as the commit message
4. This commit triggers semantic-release which determines version bumping:
   - `feat`: Minor version bump (1.2.3 → 1.3.0)
   - `fix`, `perf`, `revert`: Patch version bump (1.2.3 → 1.2.4)
   - `docs`, `style`, `refactor`, `test`, `build`, `ci`, `chore`: No release

## Pre-commit Validation

This repository enforces conventional commits through:
1. **PR Title Validation** (`.github/workflows/pr-check.yml`): Validates PR titles on open/edit
2. **Commit History Validation** (`.github/workflows/commitlint.yml`): Validates all commits in PR
3. **Branch Protection**: Main branch only accepts squash merges with validated PR titles

## Architecture Rules

This repository enforces architecture rules using `dependency-cruiser`. Always:
- Follow the established directory structure
- Respect module boundaries defined in `.dependency-cruiser.cjs`
- Run `npm run depcruise` to validate architecture compliance

## Best Practices for AI Agents

1. **Always suggest conventional commit format** for any commit message
2. **Use lowercase for subjects** (even though validation is disabled)
3. **Be specific in commit subjects** - clearly describe what changed
4. **Reference issues** in commit footers when fixing bugs
5. **Mark breaking changes** appropriately with `!` or `BREAKING CHANGE:`
6. **Follow existing code patterns** in the repository
7. **Validate architecture** with depcruise before suggesting structural changes
8. **Keep commits focused** - one logical change per commit

## Resources

- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [Commitlint Documentation](https://commitlint.js.org/)
- [Quick Reference: Commit Convention](../COMMIT_CONVENTION.md) - Condensed format guide
- Repository-specific documentation:
  - [PIPELINE.md](../../PIPELINE.md) - Release pipeline details
  - [ARCHITECTURE.md](../../ARCHITECTURE.md) - Architecture guidelines
  - [CONTRIBUTING.md](../../CONTRIBUTING.md) - Contribution guidelines

## Validation

Before submitting changes:
1. Ensure commit messages follow conventional format
2. Run `npm run lint` to validate commits locally
3. Run `npm run depcruise` to validate architecture
4. Run `npm run typecheck` to check TypeScript types
5. Run `npm test` to ensure tests pass
