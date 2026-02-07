# Scripts

This directory contains automation scripts for managing the __PROJECT_NAME__ repository.

## Setup GitHub Configuration

**Script:** `setup-github.sh`

Configures GitHub repository settings including branch protection, merge restrictions, and branch naming rulesets.

### Prerequisites

- GitHub CLI (`gh`) installed and authenticated
- Repository admin permissions
- Active GitHub token with appropriate scopes

### Usage

```bash
# Run directly
./scripts/setup-github.sh

# Or with custom repository
REPO=myorg/myrepo ./scripts/setup-github.sh
```

### What it configures

1. **Branch Protection for `main`:**
   - Requires pull requests with 1 approval
   - Dismisses stale reviews on new commits
   - Requires status checks: "Validate Conventional Commits", "Validate All Commits", "Build Example App"
   - Requires conversation resolution
   - Blocks force pushes and deletions

2. **Merge Method Restrictions:**
   - Enables squash merge only
   - Disables merge commits
   - Disables rebase merging

3. **Branch Naming Rulesets:**
   - Enforces conventional commit prefixes: `feat/`, `fix/`, `docs/`, etc.
   - Allows `main`, `releases/*` branches
   - Rejects non-conformant branch names

4. **Direct Push Restrictions:**
   - Blocks direct pushes to `main` (via PR requirement)

## Test Branch Rules

**Script:** `test-branch-rules.sh`

Tests and validates branch protection rules and naming conventions without modifying the repository.

### Prerequisites

- GitHub CLI (`gh`) installed and authenticated
- `jq` for JSON processing (usually pre-installed)
- Read access to the repository

### Usage

```bash
# Run directly
./scripts/test-branch-rules.sh

# Run in a container (recommended for CI)
docker run --rm \
  -e GITHUB_TOKEN=$GITHUB_TOKEN \
  -v $(pwd):/workspace \
  -w /workspace \
  ghcr.io/cli/cli:latest \
  /workspace/scripts/test-branch-rules.sh

# Or with custom repository
REPO=myorg/myrepo ./scripts/test-branch-rules.sh
```

### What it tests

1. **Ruleset Configuration:**
   - Checks if rulesets exist
   - Lists configured rulesets

2. **Branch Pattern Validation:**
   - Tests valid branch names (feat/*, fix/*, etc.)
   - Tests invalid branch names
   - Confirms pattern matching

3. **Branch Protection:**
   - Verifies protection on `main`
   - Checks required status checks
   - Validates force push and deletion blocks

4. **Merge Method Restrictions:**
   - Confirms squash merge is enabled
   - Verifies merge commit is disabled
   - Verifies rebase merge is disabled

5. **Simulation:**
   - Simulates branch name validation
   - Reports pass/fail for test cases

### Exit Codes

- `0` - All tests passed
- `1` - Authentication or dependency error
- Tests report warnings (⚠️) for configuration issues but don't fail

## CI/CD Integration

Both scripts can be integrated into CI/CD pipelines:

### Setup Script in CI

```yaml
- name: Configure GitHub
  run: ./scripts/setup-github.sh
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Test Script in CI

```yaml
- name: Test Branch Rules
  run: ./scripts/test-branch-rules.sh
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Environment Variables

Both scripts support these environment variables:

- `GITHUB_TOKEN` - GitHub authentication token (required if not using `gh auth login`)
- `REPO` - Repository in `owner/name` format (defaults to the current repo via `gh repo view`)

## Rename Project

**Script:** `rename-project.sh`

Replaces template placeholders across the repository.

### Usage

```bash
./scripts/rename-project.sh \"my-project\" \"ghcr.io\" \"development, staging, production\"
```

**Placeholders replaced:**
- `__PROJECT_NAME__`
- `__CONTAINER_REGISTRY__`
- `__DEFAULT_ENVIRONMENTS__`

## Troubleshooting

### "gh: command not found"

Install GitHub CLI:
```bash
# macOS
brew install gh

# Linux (Debian/Ubuntu)
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh

# Or download from https://cli.github.com/
```

### "Not authenticated with GitHub CLI"

Authenticate using one of these methods:

```bash
# Interactive login
gh auth login

# Using token
export GITHUB_TOKEN=ghp_yourtoken
gh auth status
```

### "Failed to configure branch protection"

This usually means:
- You don't have admin permissions on the repository
- The repository doesn't exist or you mistyped the name
- Your token doesn't have the required scopes

Verify permissions:
```bash
gh api user/repos | jq '.[] | select(.full_name=="__PROJECT_NAME__/__PROJECT_NAME__") | .permissions'
```

### "Could not create ruleset"

Rulesets may already exist or require specific permissions. This is often just a warning and doesn't indicate failure.

Check existing rulesets:
```bash
gh api repos/__PROJECT_NAME__/__PROJECT_NAME__/rulesets | jq '.'
```

## Manual Verification

After running the setup script, verify the configuration:

1. **Branch Protection:**
   https://github.com/__PROJECT_NAME__/__PROJECT_NAME__/settings/branches

2. **Rulesets:**
   https://github.com/__PROJECT_NAME__/__PROJECT_NAME__/settings/rules

3. **General Settings:**
   https://github.com/__PROJECT_NAME__/__PROJECT_NAME__/settings

## Notes

- The setup script is idempotent - safe to run multiple times
- The test script is read-only - never modifies the repository
- Both scripts fail gracefully with informative error messages
- Warnings (⚠️) indicate potential issues but don't stop execution
