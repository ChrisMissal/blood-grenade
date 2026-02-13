# Integrations Boundary

Integration adapters live outside core inspection models and contracts.

- `apps/cli/src/domain` and `apps/cli/src/application` remain vendor-agnostic.
- Vendor/system-specific implementations belong under `apps/cli/src/integrations/*`.
- This top-level folder documents current and future integration namespaces.
