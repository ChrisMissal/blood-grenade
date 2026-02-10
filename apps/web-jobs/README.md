# web-jobs Guide

## Purpose

`web-jobs` extends the basic web service pattern with an in-memory job queue.

It demonstrates:
- HTTP API for creating and querying jobs,
- periodic background processing,
- separation between pending queue and completed results.

## Key files

- `src/index.js` – queue state, processor loop, and API endpoints.
- `test.js` – endpoint and behavior checks.
- `test/golden/*.json` – expected response payload snapshots.

## Endpoint summary

- `GET /` – service metadata.
- `GET /health` – health payload.
- `GET /info` – app info.
- `GET /jobs` – list pending + completed jobs.
- `POST /jobs` – create a job (`type`, `data`).
- `GET /jobs/:id` – inspect a single job.

## Automaton framing

- **System role**: Worker/Queue Automaton (asynchronous processing template).
- **Proxy relevance**: HTTP endpoints act as queue control proxies for background work.
- **Behavioral potential**:
  - **Self-heal**: failed job requeue/retry policies.
  - **Self-configure**: processor cadence and limits from environment.
  - **Self-optimize**: dynamic batch size / parallelism based on queue pressure.

## Missing/related concepts to document next

- **Queue semantics** (ordering, retries, failure states, idempotency).
- **Durability model** (in-memory vs external queue/storage).
- **Concurrency and scaling notes** (single process vs distributed workers).
