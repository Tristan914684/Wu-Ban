# AI coding contract

**Status:** Binding  
**Owner:** Engineering lead  
**Reference when:** Before writing or changing application code.  
**Agent obligation:** Preserve these invariants and make deviations explicit in
an accepted ADR.

## Contract

Every change must be:

- **Necessary:** tied to an accepted requirement or defect.
- **Local:** changes the smallest coherent surface.
- **Readable:** names expose domain intent without explanatory archaeology.
- **Testable:** pure decisions are isolated from side effects.
- **Reversible:** migrations, integrations, and flags have a recovery path.
- **Observable:** failures provide privacy-safe diagnostic context.
- **Documented:** product state and contracts stay current.

## Layer rules

- Domain modules import no browser, UI, SDK, database, or transport code.
- Application use cases orchestrate domain rules through ports.
- Adapters translate camera, pose, storage, clock, audio, and notification APIs.
- UI renders state and emits user intent; it does not own scoring or trend
  formulas.
- Data validation occurs at every untrusted boundary.
- Simulation is injected as an adapter or fixture, never hidden inside
  production logic.

## Function and module rules

- Prefer pure functions for scoring, quality gates, chart validation, and trend
  calculations.
- One function should operate at one abstraction level.
- Avoid boolean parameter clusters; use named option objects or distinct
  operations.
- Return typed results for expected failure. Reserve exceptions for unexpected
  defects or adapter failures.
- Make time, random values, IDs, and external clients injectable.
- Keep public APIs small and explicit.
- Delete dead code rather than commenting it out.

## Change discipline

1. Identify the owner module and business-rule IDs.
2. Write or update the failing test.
3. Implement the smallest behavior.
4. Refactor only after the behavior passes.
5. Run relevant quality gates.
6. Update contracts, ADRs, and current state when applicable.

## Contract violations

Stop and seek a decision when a change would:

- send raw media beyond the camera boundary;
- make cloud connectivity mandatory for play;
- allow multiple trend owners;
- expose clinical inference;
- bypass consent or revocation;
- add a dependency or framework that changes the stack;
- change stored data without a migration and rollback plan.
