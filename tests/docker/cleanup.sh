#!/bin/bash
# Idempotent cleanup for docker integration tests
set -e
cd "$(dirname "$0")"

docker compose down --remove-orphans || true
# Remove any stopped containers matching test patterns
docker rm -f tests_task-runner_1 tests_web-app_1 tests_web-jobs_1 2>/dev/null || true
# Remove test network if exists
docker network rm tests_default 2>/dev/null || true
