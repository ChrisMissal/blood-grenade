#!/bin/bash
set -euo pipefail

RULESET_FILE="${RULESET_FILE:-infra/rulesets.json}"

if ! command -v gh &> /dev/null; then
  echo "❌ Error: GitHub CLI (gh) is not installed" >&2
  exit 1
fi

if ! command -v jq &> /dev/null; then
  echo "❌ Error: jq is required" >&2
  exit 1
fi

if ! gh auth status &> /dev/null; then
  echo "❌ Error: Not authenticated with GitHub CLI" >&2
  echo "Run: gh auth login" >&2
  exit 1
fi

if [[ -z "${REPO:-}" ]]; then
  REPO="$(gh repo view --json nameWithOwner -q .nameWithOwner)"
fi

ADMIN_CHECK=$(gh api repos/"$REPO" -q '.permissions.admin')
if [[ "$ADMIN_CHECK" != "true" ]]; then
  echo "❌ Error: gh is authenticated but lacks admin permissions for $REPO" >&2
  exit 1
fi

if [[ ! -f "$RULESET_FILE" ]]; then
  echo "❌ Error: $RULESET_FILE not found" >&2
  exit 1
fi

DESIRED_RULESETS=$(jq '.rulesets' "$RULESET_FILE")
CURRENT_RULESETS=$(gh api --paginate repos/"$REPO"/rulesets)

normalize_rulesets() {
  jq 'map({name, target, enforcement, conditions, rules, bypass_actors}) | sort_by(.name)'
}

desired_normalized=$(echo "$DESIRED_RULESETS" | normalize_rulesets)
current_normalized=$(echo "$CURRENT_RULESETS" | normalize_rulesets)

if [[ "$desired_normalized" == "$current_normalized" ]]; then
  echo "✅ Rulesets already match desired state."
  exit 0
fi

echo "🔍 Reconciling rulesets for $REPO"

existing_names=$(echo "$CURRENT_RULESETS" | jq -r '.[].name')

echo "$DESIRED_RULESETS" | jq -c '.[]' | while read -r ruleset; do
  name=$(echo "$ruleset" | jq -r '.name')
  existing=$(echo "$CURRENT_RULESETS" | jq -c --arg name "$name" '.[] | select(.name == $name)')

  if [[ -n "$existing" ]]; then
    ruleset_id=$(echo "$existing" | jq -r '.id')
    desired_compact=$(echo "$ruleset" | jq -c '.')
    current_compact=$(echo "$existing" | jq -c '{name, target, enforcement, conditions, rules, bypass_actors}')

    if [[ "$desired_compact" != "$current_compact" ]]; then
      echo "↻ Updating ruleset: $name"
      gh api --method PUT repos/"$REPO"/rulesets/"$ruleset_id" --input - <<< "$ruleset" >/dev/null
    else
      echo "✓ Ruleset up to date: $name"
    fi
  else
    echo "➕ Creating ruleset: $name"
    gh api --method POST repos/"$REPO"/rulesets --input - <<< "$ruleset" >/dev/null
  fi

done

for name in $existing_names; do
  if ! echo "$DESIRED_RULESETS" | jq -e --arg name "$name" '.[] | select(.name == $name)' >/dev/null; then
    ruleset_id=$(echo "$CURRENT_RULESETS" | jq -r ".[] | select(.name == \"$name\") | .id")
    echo "🗑 Removing unmanaged ruleset: $name"
    gh api --method DELETE repos/"$REPO"/rulesets/"$ruleset_id" >/dev/null
  fi
done

echo "✅ Rulesets reconciled."
