# Monorepo Release Pipeline

This repository implements a complete monorepo release pipeline with immutable releases, conventional commits, and automated deployments.

## Architecture Overview

The pipeline is built around several key principles:

1. **Branch Protection**: Main branch is protected, only squash PRs allowed
2. **Conventional Commits**: All PRs must follow conventional commit format
3. **Semantic Versioning**: Automatic version bumping based on commit types
4. **Immutable Releases**: Each release creates a tagged, immutable artifact
5. **Automated Publishing**: GitHub Releases and container publishing
6. **Manual Deployments**: Tag-based deployments to specific environments
7. **Version Injection**: Build metadata embedded at build time

## Workflows

### 1. PR Check (`pr-check.yml`)

**Trigger**: On pull request (opened, edited, synchronize, reopened)

**Purpose**: Enforces conventional commit format on PR titles

**Requirements**:
- PR title must follow conventional commit format
- Supported types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`
- Subject must start with lowercase

**Example PR titles**:
- ✓ `feat: add user authentication`
- ✓ `fix: resolve memory leak in parser`
- ✓ `docs: update API documentation`
- ✗ `Add new feature` (no type)
- ✗ `feat: Add feature` (uppercase subject)

### 2. Build (`build.yml`)

**Trigger**: 
- Push to `main` or `releases/**` branches
- Pull requests to `main`
- Called by other workflows

**Purpose**: Builds apps with version and environment metadata injection

**Inputs** (when called as reusable workflow):
- `version`: Version to inject (default: `0.0.0-dev`)
- `environment`: Environment name (default: `development`)

**Outputs**:
- `artifact-name`: Name of the uploaded build artifact

**Steps**:
1. Setup Node.js environment
2. Validate dependency architecture
3. Run type checks and dependency checks
4. Inject build metadata (version, environment, build time)
5. Build all apps in `apps/` directory
6. Run app tests
7. Upload build artifacts

**Metadata Injection**:
```javascript
// Before build
export const VERSION = '__VERSION__';

// After build
export const VERSION = '1.2.3';
```

### 3. Release (`release.yml`)

**Trigger**: Push to `releases/**` branches

**Purpose**: Creates semantic releases with GitHub Releases and container publishing

**Flow**:
1. **Analyze Commits**: Uses semantic-release to determine next version
2. **Create Release**: Creates GitHub Release with release notes
3. **Update Changelog**: Appends entries to `CHANGELOG.md`
4. **Build Artifacts**: Builds with production metadata
5. **Publish Images**: Publishes Docker images to __CONTAINER_REGISTRY__

**Outputs**:
- Creates git tag (e.g., `v1.2.3`)
- Creates GitHub Release with notes
- Updates `CHANGELOG.md` in the release commit
- Publishes Docker image to __CONTAINER_REGISTRY__ with tags:
  - `__CONTAINER_REGISTRY__/owner/repo/hello-world:1.2.3`
  - `__CONTAINER_REGISTRY__/owner/repo/hello-world:1.2`
  - `__CONTAINER_REGISTRY__/owner/repo/hello-world:1`
  - `__CONTAINER_REGISTRY__/owner/repo/hello-world:latest`

**Version Bumping**:
- `feat`: Minor version bump (1.2.3 → 1.3.0)
- `fix`, `perf`, `revert`: Patch version bump (1.2.3 → 1.2.4)
- `docs`, `style`, `refactor`, `test`, `build`, `ci`, `chore`: No release

### 4. Deploy (`deploy.yml`)

**Trigger**: Manual workflow dispatch

**Purpose**: Deploy a specific tagged release to an environment

**Inputs**:
- `tag`: Release tag to deploy (e.g., `v1.0.0`)
- `environment`: Target environment (`development`, `staging`, `production`)

**Flow**:
1. **Validate Tag**: Ensures the tag exists
2. **Pull Image**: Pulls the Docker image for that version
3. **Deploy**: Simulates deployment (customize for your infrastructure)
4. **Verify**: Simulates health checks
5. **Record**: Logs deployment details

**Usage**:
```bash
# Via GitHub UI
Actions → Deploy → Run workflow
  Tag: v1.2.3
  Environment: production

# Via GitHub CLI
gh workflow run deploy.yml -f tag=v1.2.3 -f environment=production
```

## Monorepo Structure

```
__PROJECT_NAME__/
├── .github/
│   └── workflows/
│       ├── pr-check.yml      # PR validation
│       ├── build.yml         # Build with metadata
│       ├── release.yml       # Semantic release + publish
│       └── deploy.yml        # Manual deployment
├── apps/
│   └── hello-world/
│       ├── src/
│       │   └── index.js      # Source with placeholders
│       ├── dist/             # Built output (git-ignored)
│       ├── build.js          # Build script with injection
│       ├── test.js           # Test script
│       ├── package.json      # Package config
│       └── Dockerfile        # Container image
├── .releaserc.json           # Semantic-release config
├── .gitignore
└── README.md
```

## Branch Protection Setup

To fully enable this pipeline, configure branch protection for `main`:

1. Run the setup script: `./scripts/setup-github.sh`
2. Or configure manually for `main`:
   - ✓ Require a pull request before merging
   - ✓ Require approvals (recommended: 1)
   - ✓ Dismiss stale pull request approvals when new commits are pushed
   - ✓ Require status checks to pass before merging
     - Required checks: `Validate Conventional Commits`, `Validate All Commits`, `Build Hello-world App`
   - ✓ Require branches to be up to date before merging
   - ✓ Do not allow bypassing the above settings
   - ✓ Allow squash commits (ONLY)
   - ✗ Allow merge commits
   - ✗ Allow rebase merging

## Development Workflow

### Making Changes

1. **Create feature branch**:
   ```bash
   git checkout -b feat/my-feature
   ```

2. **Make changes and commit** (commits can be messy):
   ```bash
   git add .
   git commit -m "wip: working on feature"
   ```

3. **Create PR with conventional title**:
   ```
   Title: feat: add user authentication
   ```

4. **PR checks run**:
   - Conventional commit format validated
   - Build runs
   - Tests run

5. **Squash merge to main**:
   - PR is squashed into a single commit
   - Commit message uses PR title (conventional format)

6. **Automatic release** (if applicable):
   - Semantic-release analyzes commit
   - Version is bumped
   - Release is created
   - Artifacts are published

### Deploying

1. **Find release tag**:
   ```bash
   git tag -l
   # or check GitHub Releases
   ```

2. **Deploy via GitHub Actions**:
   - Go to Actions → Deploy → Run workflow
   - Enter tag (e.g., `v1.2.3`)
   - Select environment
   - Run workflow

## Adding New Apps

To add a new package to the monorepo:

1. **Create app directory**:
   ```bash
   mkdir -p apps/my-app/src
   ```

2. **Add package.json**:
   ```json
   {
     "name": "@__PROJECT_NAME__/my-app",
     "version": "0.0.0-development",
     "scripts": {
       "build": "node build.js",
       "test": "node test.js"
     }
   }
   ```

3. **Add build script** with metadata injection (see `apps/hello-world/build.js`)

4. **Add Dockerfile** if publishing to __CONTAINER_REGISTRY__

5. **Update workflows** to include new package

## Immutable Releases

Each release is immutable and traceable:

- **Git Tag**: Immutable reference to exact code state
- **GitHub Release**: Permanent release notes and metadata
- **Docker Images**: Tagged with semantic version
- **Build Artifacts**: Stored for 30 days with unique names

**No Rebuilds**: Once a version is released, it cannot be rebuilt or modified. To fix issues, release a new version.

## Environment Variables

### Build Metadata

- `VERSION`: Semantic version (e.g., `1.2.3`)
- `ENVIRONMENT`: Target environment (e.g., `production`)

### Runtime

Access injected metadata:

```javascript
import { getAppInfo } from '@__PROJECT_NAME__/example';

const info = getAppInfo();
console.log(info.version);      // "1.2.3"
console.log(info.environment);  // "production"
```

## Troubleshooting

### PR Check Fails

**Error**: "Subject must not start with an uppercase character"
**Fix**: Change PR title to start with lowercase after the type
```
feat: Add feature  →  feat: add feature
```

### Release Not Created

**Cause**: No releasable commits since last release
**Check**: Ensure commits are `feat`, `fix`, `perf`, or `revert` type
**Note**: Commits like `docs`, `chore`, `refactor` don't trigger releases

### Deployment Fails

**Error**: "Tag does not exist"
**Fix**: Ensure you're using the correct tag format (e.g., `v1.2.3`)
**Check**: Run `git tag -l` or check GitHub Releases

### Image Not Found in __CONTAINER_REGISTRY__

**Cause**: Release workflow may have failed
**Fix**: Check Actions tab for failed workflows
**Check**: Ensure repository visibility allows __CONTAINER_REGISTRY__ packages

## Best Practices

1. **PR Titles**: Always use conventional commit format
2. **Squash Merges**: Keep main branch history clean
3. **Breaking Changes**: Use `feat!:` or `fix!:` for breaking changes
4. **Release Notes**: They're auto-generated from commit messages
5. **Deploy Tags**: Only deploy tagged releases, never branches
6. **Test Before Merge**: Ensure PR checks pass before merging
7. **Version Management**: Let semantic-release handle versioning

## License

MIT
