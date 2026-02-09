# Archetype Auditor

Archetype Auditor is a TypeScript CLI that scans selected packages in a monorepo, extracts exported types, and classifies them into architectural layers:

- **Core**: generic reusable logic.
- **Domain**: application/game-specific logic.
- **Application**: orchestration, handlers, workflows, and commands.

It also reports cross-layer dependency issues (core importing domain/application, domain importing application) and produces a Markdown report you can check into CI.

## CLI usage

From this folder:

```bash
npm install
npm run audit
```

You can also run with custom paths:

```bash
npm run start -- --config config/archetype-auditor.config.json --output reports/archetype-auditor.md
```

## Config

`config/archetype-auditor.config.json` controls:

- `scanDirs`: directories to scan for `.ts`/`.tsx` files.
- `layerRoots`: path prefixes that define core/domain/application.
- `layerImportPrefixes`: optional import prefixes to resolve non-relative imports (for monorepo aliases).
- `domainKeywords`: optional name-based words that classify exports as domain.
- `applicationSuffixes`: name suffixes that classify exports as application.
- `ignoreDirs`: directory names to skip when scanning.
- `reportTitle`: title string used in the Markdown output.

## Extending

- Add new heuristics in `src/archetypeAuditor.ts` (for example: naming conventions, decorators, or folder conventions).
- Extend `layerImportPrefixes` if you use scoped package imports (e.g., `@my-org/domain`).
- Add scripts in `package.json` for CI (e.g., `npm run audit -- --output reports/audit.md`).

## Example workflow

```bash
# From repository root
cd tools/archetype-auditor
npm install
npm run audit
```

This produces `report.md` with the summary, categorized exports, and cross-layer dependency findings.
