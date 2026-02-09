# Entrypoints CLI

Command-line interface for managing applications, templates, and configuration across the monorepo.

**Alias:** `ep`

## Quick Start

```bash
# List all applications
ep list

# Sync configuration across all apps
ep sync

# Get help
ep help
```

## Available Commands

### `ep list`

List all available applications, templates, and their configuration status.

```bash
ep list                # Show apps with status
ep list --verbose      # Show detailed configuration
```

Shows:
- Application inventory
- Environment configuration status
- Type and description for each app
- Available templates

### `ep sync`

Synchronize environment and output configuration across all applications.

```bash
ep sync                # Apply sync to all apps
ep sync --dry-run      # Preview changes
ep sync --verbose      # Show detailed operations
```

Ensures:
- All apps have `dist/` directories
- All apps have `outputs/` directories  
- All apps have `env/` configuration directories
- All apps have `test/golden/` directories for test fixtures

## Planned Commands (TODO)

- **`ep create`** – Create a new app from template with full configuration
- **`ep validate`** – Validate all configurations and directory structures
- **`ep migrate`** – Migrate old app structure to new template format
- **`ep generate`** – Generate missing `.env` files from `.env.example` templates
- **`ep doctor`** – Check system health and detect configuration issues

## Error Handling

All commands implement graceful error handling:
- Clear error messages with context
- Exit codes for CI/CD integration
- Dry-run modes for preview before applying changes
- Verbose logging for debugging

## Integration

The entrypoints CLI integrates with:
- `/apps/*` – Application source code
- `/env` – Environment configuration templates
- `/templates` – Application and configuration templates (planned)
