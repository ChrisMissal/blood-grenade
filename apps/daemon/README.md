# daemon App Guide

## Purpose

`daemon` is a long-running service template. It currently focuses on:
- startup logging,
- health payload construction helpers,
- graceful shutdown signal handling (`SIGTERM`, `SIGINT`).

## Key files

- `src/index.js` – exports app metadata helpers and contains daemon lifecycle logic.
- `test.js` – validates exported behavior.
- `build.js` / `version.js` – build and metadata stamping.

## Runtime behavior (high level)

- On start: logs version/environment information.
- On shutdown signal: logs graceful shutdown intent.
- Exposes helper functions (`getAppInfo`, `createHealthResponse`) for consistency with other apps.

## Automaton framing

- **System role**: Container Automaton (long-running process container boundary).
- **Behavioral potential**:
  - **Self-heal**: restart/recover loops and heartbeat checks.
  - **Self-configure**: environment-driven runtime profile selection.
  - **Self-optimize**: adaptive work-cycle pacing based on load.

## Missing/related concepts to document next

- **Process supervision expectations** (systemd/k8s/containers).
- **Background loop pattern guidance** (retry strategy, backoff, cancellation).
- **Observability conventions** (structured logs, metrics, traces).
