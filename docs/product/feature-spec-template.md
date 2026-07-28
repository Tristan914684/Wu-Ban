# Feature specification template

**Status:** Active template  
**Owner:** Product lead  
**Reference when:** Before implementing a non-trivial feature or behavior
change.  
**Agent obligation:** Complete the relevant sections; a vague feature title is
not implementation authority.

```md
# [Feature name]

**Status:** Proposed | Approved | Building | Verified | Released
**Owner:**
**Target milestone:**
**PRD requirements:**
**Business rules:**
**Related ADRs:**

## Outcome

One sentence describing the user-visible result.

## User and job

- User:
- Mode/frequency:
- Job:
- Risk:

## Problem evidence

What evidence shows this matters? Separate user evidence from assumptions.

## In scope

- ...

## Out of scope

- ...

## UX flow

Entry -> action -> feedback -> success

Recovery:

Required states: empty, loading, partial, permission, error, success,
long-running, revoked/invalid as applicable.

## Functional requirements

| ID | Requirement | Acceptance |
|---|---|---|

## Data and contracts

- Inputs:
- Outputs:
- Stored data:
- Retention/deletion:
- Simulated/test behavior:
- Versioning:

## Safety, privacy, and accessibility

- Consent:
- Threats:
- Claim boundary:
- Physical safety:
- WCAG/older-adult requirements:

## Architecture

- Owning modules:
- Ports/adapters:
- Dependency or ADR needs:
- Failure and cancellation:

## Metrics

- Outcome metric:
- Guardrail metric:
- Diagnostic metric:
- Prohibited inference:

## Test plan

- Unit:
- Contract:
- Component:
- Browser/device:
- Non-happy:

## Rollout and rollback

- Feature flag/config:
- Migration:
- Rollback:
- Observability:

## Documentation updates

- ...

## Open decisions

- ...
```
