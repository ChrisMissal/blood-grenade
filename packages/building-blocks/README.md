# building-blocks (Legacy)

This directory contains sample/legacy utilities for orchestration and endpoint testing. All new features should use the abstractions in `packages/core/container.ts`.

## Deprecated Utilities
- `composeConfigBuilder.js`: Compose config builder for sample apps.
- `dockerComposeRunner.js`: Docker Compose runner for sample apps.
- `endpointTester.js`: Endpoint tester for sample apps.
- `endpoints.config.js`: Sample endpoint config for legacy/test apps.

## Migration
These utilities will be removed as advanced features are implemented. Please migrate to the new Container/App abstractions for all new code.
