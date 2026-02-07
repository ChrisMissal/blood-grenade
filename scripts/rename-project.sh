#!/bin/bash
set -euo pipefail

PROJECT_NAME="${1:-}"
CONTAINER_REGISTRY="${2:-ghcr.io}"
DEFAULT_ENVIRONMENTS="${3:-development, staging, production}"

if [[ -z "$PROJECT_NAME" ]]; then
  echo "Usage: $0 <project-name> [container-registry] [default-environments]"
  echo "Example: $0 my-repo ghcr.io \"development, staging, production\""
  exit 1
fi

ROOT_DIR=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
export PROJECT_NAME CONTAINER_REGISTRY DEFAULT_ENVIRONMENTS ROOT_DIR

python3 - <<'PY'
import os
import pathlib
import sys

root = pathlib.Path(os.environ["ROOT_DIR"])
project = os.environ["PROJECT_NAME"]
registry = os.environ["CONTAINER_REGISTRY"]
envs = os.environ["DEFAULT_ENVIRONMENTS"]

if not project:
    print("Project name is required.")
    sys.exit(1)

placeholders = {
    "__PROJECT_NAME__": project,
    "__CONTAINER_REGISTRY__": registry,
    "__DEFAULT_ENVIRONMENTS__": envs,
}

excluded = {".git", "node_modules"}

for path in root.rglob("*"):
    if any(part in excluded for part in path.parts):
        continue
    if path.is_dir():
        continue
    try:
        content = path.read_text(encoding="utf-8")
    except (UnicodeDecodeError, OSError):
        continue
    updated = content
    for key, value in placeholders.items():
        updated = updated.replace(key, value)
    if updated != content:
        path.write_text(updated, encoding="utf-8")

print("✅ Replaced template placeholders.")
PY

echo "Done. Review changes and commit when ready."
