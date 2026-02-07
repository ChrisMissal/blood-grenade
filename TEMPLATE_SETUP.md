# Template Setup Guide

Use this checklist after cloning the template to make the repository production-ready.

## 1) Replace Template Placeholders

Replace the placeholders across the repo (or run the helper script):

```bash
./scripts/rename-project.sh "__PROJECT_NAME__" "__CONTAINER_REGISTRY__" "__DEFAULT_ENVIRONMENTS__"
```

**Placeholders:**
- `__PROJECT_NAME__`: Repository name or product name.
- `__CONTAINER_REGISTRY__`: Container registry hostname (default is `ghcr.io`).
- `__DEFAULT_ENVIRONMENTS__`: Comma-separated list for documentation and workflow defaults.

## 2) Required Secrets

The workflows rely on GitHub-provided tokens by default:

- **`GITHUB_TOKEN`** (automatically provided by GitHub Actions)

If you run `scripts/setup-github.sh` locally with the GitHub CLI, authenticate with:

```bash
gh auth login
```

Or set `GITHUB_TOKEN`/`GH_TOKEN` with admin permissions.

## 3) Required Branch Protection & Rulesets

Run the setup script to apply all protections and naming rules:

```bash
./scripts/setup-github.sh
```

This configures:
- Branch protection on `main`
- Required PR approvals and status checks
- Squash-only merges
- Branch naming rulesets

## 4) How to Run the Setup Script

```bash
./scripts/setup-github.sh
```

Optional: target a specific repo if your local checkout differs:

```bash
REPO=owner/name ./scripts/setup-github.sh
```

## 5) First Release

1. Create a feature branch and open a PR with a conventional title (e.g., `feat: add initial feature`).
2. Squash-merge the PR into `main`.
3. The **Release** workflow runs on `main` and creates the first semantic version tag.
4. Verify the release in GitHub Releases and the container image in __CONTAINER_REGISTRY__.

If you need to trigger a release without a code change, add a small `feat:` commit and merge via PR.
