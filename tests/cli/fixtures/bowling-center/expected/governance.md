# Governance

## Automation Rules
- Every stream update regenerates docs
- Nightly synthetic lane-scoring checks

## Source Control Rules
- Branch naming must follow transformation/<phase>
- Require reviewer from operations and product

## Quality Gates
- npm run typecheck
- npm test
- npm run depcruise
