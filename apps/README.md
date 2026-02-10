# Apps Directory Guide

This folder contains independently deployable applications in this monorepo.

## Why this folder exists

Each app under `apps/` is intended to be:
- independently buildable and testable,
- independently releasable,
- structurally consistent with the monorepo template.

For architecture constraints, see [ARCHITECTURE.md](../ARCHITECTURE.md).

## App Index

| App | What it is | Primary interface |
| --- | --- | --- |
| [`hello-world`](./hello-world) | Small console app used as a starter/template reference | CLI stdout |
| [`daemon`](./daemon) | Long-running process template with health payload helpers | Process lifecycle/logging |
| [`web-app`](./web-app) | Minimal HTTP JSON service | REST endpoints |
| [`web-jobs`](./web-jobs) | HTTP service with in-memory background job queue | REST endpoints + async job processing |
| [`task-runner`](./task-runner) | HTTP API + browser UI for task definition and execution simulation | Web UI + REST endpoints |

## Common app shape

Most apps include:
- `src/index.js` – entrypoint and exported helpers,
- `build.js`, `test.js`, `lint.js`, `typecheck.js`, `depcheck.js` – automation scripts,
- `Dockerfile` – container packaging,
- `package.json` + `tsconfig.json` – local app config.

## Abstract systems (Automatons)

This repository also models reusable **automaton concepts** that can be applied across apps.

### Core system templates

- **Container Automaton**: Packaging + runtime boundary for a service process.
  - Typical artifacts: `Dockerfile`, startup entrypoint, health endpoint/function.
- **Proxy Automaton**: Request/command mediator between caller and target system.
  - Typical responsibilities: routing, validation, translation, policy enforcement.
- **Worker/Queue Automaton**: Asynchronous task processor.
  - Typical responsibilities: queueing, status transitions, completion recording.

### Behavioral templates

- **Self-heal**: Detect unhealthy state and recover automatically.
- **Self-configure**: Derive startup/runtime settings from environment and metadata.
- **Self-optimize**: Improve throughput/latency/resource usage during operation.

### Concrete instances in this repo

- `web-app`: container-style HTTP service baseline.
- `web-jobs`: worker/queue automaton instance.
- `task-runner`: proxy-like API/UI surface orchestrating task execution.
- `daemon`: long-running process baseline for lifecycle automation patterns.

## Missing/related concepts to document next

Potential next docs that would help contributors:
1. **Shared API contract style guide** (status codes, error body shape, pagination).
2. **Environment variable catalog by app** (required vs optional vars).
3. **Persistence strategy notes** (what is in-memory vs durable).
4. **Operational runbooks** (startup/shutdown, health expectations, troubleshooting).
5. **Security model notes** (authn/authz, CORS posture, secrets handling).
