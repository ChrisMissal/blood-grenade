#!/bin/bash
set -euo pipefail

# Setup GitHub repository configuration using GitHub CLI
# This script configures branch protection and rulesets for the current repository
#
# Prerequisites:
# - GitHub CLI (gh) installed and authenticated
# - Admin permissions on the repository
#
# Usage:
#   ./scripts/setup-github.sh

# Check if gh is installed
if ! command -v gh &> /dev/null; then
    echo "❌ Error: GitHub CLI (gh) is not installed"
    echo "Install it from: https://cli.github.com/"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Error: Not authenticated with GitHub CLI"
    echo "Run: gh auth login"
    exit 1
fi

if [[ -z "${REPO:-}" ]]; then
  REPO="$(gh repo view --json nameWithOwner -q .nameWithOwner)"
fi

echo "=========================================="
echo "Setting up GitHub configuration for $REPO"
echo "=========================================="

echo ""
echo "Step 1: Enforcing squash merge only"
echo "------------------------------------"

# Configure repository settings to allow only squash merge
gh api repos/"$REPO" \
  --method PATCH \
  --silent \
  --field allow_squash_merge=true \
  --field allow_merge_commit=false \
  --field allow_rebase_merge=false \
  && echo "✅ Squash merge enforced (merge commits and rebase disabled)" \
  || echo "⚠️  Failed to configure merge settings"

echo ""
echo "Step 2: Applying repository rulesets"
echo "-------------------------------------"

./scripts/apply-rulesets.sh

echo ""
echo "Step 3: Creating GitOps environment branches"
echo "--------------------------------------------"

BASE_SHA=$(gh api repos/"$REPO"/git/ref/heads/main -q .object.sha)
for env_branch in env/dev env/staging env/prod; do
  if gh api repos/"$REPO"/git/ref/heads/"$env_branch" >/dev/null 2>&1; then
    echo "✓ Branch already exists: $env_branch"
  else
    gh api repos/"$REPO"/git/refs --method POST --field ref="refs/heads/$env_branch" --field sha="$BASE_SHA" >/dev/null
    echo "✅ Created branch: $env_branch"
  fi
done

echo ""
echo "=========================================="
echo "GitHub configuration complete!"
echo "=========================================="
echo ""
echo "Configuration Summary:"
echo "  ✓ Rulesets applied from infra/rulesets.json"
echo "  ✓ Squash merge only (no merge commits or rebase)"
echo "  ✓ 1 approval required"
echo "  ✓ GitOps environment branches: env/dev, env/staging, env/prod"
echo ""
echo "You can verify the configuration at:"
echo "  https://github.com/$REPO/settings/branches"
echo "  https://github.com/$REPO/settings/rules"
echo ""
