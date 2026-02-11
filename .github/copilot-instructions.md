# GitHub Copilot Instructions

Use `AI_AGENTS.md` as the primary guide for this repository.

## Copilot-specific Notes

- Keep code changes minimal and workspace-aware.
- Follow existing app script conventions in `apps/*`.
- Ensure proposed commit and PR titles follow Conventional Commits.
- Run repository validation checks before final output:
  - `npm run typecheck`
  - `npm test`
  - `npm run depcruise`
  - `npm run commitlint`

For detailed architecture, workflow, and CI expectations, defer to `AI_AGENTS.md` and `CONTRIBUTING.md`.
