# Commit Message Quick Reference

## Format

```
<type>(<scope>): <subject>
```

## Types

| Type | Description | Release |
|------|-------------|---------|
| `feat` | New feature | Minor bump (1.2.3 → 1.3.0) |
| `fix` | Bug fix | Patch bump (1.2.3 → 1.2.4) |
| `docs` | Documentation only | No release |
| `style` | Code style (formatting, etc.) | No release |
| `refactor` | Code refactoring | No release |
| `perf` | Performance improvement | Patch bump (1.2.3 → 1.2.4) |
| `test` | Adding/updating tests | No release |
| `build` | Build system changes | No release |
| `ci` | CI configuration changes | No release |
| `chore` | Other changes | No release |
| `revert` | Revert previous commit | Patch bump (1.2.3 → 1.2.4) |

## Subject Rules

- ✅ Start with **lowercase**
- ✅ Use **imperative mood** ("add" not "added")
- ✅ Be **concise** (≤50 characters)
- ❌ No **period** at the end

## Examples

### Good ✅

```
feat: add user authentication
fix: resolve memory leak in parser
docs: update installation guide
refactor(auth): simplify login logic
perf: optimize database queries
feat!: redesign authentication API
```

### Bad ❌

```
Add feature              → Missing type
feat: Add feature        → Uppercase subject
Fixed a bug              → Missing type, wrong tense
feat: add new feature.   → Period at end
update code              → Missing type, unclear
```

## Breaking Changes

Use `!` after type or add `BREAKING CHANGE:` in footer:

```
feat!: redesign API
```

or

```
feat: redesign API

BREAKING CHANGE: All endpoints now require authentication.
```

## Scopes (Optional)

Examples: `api`, `ui`, `auth`, `db`, `docs`

```
feat(api): add user endpoint
fix(auth): correct token validation
docs(readme): update installation steps
```

## Full Example

```
feat(auth): add OAuth2 authentication

Implements OAuth2 authentication flow with support for
Google and GitHub providers. Users can now log in using
their existing accounts.

Closes #123
```

## Resources

- Full guide: [CONTRIBUTING.md](../CONTRIBUTING.md)
- Specification: [conventionalcommits.org](https://www.conventionalcommits.org/)
- Repository commitlint config: [commitlint.config.cjs](../commitlint.config.cjs)
