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
echo "Step 1: Configuring branch protection for 'main'"
echo "------------------------------------------------"

# Configure branch protection for main
gh api repos/"$REPO"/branches/main/protection \
  --method PUT \
  --silent \
  --field required_status_checks[strict]=true \
  --field required_status_checks[contexts][]=Validate\ Conventional\ Commits \
  --field required_status_checks[contexts][]=Validate\ All\ Commits \
  --field required_status_checks[contexts][]=Build\ Example\ App \
  --field required_pull_request_reviews[required_approving_review_count]=1 \
  --field required_pull_request_reviews[dismiss_stale_reviews]=true \
  --field required_pull_request_reviews[require_code_owner_reviews]=false \
  --field enforce_admins=true \
  --field restrictions=null \
  --field required_linear_history=false \
  --field allow_force_pushes=false \
  --field allow_deletions=false \
  --field required_conversation_resolution=true \
  && echo "✅ Branch protection configured for 'main'" \
  || echo "⚠️  Failed to configure branch protection (may require admin permissions)"

echo ""
echo "Step 2: Enforcing squash merge only"
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
echo "Step 3: Creating branch name ruleset"
echo "-------------------------------------"

# Create a ruleset for allowed branch patterns
RULESET_JSON=$(cat <<'EOF'
{
  "name": "Branch naming convention",
  "target": "branch",
  "enforcement": "active",
  "conditions": {
    "ref_name": {
      "include": [
        "refs/heads/main",
        "refs/heads/feat/*",
        "refs/heads/fix/*",
        "refs/heads/docs/*",
        "refs/heads/chore/*",
        "refs/heads/refactor/*",
        "refs/heads/test/*",
        "refs/heads/ci/*",
        "refs/heads/perf/*",
        "refs/heads/build/*",
        "refs/heads/style/*",
        "refs/heads/revert/*",
        "refs/heads/releases/*"
      ],
      "exclude": []
    }
  },
  "rules": [
    {
      "type": "creation"
    },
    {
      "type": "update"
    },
    {
      "type": "deletion"
    }
  ],
  "bypass_actors": []
}
EOF
)

# Try to create the ruleset
if gh api repos/"$REPO"/rulesets \
  --method POST \
  --silent \
  --input - <<< "$RULESET_JSON" 2>/dev/null; then
    echo "✅ Branch naming ruleset created"
else
    echo "⚠️  Could not create ruleset (may already exist or require permissions)"
fi

echo ""
echo "Step 4: Restricting direct pushes to main"
echo "------------------------------------------"

# Note: Direct push restriction is already handled by branch protection
# requiring pull requests. This is just a confirmation message.
echo "✅ Direct pushes to 'main' are restricted (enforced by branch protection)"

echo ""
echo "=========================================="
echo "GitHub configuration complete!"
echo "=========================================="
echo ""
echo "Configuration Summary:"
echo "  ✓ Branch protection on 'main' with required PR"
echo "  ✓ Squash merge only (no merge commits or rebase)"
echo "  ✓ Required status checks:"
echo "    - Validate Conventional Commits"
echo "    - Validate All Commits"
echo "    - Build Example App"
echo "  ✓ 1 approval required"
echo "  ✓ Stale review dismissal enabled"
echo "  ✓ Conversation resolution required"
echo "  ✓ Direct pushes to main blocked"
echo "  ✓ Force pushes and deletions blocked"
echo "  ✓ Branch naming ruleset applied"
echo ""
echo "You can verify the configuration at:"
echo "  https://github.com/$REPO/settings/branches"
echo "  https://github.com/$REPO/settings/rules"
echo ""
