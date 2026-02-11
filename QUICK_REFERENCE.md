# Quick Reference Guide

## Developer Cheat Sheet

### Creating a Pull Request

```bash
# 1. Create and checkout a feature branch
git checkout -b feat/my-feature

# 2. Make your changes and commit (any commit message format is OK)
git commit -m "wip: working on feature"
git commit -m "more changes"
git commit -m "fixes"

# 3. Push your branch
git push origin feat/my-feature

# 4. Create PR with CONVENTIONAL TITLE (important!)
# Title format: <type>: <description>
# Example: feat: add user authentication
```

### PR Title Format

**Format:** `<type>: <description starting with lowercase>`

**Types:**
- `feat:` - New feature (→ minor version bump)
- `fix:` - Bug fix (→ patch version bump)
- `docs:` - Documentation only (→ no release)
- `style:` - Code style/formatting (→ no release)
- `refactor:` - Code refactoring (→ no release)
- `perf:` - Performance improvement (→ patch version bump)
- `test:` - Adding/updating tests (→ no release)
- `build:` - Build system changes (→ no release)
- `ci:` - CI configuration changes (→ no release)
- `chore:` - Other changes (→ no release)

**Examples:**
- ✅ `feat: add user authentication`
- ✅ `fix: resolve memory leak in parser`
- ✅ `docs: update API documentation`
- ❌ `Add new feature` (missing type)
- ❌ `feat: Add feature` (uppercase description)

### Version Bumping

| Commit Type | Version Change | Example |
|-------------|----------------|---------|
| `feat:` | 1.2.3 → 1.3.0 | Minor bump |
| `fix:` | 1.2.3 → 1.2.4 | Patch bump |
| `feat!:` or `BREAKING CHANGE:` | 1.2.3 → 2.0.0 | Major bump |
| All others | No release | - |

### Deploying

```bash
# 1. Find the release tag you want to deploy
git tag -l
# or check: https://github.com/__PROJECT_NAME__/__PROJECT_NAME__/releases

# 2. Go to GitHub Actions
# https://github.com/__PROJECT_NAME__/__PROJECT_NAME__/actions/workflows/deploy.yml

# 3. Click "Run workflow"
# - Tag: v1.2.3
# - Environment: production

# 4. Or use GitHub CLI
gh workflow run deploy.yml -f tag=v1.2.3 -f environment=production
```

### Checking Build Status

```bash
# View PR checks
gh pr checks

# View workflow runs
gh run list

# View specific run
gh run view <run-id>

# Watch a running workflow
gh run watch
```

### Local Development

```bash
# Install dependencies (once per checkout)
npm install

# Run required quality gates
npm run typecheck
npm test
npm run depcruise
npm run commitlint

# Validate dependency architecture
npm run depcruise

# Build the hello-world app locally
cd apps/hello-world
VERSION="1.0.0-dev" ENVIRONMENT="local" npm run build

# Test the current app workspace
npm run test

# Build all apps
npm run build --workspaces

# Test all apps
npm run test --workspaces

# Generate dependency graph (requires graphviz)
npm run depcruise:graph
npm run depcruise:graph:archi
```

### Adding a New App

```bash
# 1. Create app directory
mkdir -p apps/my-app/src

# 2. Create package.json
cat > apps/my-app/package.json << 'EOF'
{
  "name": "@__PROJECT_NAME__/my-app",
  "version": "0.0.0-development",
  "scripts": {
    "build": "node build.js",
    "test": "node test.js"
  }
}
EOF

# 3. Create build script (see apps/hello-world/build.js for template)
# 4. Create source files with placeholders
# 5. Validate architecture: npm run depcruise
# 6. Update workflows if needed
```

### Adding Shared Packages

```bash
# 1. Create package directory
mkdir -p packages/my-package/src

# 2. Create package.json
cat > packages/my-package/package.json << 'EOF'
{
  "name": "@__PROJECT_NAME__/my-package",
  "version": "1.0.0",
  "main": "src/index.js",
  "type": "module"
}
EOF

# 3. Create source files
# 4. Validate architecture: npm run depcruise
# 5. Apps can now import: import { foo } from '@__PROJECT_NAME__/my-package'
```

### Troubleshooting

#### PR Check Failed: "Subject must not start with uppercase"
**Fix:** Make sure description starts with lowercase
```
feat: Add feature  →  feat: add feature
```

#### No Release Created After Merge
**Reason:** Commit type doesn't trigger a release
- Only `feat:`, `fix:`, `perf:`, `revert:` trigger releases
- Check: Does your PR title use one of these types?

#### Deploy Failed: "Tag does not exist"
**Fix:** Ensure you're using the correct tag format
```bash
git tag -l  # List all tags
# Use format: v1.2.3 (with 'v' prefix)
```

#### Can't Find Docker Image in __CONTAINER_REGISTRY__
**Fix:** Check if release workflow succeeded
1. Go to Actions tab
2. Find "Release" workflow run
3. Check if "Publish Containers" job succeeded
4. Image URL: `__CONTAINER_REGISTRY__/__PROJECT_NAME__/hello-world:1.2.3`

#### Architecture Validation Failed
**Fix:** Review dependency rules (see ARCHITECTURE.md)
```bash
npm run depcruise  # Check for violations
```
Common issues:
- Apps importing from other apps (extract to packages/)
- Source files not in src/ directory
- Packages depending on apps

### Useful Commands

```bash
# View recent releases
gh release list

# View specific release
gh release view v1.2.3

# List workflow runs
gh run list --workflow=release.yml

# Cancel a running workflow
gh run cancel <run-id>

# Download build artifacts
gh run download <run-id>

# View workflow file
gh workflow view release.yml

# List repository secrets (names only)
gh secret list
```

### Environment Variables

**Build Metadata (set by build workflow):**
- `VERSION` - Semantic version (e.g., `1.2.3`)
- `ENVIRONMENT` - Target environment (e.g., `production`)

**Access in Code:**
```javascript
import { getAppInfo } from '@__PROJECT_NAME__/hello-world';

const { version, environment } = getAppInfo();
console.log(`Running ${version} in ${environment}`);
```

### Best Practices

1. ✅ Always use conventional commit format for PR titles
2. ✅ Squash merge PRs to keep main branch clean
3. ✅ Deploy specific tags, never deploy from branches
4. ✅ Let semantic-release handle versioning
5. ✅ Review auto-generated release notes before deployment
6. ✅ Use GitHub Environments for production protection
7. ✅ Never force-push to main branch
8. ✅ Run local checks before pushing (`typecheck`, `test`, `depcruise`, `commitlint`)
9. ✅ Validate architecture rules before committing (npm run depcruise)
10. ✅ Keep apps independent - use packages for shared code
11. ✅ Keep source code in src/ directories

### Links

- **Repository:** https://github.com/__PROJECT_NAME__/__PROJECT_NAME__
- **Actions:** https://github.com/__PROJECT_NAME__/__PROJECT_NAME__/actions
- **Releases:** https://github.com/__PROJECT_NAME__/__PROJECT_NAME__/releases
- **Packages:** https://github.com/__PROJECT_NAME__/__PROJECT_NAME__/packages
- **Full Documentation:** 
  - [PIPELINE.md](PIPELINE.md) - Release pipeline details
  - [ARCHITECTURE.md](ARCHITECTURE.md) - Dependency architecture rules
  - [TEMPLATE_SETUP.md](TEMPLATE_SETUP.md) - Initial setup guide
