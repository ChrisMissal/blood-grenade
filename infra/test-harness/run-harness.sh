#!/bin/bash
set -euo pipefail

if ! command -v gh &> /dev/null; then
  echo "❌ Error: GitHub CLI (gh) is required" >&2
  exit 1
fi

if ! command -v jq &> /dev/null; then
  echo "❌ Error: jq is required" >&2
  exit 1
fi

if ! gh auth status &> /dev/null; then
  echo "❌ Error: Not authenticated with GitHub CLI" >&2
  exit 1
fi

if [[ -z "${REPO:-}" ]]; then
  REPO="$(gh repo view --json nameWithOwner -q .nameWithOwner)"
fi

echo "🔍 Running policy enforcement harness for $REPO"

RULESETS=$(gh api --paginate repos/"$REPO"/rulesets)

main_ruleset=$(echo "$RULESETS" | jq -c '.[] | select(.name == "main-branch-protection")')
name_ruleset=$(echo "$RULESETS" | jq -c '.[] | select(.name == "branch-name-policy")')

failures=0

if [[ -z "$name_ruleset" ]]; then
  echo "❌ Missing branch-name-policy ruleset (invalid branch push rejection)."
  failures=$((failures + 1))
else
  if echo "$name_ruleset" | jq -e '.rules[] | select(.type == "branch_name_pattern")' >/dev/null; then
    echo "✅ Branch name enforcement present (invalid branch push rejection)."
  else
    echo "❌ Branch name pattern rule missing (invalid branch push rejection)."
    failures=$((failures + 1))
  fi
fi

if [[ -z "$main_ruleset" ]]; then
  echo "❌ Missing main-branch-protection ruleset (missing PR rejection)."
  failures=$((failures + 1))
else
  if echo "$main_ruleset" | jq -e '.rules[] | select(.type == "pull_request")' >/dev/null; then
    echo "✅ Pull request requirement present (missing PR rejection)."
  else
    echo "❌ Pull request requirement missing (missing PR rejection)."
    failures=$((failures + 1))
  fi

  required_checks=$(echo "$main_ruleset" | jq -r '.rules[] | select(.type == "required_status_checks") | .parameters.required_checks[].context')
  if echo "$required_checks" | grep -Fxq "Validate All Commits" && echo "$required_checks" | grep -Fxq "Validate Conventional Commits"; then
    echo "✅ Commit message checks required (invalid commit message rejection)."
  else
    echo "❌ Commit message checks missing (invalid commit message rejection)."
    failures=$((failures + 1))
  fi
fi

if [[ "$failures" -gt 0 ]]; then
  echo "❌ Enforcement harness failed with $failures issue(s)."
  exit 1
fi

echo "✅ Enforcement harness passed."
