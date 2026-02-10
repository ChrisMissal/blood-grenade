# web-app Guide

## Purpose

`web-app` is the minimal HTTP server template in this repository.

It demonstrates:
- native Node `http` server usage (no framework dependency),
- basic JSON endpoint routing,
- health/info metadata responses,
- graceful shutdown handling.

## Key files

- `src/index.js` – server creation, endpoint routing, startup/shutdown lifecycle.
- `test.js` – endpoint checks against golden responses.
- `test/golden/*.json` – expected API outputs.

## Endpoint summary

- `GET /` – service message + build metadata.
- `GET /health` – health response with timestamp.
- `GET /info` – app metadata.

## Automaton framing

- **System role**: Container Automaton (baseline HTTP service process).
- **Proxy relevance**: Can serve as a simple proxy façade pattern when upstream integrations are introduced.
- **Behavioral potential**:
  - **Self-heal**: health-check driven restarts and degraded-mode responses.
  - **Self-configure**: startup options derived from environment/runtime metadata.
  - **Self-optimize**: endpoint-level latency tuning and adaptive connection handling.

## Missing/related concepts to document next

- **HTTP API conventions** (error format, headers, versioning strategy).
- **Input validation policy** (schema checking and malformed payload handling).
- **Production hardening checklist** (timeouts, rate limits, observability).
