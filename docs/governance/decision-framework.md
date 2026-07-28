# Decision framework

**Status:** Binding  
**Owner:** Project lead  
**Reference when:** A requirement, architecture, standard, or implementation
choice is ambiguous or contested.  
**Agent obligation:** Use the smallest decision mechanism that matches the
blast radius; do not create governance theatre for local choices.

## Decision classes

### Product

Changes user, scope, claim, safety, consent, priority, or acceptance.  
**Authority:** Product owner.  
**Record:** PRD or product decision log.

### Architecture

Changes dependency direction, runtime/provider, data boundary, deployment,
public contract, or cross-module pattern.  
**Authority:** Engineering owner with affected product/security review.  
**Record:** RFC for exploration, accepted ADR for decision.

### Local implementation

Reversible choice inside an accepted boundary.  
**Authority:** Change author/reviewer.  
**Record:** Code/tests; no ADR.

### Emergency

Temporary containment for active harm.  
**Authority:** Incident commander.  
**Record:** Incident timeline and follow-up decision.

## Decision criteria

In order:

1. Safety, consent, privacy, and rights.
2. Binding user outcome.
3. Correctness and failure containment.
4. Simplicity and reversibility.
5. Evidence from target environment.
6. Delivery schedule.
7. Extensibility with a known use.

## Required decision note

- Context and deadline.
- Options, including "do nothing."
- Evidence and unknowns.
- User/technical/operational risks.
- Decision and owner.
- Consequences and rollback.
- Documents/code affected.
- Revisit trigger.

## Conflict process

1. Name the conflicting clauses.
2. Apply authority order from `docs/README.md`.
3. Prefer the newer explicit owner decision at the same authority.
4. Record the resolution.
5. Update downstream docs; do not leave two active rules.
