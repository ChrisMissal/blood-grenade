# hello-world App Guide

## Purpose

`hello-world` is the smallest reference app in the repo. It demonstrates:
- build-time version/environment injection,
- exported app helpers,
- a main entrypoint that prints structured startup output.

## Key files

- `src/index.js` – exports `getAppInfo()` and `greet()`, and runs the CLI flow.
- `test.js` – basic behavior checks and golden output verification.
- `test/golden/console-output.txt` – expected console output snapshot.
- `build.js` / `version.js` – build and metadata versioning helpers.

## Runtime behavior (high level)

When run, the app prints:
1. a greeting line containing version and environment,
2. a short app info block.

No HTTP server is started in this app.

## Automaton framing

- **System role**: Minimal Behavior Automaton reference.
- Serves as a baseline for introducing:
  - **Self-configure** through injected build/runtime metadata,
  - **Self-heal** via process lifecycle hooks when expanded,
  - **Self-optimize** via runtime tuning once workload is introduced.

## Missing/related concepts to document next

- How this app should be used as a **copy template** when creating a new app.
- A short **testing golden-files guide** (when to update snapshots).
- A **release metadata flow** diagram showing where `__VERSION__` and `__ENVIRONMENT__` are injected.
