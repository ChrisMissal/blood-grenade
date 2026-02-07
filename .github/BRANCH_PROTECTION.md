# Branch Protection Configuration
# 
# This file documents the recommended branch protection settings.
# Apply these settings in GitHub: Settings → Branches → Branch protection rules
#
# Note: This requires repository admin permissions to configure.

## Branch: main

### Pull Request Requirements
- ✓ Require a pull request before merging
- ✓ Require approvals: 1 (recommended)
- ✓ Dismiss stale pull request approvals when new commits are pushed
- ✓ Require review from Code Owners (if CODEOWNERS file exists)

### Status Checks
- ✓ Require status checks to pass before merging
- ✓ Require branches to be up to date before merging
- Required checks:
  - `Validate Conventional Commits` (from pr-check.yml)
  - `Build Packages` (from build.yml)

### Merge Methods
- ✓ Allow squash merging (ONLY)
- ✗ Allow merge commits (DISABLED)
- ✗ Allow rebase merging (DISABLED)

### Additional Rules
- ✓ Require conversation resolution before merging
- ✓ Require signed commits (optional but recommended)
- ✓ Do not allow bypassing the above settings
- ✗ Allow force pushes (DISABLED)
- ✗ Allow deletions (DISABLED)

## Applying via GitHub CLI

```bash
# Enable branch protection (requires admin permissions)
gh api repos/:owner/:repo/branches/main/protection \
  --method PUT \
  --field required_status_checks[strict]=true \
  --field required_status_checks[contexts][]=Validate\ Conventional\ Commits \
  --field required_status_checks[contexts][]=Build\ Packages \
  --field enforce_admins=true \
  --field required_pull_request_reviews[required_approving_review_count]=1 \
  --field required_pull_request_reviews[dismiss_stale_reviews]=true \
  --field restrictions=null \
  --field allow_force_pushes=false \
  --field allow_deletions=false
```

## Applying via GitHub UI

1. Go to: https://github.com/ChrisMissal/blood-grenade/settings/branches
2. Click "Add branch protection rule"
3. Branch name pattern: `main`
4. Apply settings as documented above
5. Save changes
