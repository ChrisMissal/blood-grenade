#!/bin/bash
set -euo pipefail

TEMPLATE_SOURCE="${1:-${TEMPLATE_SOURCE:-}}"
TEMPLATE_BRANCH="${TEMPLATE_BRANCH:-main}"
REMOTE_NAME="${TEMPLATE_REMOTE:-template}"

if [[ -z "$TEMPLATE_SOURCE" ]]; then
  echo "Usage: ./scripts/update-template.sh <owner/repo>" >&2
  echo "Or set TEMPLATE_SOURCE environment variable." >&2
  exit 1
fi

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "❌ Working tree is dirty. Commit or stash changes before updating." >&2
  exit 1
fi

if ! git remote get-url "$REMOTE_NAME" >/dev/null 2>&1; then
  git remote add "$REMOTE_NAME" "https://github.com/$TEMPLATE_SOURCE.git"
fi

git fetch "$REMOTE_NAME" "$TEMPLATE_BRANCH"

REMOTE_VERSION=$(git show "$REMOTE_NAME"/"$TEMPLATE_BRANCH":TEMPLATE_VERSION 2>/dev/null | tr -d '\n' || true)
if [[ -z "$REMOTE_VERSION" ]]; then
  echo "❌ Unable to read TEMPLATE_VERSION from $TEMPLATE_SOURCE" >&2
  exit 1
fi

BRANCH_NAME="update/template-${REMOTE_VERSION}"

git checkout -b "$BRANCH_NAME"

git merge --no-ff "$REMOTE_NAME"/"$TEMPLATE_BRANCH" -m "chore: merge template updates (${REMOTE_VERSION})"

echo "✅ Template updates merged into $BRANCH_NAME"
cat <<SUMMARY

Next steps:
  - Review the changes: git status
  - Run tests as needed
  - Push the branch: git push -u origin "$BRANCH_NAME"
  - Open a PR for review
SUMMARY
