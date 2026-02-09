# Dependency Architecture Rules

This project uses [dependency-cruiser](https://github.com/sverweij/dependency-cruiser) to enforce architectural boundaries and maintain a clean dependency structure across the monorepo.

## Quick Start

```bash
# Validate dependency rules
npm run depcruise

# Generate dependency graph (requires graphviz)
npm run depcruise:graph

# Generate architecture diagram (requires graphviz)
npm run depcruise:graph:archi
```

## Directory Structure

The monorepo is organized to support multiple apps, shared packages, and environment-specific configurations:

```
__PROJECT_NAME__/
├── apps/              # Independent applications
│   ├── example/       # Example app
│   │   ├── src/       # Source code (required)
│   │   ├── build.js   # Build script
│   │   ├── test.js    # Test script
│   │   └── package.json
│   └── [other-apps]/  # Additional apps follow same structure
├── packages/          # Shared packages/libraries
│   └── [shared-code]/ # Reusable code consumed by apps
├── scripts/           # Repository utility scripts
└── infra/             # Infrastructure and deployment configs
```

## Architecture Rules

### 1. App Independence (`no-cross-app-dependencies`)

**Rule**: Apps cannot depend on each other.

**Why**: Each app should be independently deployable and maintainable. Cross-app dependencies create tight coupling and deployment complexity.

**Solution**: If apps need to share code, extract it into a package in the `packages/` directory.

```javascript
// ❌ BAD: App depending on another app
import { greet } from '../../other-app/src/utils';

// ✅ GOOD: App depending on shared package
import { greet } from '@project/shared-utils';
```

### 2. Source Organization (`apps-only-from-src`)

**Rule**: App source code must be in the `src/` directory. Only build scripts, tests, configs, and Dockerfiles are allowed at the app root.

**Why**: Consistent structure makes the codebase easier to navigate and understand.

**Allowed at app root**:
- `src/` directory (required)
- `build.js` - Build script
- `test.js` - Test script
- `Dockerfile` - Container definition
- `package.json` - Package manifest

```
apps/my-app/
├── src/           ✅ Source code here
│   ├── index.js
│   └── lib/
├── build.js       ✅ Build script allowed
├── test.js        ✅ Test script allowed
├── Dockerfile     ✅ Dockerfile allowed
├── package.json   ✅ Package manifest allowed
└── utils.js       ❌ Source files must be in src/
```

### 3. Package Direction (`no-packages-to-apps`)

**Rule**: Packages cannot depend on apps.

**Why**: Packages should be reusable and app-agnostic. If a package depends on an app, it's no longer reusable.

```javascript
// ❌ BAD: Package importing from app
// packages/shared-utils/index.js
import { config } from '../../apps/example/src/config';

// ✅ GOOD: Package is self-contained
// packages/shared-utils/index.js
export function formatDate(date) { /* ... */ }
```

### 4. Test Isolation (`no-test-imports-in-production`)

**Rule**: Production code cannot import from test files.

**Why**: Test utilities and mocks should not leak into production code.

```javascript
// ❌ BAD: Production code importing test utility
import { mockUser } from './user.test.js';

// ✅ GOOD: Test utilities in separate directory if needed
import { createTestUser } from './test-utils/factories.js';
```

### 5. Circular Dependencies (`no-circular`)

**Rule**: No circular dependencies allowed.

**Why**: Circular dependencies indicate poor module design and can cause initialization issues.

```javascript
// ❌ BAD: Circular dependency
// a.js
import { b } from './b.js';

// b.js
import { a } from './a.js';

// ✅ GOOD: Break the cycle with dependency inversion
// a.js
export function a() { /* ... */ }

// b.js
export function b() { /* ... */ }

// c.js - uses both
import { a } from './a.js';
import { b } from './b.js';
```

### 6. Dependency Management

Additional rules enforced:

- **no-deprecated-core**: Don't use deprecated Node.js core modules
- **not-to-deprecated**: Don't use deprecated npm packages
- **no-non-package-json**: All npm dependencies must be in package.json
- **not-to-unresolvable**: All imports must be resolvable
- **no-duplicate-dep-types**: Don't list packages in both dependencies and devDependencies

## Adding New Apps

When adding a new app to the monorepo:

1. Create the app directory structure:
   ```bash
   mkdir -p apps/my-new-app/src
   ```

2. Follow the required structure:
   ```
   apps/my-new-app/
   ├── src/
   │   └── index.js
   ├── build.js
   ├── test.js
   ├── package.json
   └── Dockerfile (optional)
   ```

3. Validate the structure:
   ```bash
   npm run depcruise
   ```

## Adding Shared Packages

When creating shared code:

1. Create the package directory:
   ```bash
   mkdir -p packages/my-package/src
   ```

2. Add package.json:
   ```json
   {
     "name": "@project/my-package",
     "version": "1.0.0",
     "main": "src/index.js",
     "type": "module"
   }
   ```

3. Ensure packages don't depend on apps:
   - ✅ Packages can depend on other packages
   - ✅ Apps can depend on packages
   - ❌ Packages cannot depend on apps

## CI Integration

To integrate dependency validation into CI/CD:

Add to `.github/workflows/build.yml` or similar:

```yaml
- name: Validate Dependencies
  run: npm run depcruise
```

This ensures all pull requests are validated against the architecture rules.

## Configuration

The dependency rules are defined in `.dependency-cruiser.cjs`. To modify rules:

1. Edit `.dependency-cruiser.cjs`
2. Test your changes: `npm run depcruise`
3. Commit the updated configuration

For more information on configuration options, see the [dependency-cruiser documentation](https://github.com/sverweij/dependency-cruiser).

## Troubleshooting

### Error: "This module depends on an npm package that isn't in the dependencies"

**Solution**: Add the missing package to your `package.json`:
```bash
npm install --save <package-name>
```

### Error: "Apps should be independent and not depend on each other"

**Solution**: Extract shared code into a package:
1. Create a new package in `packages/`
2. Move the shared code there
3. Import from the package instead

### Error: "App source code should be in the src/ directory"

**Solution**: Move source files into the `src/` directory:
```bash
mkdir -p apps/my-app/src
mv apps/my-app/*.js apps/my-app/src/
# Keep build.js, test.js, and package.json at root
mv apps/my-app/src/build.js apps/my-app/
mv apps/my-app/src/test.js apps/my-app/
mv apps/my-app/src/package.json apps/my-app/
```

## Benefits

Following these architecture rules provides:

1. **Scalability**: Easy to add new apps and packages without affecting existing code
2. **Maintainability**: Clear boundaries make the codebase easier to understand
3. **Testability**: Isolated apps and packages are easier to test
4. **Deployment**: Independent apps can be deployed separately
5. **Reusability**: Shared packages can be used across multiple apps
6. **Team Collaboration**: Clear structure reduces conflicts and confusion
