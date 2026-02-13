# Transformation Overview
Current State: On-prem lane management and POS
Target State: Cloud-managed bowling center platform
Current Phase: convergence

# Active Streams
## Lane Control Modernization
- Description: Replace lane controllers with centrally managed edge services
- Owner: Operations Engineering
- Milestones checklist:
  - [x] Pilot 8-lane cluster
  - [~] Cross-center failover
  - [ ] Legacy hardware decommission

## Booking and Payments
- Description: Unify online booking, kiosk, and front desk payments
- Owner: Commerce Team
- Milestones checklist:
  - [x] Payment tokenization
  - [~] Tournament booking workflow

## Center Insights
- Description: Introduce analytics for lane utilization and snack bar sales
- Owner: Data Platform
- Milestones checklist:
  - [ ] Data contracts approved
  - [ ] Daily executive dashboard

## Operational Runbooks
- Description: Standardize incident runbooks for scoring outages
- Owner: Site Reliability
- Milestones checklist:
  - [x] Runbook templates published
  - [x] Quarterly game-day drill

# Governance Rules
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

# Convergence Criteria
- All active streams have no remaining `todo` milestones.
- Quality gates pass for stream-related repositories.
- Governance rules are applied consistently across stream branches.

# Checklist Summary
- Streams completed: 1/4
- Milestones completed: 4/9
- Remaining blockers: 5
  - Lane Control Modernization: Cross-center failover
  - Lane Control Modernization: Legacy hardware decommission
  - Booking and Payments: Tournament booking workflow
  - Center Insights: Data contracts approved
  - Center Insights: Daily executive dashboard
