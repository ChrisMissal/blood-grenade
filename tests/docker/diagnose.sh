#!/bin/bash
# Diagnose container health and print logs for integration test containers
set -e
cd "$(dirname "$0")"

echo "\n==== docker compose ps -a ===="
docker compose ps -a || true

echo "\n==== docker compose logs (all) ===="
docker compose logs || true

for svc in task-runner web-app web-jobs; do
  cname="tests_${svc}_1"
  echo "\n==== $cname health status ===="
  docker inspect --format='{{json .State.Health}}' "$cname" 2>/dev/null || echo "No health info for $cname"
  echo "\n==== $cname logs ===="
  docker logs "$cname" 2>/dev/null || echo "No logs for $cname"
done
