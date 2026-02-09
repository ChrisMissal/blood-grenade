# Environment Configuration

This directory contains environment-specific configuration templates for all applications in the monorepo.

## Directory Structure

```
env/
├── local/      # Local development environment
├── dev/        # Development/integration environment
├── test/       # Test/staging environment
└── prod/       # Production environment
```

## Usage

### Local Development

1. Copy the example file for your environment:
   ```bash
   cp env/local/.env.example .env
   ```

2. Update the values in `.env` with your local configuration

3. The `.env` file is gitignored and will not be committed

### CI/CD Deployments

Environment variables for deployed environments (dev, test, prod) should be:

1. **Stored in secure secret management systems**:
   - Azure Key Vault
   - AWS Secrets Manager
   - GitHub Secrets
   - HashiCorp Vault

2. **Injected at runtime** via:
   - Container orchestration (Kubernetes secrets)
   - Platform environment variables (Azure App Service, AWS ECS)
   - CI/CD pipeline secret injection

3. **Never committed to version control**

## Build Metadata

The following variables are automatically injected during the build process:

- `VERSION` - From package.json or git tags
- `ENVIRONMENT` - Build target environment
- `BUILD_TIME` - ISO 8601 timestamp of build

These are replaced in source code via the build.js script in each app.

## Environment Variables by App

### hello-world (Console App)
Minimal environment variables needed:
- `VERSION`, `ENVIRONMENT`, `BUILD_TIME` (auto-injected)

### web-app (HTTP Server)
Additional variables:
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Node environment
- `LOG_LEVEL` - Logging verbosity

### web-jobs (HTTP + Background Jobs)
All web-app variables plus:
- Job processing configuration
- Queue/Redis connection if using external queue
- Worker pool sizing

## Security Best Practices

1. ✅ **DO**: Use `.env.example` files as templates
2. ✅ **DO**: Store secrets in secret management systems
3. ✅ **DO**: Use different secrets for each environment
4. ✅ **DO**: Rotate secrets regularly
5. ✅ **DO**: Use strong, randomly generated secrets

6. ❌ **DON'T**: Commit `.env` files with actual secrets
7. ❌ **DON'T**: Share production secrets via email/chat
8. ❌ **DON'T**: Use the same secrets across environments
9. ❌ **DON'T**: Hardcode secrets in source code
10. ❌ **DON'T**: Log sensitive environment variables

## Adding New Variables

When adding new environment variables:

1. Update all relevant `.env.example` files
2. Document the variable purpose and format
3. Update this README if it's a significant change
4. Update app documentation if needed
5. Ensure CI/CD pipelines are updated with the new secrets

## Validation

Each app should validate required environment variables at startup and fail fast with clear error messages if configuration is invalid.

Example:
```javascript
const requiredVars = ['DATABASE_URL', 'JWT_SECRET'];
for (const varName of requiredVars) {
  if (!process.env[varName]) {
    console.error(`Missing required environment variable: ${varName}`);
    process.exit(1);
  }
}
```
