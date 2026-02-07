# Platform Operations Guide

This repository is designed to be an elite, reusable DevOps template for monorepos. It focuses on policy-as-code, release safety, immutable artifacts, and GitOps-friendly environments.

## Release Model

- Releases are created from `main` by semantic-release.
- The release workflow performs a dry-run plan, validates tag uniqueness, then publishes.
- Container images are built and published per service (`api`, `web`, `worker`) using the same semantic version.

## Immutability Guarantees

- Release tags must be unique; the workflow fails if the tag already exists.
- Container publishing checks for existing tags in GHCR before pushing.
- Rebuilding or overwriting an existing version is blocked to preserve immutability.

## Policy Enforcement

- Repository rulesets are defined in `infra/rulesets.json` and applied with `scripts/apply-rulesets.sh`.
- The main branch requires PR reviews and required status checks.
- Branch naming patterns are enforced with a regex ruleset.

## Drift Detection

- Workflow `Policy Drift Detection` runs on a schedule and on manual dispatch.
- Drift is detected by comparing live rulesets to `infra/rulesets.json`.
- If drift is found, the workflow fails and instructs to run `./scripts/apply-rulesets.sh`.

## GitOps Flow

- Environment branches exist as `env/dev`, `env/staging`, and `env/prod`.
- Deployments update the environment branch pointer to the release tag SHA.
- The deploy workflow fails if the release tag does not exist.

## Recovery Procedures

### Ruleset Recovery
1. Ensure you have admin permissions.
2. Re-apply rulesets:
   ```bash
   ./scripts/apply-rulesets.sh
   ```

### Release Recovery
1. If a tag was created incorrectly, delete the tag and release in GitHub.
2. Re-run the release workflow from `main` after verifying commit history.

### Container Recovery
1. If a container publish failed, inspect GHCR for partial versions.
2. Do **not** overwrite existing tags.
3. Re-run the release after incrementing the version via semantic-release.

### GitOps Environment Recovery
1. Find the correct tag SHA:
   ```bash
   git show <tag>
   ```
2. Move the environment branch pointer:
   ```bash
   gh api repos/<owner>/<repo>/git/refs/heads/env/<env> --method PATCH --field sha=<sha> --field force=true
   ```

## Template Updates

- Template version is tracked in `TEMPLATE_VERSION`.
- Downstream repos set `TEMPLATE_SOURCE` (repository variable) for the update check workflow.
- To pull template updates:
  ```bash
  ./scripts/update-template.sh <owner/repo>
  ```
