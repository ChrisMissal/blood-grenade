# AI Agent Playbook

This repository supports multiple AI coding agents (Codex, GitHub Copilot, Claude, and similar tools).
Use this playbook as the single source of truth for how agents should explore, modify, and validate changes.

## Supported Agent Entry Points

- **Codex / OpenAI coding agents**: see `AGENTS.md` (root).
- **GitHub Copilot coding agent**: see `.github/copilot-instructions.md`.
- **Claude Code**: see `CLAUDE.md`.
- **Other agents**: follow this file and `CONTRIBUTING.md`.

When instructions conflict, use this precedence order:
1. System/developer/user task instructions
2. Repository safety/build constraints from CI workflows
3. This playbook and agent-specific instruction files
4. General assumptions

## Repository Snapshot

- Monorepo with npm workspaces (`apps/*`, `entrypoints`).
- Primary language/runtime: JavaScript on Node.js (ESM modules).
- Main quality gates:
  - Conventional commit / PR title checks
  - Workspace build + tests
  - Type checks
  - Architecture checks via dependency-cruiser

## Fast, Reliable Workflow for Agents

1. **Install dependencies first**
   ```bash
   npm install
   ```
2. **Understand where to change code**
   - App code: `apps/<app-name>/src`
   - Entry CLI tooling: `entrypoints/src`
   - CI and policy constraints: `.github/workflows`
   - Architecture rules: `.dependency-cruiser.cjs`
3. **Make focused changes**
   - Keep edits scoped to one concern.
   - Preserve existing script conventions (`build.js`, `test.js`, etc.).
4. **Run targeted checks first, then full checks when needed**
   ```bash
   npm run typecheck
   npm test
   npm run depcruise
   npm run commitlint
   ```
5. **Prepare final commit/PR metadata in conventional commit format**
   - Example: `docs(ai): add cross-agent operating playbook`

## Build, Test, and Validation Commands

From repository root:

```bash
npm install
npm run build
npm test
npm run typecheck
npm run depcruise
npm run commitlint
npm run depcheck
```

Notes:
- `npm run build` and `npm test` execute workspace scripts.
- Use `npm run <script> --workspaces --if-present` style only when adding optional scripts.
- If a change affects workflows, update docs in the same PR (see `.github/workflows/README.md`).

## File and Architecture Conventions

- Keep new executable app logic in `apps/<name>/src/index.js`.
- Keep app-level automation scripts consistent with existing patterns:
  - `build.js`, `test.js`, `commitlint.js`, `typecheck.js`, `depcheck.js`, `package.js`, `tag.js`
- Do not bypass architecture boundaries enforced by dependency-cruiser.
- Keep template placeholders (`__PROJECT_NAME__`, etc.) unchanged unless the task is template bootstrap.

## CI Expectations Agents Must Respect

Before proposing completion, ensure your change would satisfy:

- `.github/workflows/pr-check.yml`
- `.github/workflows/commitlint.yml`
- `.github/workflows/build.yml`
- `.github/workflows/release.yml`
- `.github/workflows/deploy.yml`

If app inventory changes (add/remove/rename app), update these docs/files in the same PR:
- `.github/workflows/README.md`
- `PIPELINE.md`
- Any workflow matrix referencing app names

## Prompting and Change Hygiene Best Practices

- Prefer small, reviewable diffs over broad rewrites.
- Explicitly list assumptions in PR body for unclear requirements.
- When introducing new scripts or commands, document them in `README.md` or `CONTRIBUTING.md`.
- Never fabricate test outcomes; report exact command status.
- If a command fails due to environment limitations, report the failure and mitigation path.

## Commit and PR Format (Required)

Use Conventional Commits:

```text
<type>(<scope>): <subject>
```

Examples:
- `feat(task-runner): add task retry endpoint`
- `fix(web-app): handle invalid port value`
- `docs(ai): document agent operating standards`

PR titles must also use this format because squash-merge uses the PR title as the final commit message.

## Minimal Discovery Guidance for Agents

Always check these files early to reduce unnecessary searching:

1. `README.md`
2. `CONTRIBUTING.md`
3. `ARCHITECTURE.md`
4. `PIPELINE.md`
5. `.github/workflows/README.md`
6. `.github/copilot-instructions.md`

If these files are complete for your task, prefer acting directly instead of broad repository scans.
