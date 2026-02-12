#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CLI_PATH="$ROOT_DIR/apps/cli/dist/index.js"

PASS_COUNT=0
FAIL_COUNT=0
FAILED_TESTS=()

log() {
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "$1"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

run_test() {
  local name="$1"
  shift

  echo "▶ $name"
  if "$@"; then
    echo "✔ PASS: $name"
    PASS_COUNT=$((PASS_COUNT + 1))
  else
    echo "✘ FAIL: $name"
    FAIL_COUNT=$((FAIL_COUNT + 1))
    FAILED_TESTS+=("$name")
  fi
  echo ""
}

summary() {
  echo ""
  echo "===================================="
  echo "TEST SUMMARY"
  echo "===================================="
  echo "Passed: $PASS_COUNT"
  echo "Failed: $FAIL_COUNT"

  if [ "$FAIL_COUNT" -ne 0 ]; then
    echo ""
    echo "Failed Tests:"
    for test in "${FAILED_TESTS[@]}"; do
      echo " - $test"
    done
    exit 1
  fi
}

log "Building CLI"
run_test "CLI build" npm run build --workspace=@project/cli

log "Checking CLI entry exists"
run_test "CLI binary exists" test -f "$CLI_PATH"

log "Testing CLI Help"
run_test "repo --help" node "$CLI_PATH" --help

log "Testing Core Commands"

CORE_COMMANDS=(
  build
  test
  typecheck
  depcruise
)

for cmd in "${CORE_COMMANDS[@]}"; do
  run_test "repo $cmd" node "$CLI_PATH" "$cmd"
done

log "Validating Workspace Apps"

for app in "$ROOT_DIR"/apps/*; do
  if [ -d "$app" ]; then
    APP_NAME=$(basename "$app")
    echo "→ Checking app: $APP_NAME"

    if [ -f "$app/package.json" ]; then
      run_test "$APP_NAME - package.json exists" test -f "$app/package.json"
    fi

    if grep -q "\"build\"" "$app/package.json"; then
      run_test "$APP_NAME - build script" npm run build --workspace="$APP_NAME"
    fi

    if grep -q "\"test\"" "$app/package.json"; then
      run_test "$APP_NAME - test script" npm run test --workspace="$APP_NAME"
    fi

    if grep -q "\"typecheck\"" "$app/package.json"; then
      run_test "$APP_NAME - typecheck script" npm run typecheck --workspace="$APP_NAME"
    fi

    echo ""
  fi
done

summary
