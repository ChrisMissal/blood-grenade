# task-runner Guide

## Purpose

`task-runner` provides a browser UI and HTTP API for defining and executing tasks.

Current behavior is simulation-oriented and demonstrates:
- task lifecycle management (`pending` → `running` → `completed`),
- progress and output streaming via polling,
- placeholder GitHub repository search/fetch integration,
- task execution scaffolding intended for Docker-backed commands.

## Key files

- `src/index.js` – task model, GitHub helpers, HTTP API, and static UI serving.
- `public/index.html` – single-page web interface.
- `test.js` – endpoint and flow checks.
- `test/golden/console-output.txt` – expected startup output.

## Endpoint summary

- `GET /` – serves the web UI.
- `GET /health` – health payload.
- `GET /info` – app metadata.
- `GET /api/tasks` – list tasks.
- `POST /api/tasks` – create task.
- `GET /api/tasks/:id` – fetch task details.
- `POST /api/tasks/:id/run` – start task run.
- `GET /api/tasks/:id/progress` – fetch current progress/output.
- `GET /api/github/repos?q=...` – search repositories (simulated).

## Automaton framing

- **System role**: Proxy + Worker-Orchestrator Automaton.
  - Proxy aspect: API/UI mediates user intent into executable task runs.
  - Orchestrator aspect: coordinates task state transitions and progress publication.
- **Container relevance**: designed as a containerized execution gateway pattern.
- **Behavioral potential**:
  - **Self-heal**: recover interrupted tasks and reconcile state.
  - **Self-configure**: execution profiles selected by environment/task type.
  - **Self-optimize**: adaptive polling intervals and scheduling based on load.

## Missing/related concepts to document next

- **Real execution model** (sandboxing/isolation/security for command execution).
- **GitHub integration contract** (auth, rate limits, repository permissions).
- **Task persistence** (store/history retention and cleanup policy).
- **UI state model** (polling strategy, failure UX, reconnect behavior).
