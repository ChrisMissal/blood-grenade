# Workflow Expectations and Sample Alignment

This document explains how workflow expectations map to the current sample apps.

## Current sample apps

- `apps/daemon`
- `apps/hello-world`
- `apps/task-runner`
- `apps/web-app`
- `apps/web-jobs`

## Build and validation expectations

- Build all workspace apps:
  - `npm run build --workspaces`
- Validate samples via workspace tests:
  - `npm run test --workspaces --if-present`
- Validate architecture boundaries:
  - `npm run depcruise`
- Validate workspace type checks and dependency checks:
  - `npm run typecheck`
  - `npm run depcheck` (depcheck script alias for dependency-cruiser checks)

## Container publication/deployment expectations

Release and deploy workflows should target app directories that contain Dockerfiles.

Current service matrix:
- `daemon`
- `hello-world`
- `task-runner`
- `web-app`
- `web-jobs`

## When samples change

If an app is added, removed, or renamed, update these workflow files in the same PR:

1. `.github/workflows/build.yml`
2. `.github/workflows/release.yml`
3. `.github/workflows/deploy.yml`
4. `PIPELINE.md`

