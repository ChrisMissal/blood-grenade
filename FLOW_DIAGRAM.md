# Release Pipeline Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DEVELOPMENT WORKFLOW                               │
└─────────────────────────────────────────────────────────────────────────────┘

    Developer                    GitHub PR                    Main Branch
        │                            │                             │
        │  1. Create feature branch  │                             │
        ├───────────────────────────>│                             │
        │                            │                             │
        │  2. Create PR with         │                             │
        │     conventional title     │                             │
        ├───────────────────────────>│                             │
        │                            │                             │
        │                            │  3. pr-check.yml runs       │
        │                            │     ✓ Validate PR title     │
        │                            │                             │
        │                            │  4. build.yml runs          │
        │                            │     ✓ Build packages        │
        │                            │     ✓ Run tests             │
        │                            │                             │
        │  5. Squash merge           │                             │
        │    (if checks pass)        │                             │
        ├───────────────────────────────────────────────────────>│
        │                            │                             │


┌─────────────────────────────────────────────────────────────────────────────┐
│                            RELEASE WORKFLOW                                  │
└─────────────────────────────────────────────────────────────────────────────┘

                Main Branch                Release Pipeline               Outputs
                     │                            │                          │
                     │  Push event                │                          │
                     ├───────────────────────────>│                          │
                     │                            │                          │
                     │                            │  1. release.yml runs     │
                     │                            │     ├─ Analyze commits   │
                     │                            │     ├─ Determine version │
                     │                            │     └─ Create tag        │
                     │                            │                          │
                     │                            │  2. Create Release       │
                     │                            ├─────────────────────────>│ vX.Y.Z tag
                     │                            │                          │ GitHub Release
                     │                            │                          │
                     │                            │  3. build.yml (called)   │
                     │                            │     ├─ Inject version    │
                     │                            │     ├─ Inject env=prod   │
                     │                            │     ├─ Build packages    │
                     │                            │     └─ Upload artifacts  │
                     │                            │                          │
                     │                            │  4. Publish to GHCR      │
                     │                            │     ├─ Build Docker      │
                     │                            │     └─ Push images       │
                     │                            ├─────────────────────────>│ ghcr.io/.../app:X.Y.Z
                     │                            │                          │ ghcr.io/.../app:latest


┌─────────────────────────────────────────────────────────────────────────────┐
│                          DEPLOYMENT WORKFLOW                                 │
└─────────────────────────────────────────────────────────────────────────────┘

     Operator              deploy.yml                 GHCR              Environment
        │                      │                        │                     │
        │  1. Trigger with     │                        │                     │
        │     tag + env        │                        │                     │
        ├─────────────────────>│                        │                     │
        │                      │                        │                     │
        │                      │  2. Validate tag       │                     │
        │                      │     ✓ Tag exists       │                     │
        │                      │                        │                     │
        │                      │  3. Pull image         │                     │
        │                      ├───────────────────────>│                     │
        │                      │<───────────────────────┤                     │
        │                      │  ghcr.io/.../app:X.Y.Z │                     │
        │                      │                        │                     │
        │                      │  4. Deploy             │                     │
        │                      ├───────────────────────────────────────────>│
        │                      │                        │                     │
        │                      │  5. Verify             │                     │
        │                      │     ✓ Health checks    │                     │
        │                      │                        │                     │


┌─────────────────────────────────────────────────────────────────────────────┐
│                          VERSION INJECTION                                   │
└─────────────────────────────────────────────────────────────────────────────┘

    Source Code                  Build Process              Built Artifact
         │                            │                           │
         │  export const             │                           │
         │  VERSION =                │  1. Read VERSION env      │
         │    '__VERSION__';         │  2. Read ENVIRONMENT env  │
         │                           │  3. Generate BUILD_TIME   │
         │  export const             │                           │
         │  ENVIRONMENT =            │  4. Replace placeholders  │
         │    '__ENVIRONMENT__';     │                           │
         │                           │                           │
         │  export const             │                           │  export const
         │  BUILD_TIME =             │                           │  VERSION = '1.2.3';
         │    '__BUILD_TIME__';      │                           │
         │                           │                           │  export const
         ├──────────────────────────>│──────────────────────────>│  ENVIRONMENT = 'production';
                                                                  │
                                                                  │  export const
                                                                  │  BUILD_TIME = '2024-02-07T12:00:00Z';


┌─────────────────────────────────────────────────────────────────────────────┐
│                        IMMUTABLE RELEASE CONCEPT                             │
└─────────────────────────────────────────────────────────────────────────────┘

    Commit to main → Semantic Release → Build with version → Tag + Publish
                                              │
                                              └─> IMMUTABLE
                                                  - Same inputs always
                                                  - Never rebuilt
                                                  - Reproducible
                                                  - Traceable

    Deploy → Pull specific tag → Run
                     │
                     └─> Always gets exact same artifact
```

## Key Points

1. **Single Source of Truth**: Main branch is the only deployable source
2. **One Build Per Version**: Each semantic version is built exactly once
3. **Tag-Based Deployments**: Always deploy by tag, never by branch
4. **Metadata Injection**: Version information embedded at build time
5. **Automated Versioning**: Semantic-release determines versions from commits
6. **Multiple Publishing**: GitHub Releases for visibility, GHCR for deployment
7. **Environment Protection**: Use GitHub Environments for approval gates
