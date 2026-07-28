# Task execution protocol

**Status:** Binding workflow  
**Owner:** Engineering lead  
**Reference when:** Starting any non-trivial task.  
**Agent obligation:** Produce evidence from each applicable phase. Internal
reasoning need not be exposed; decisions, risks, and verification must be.

## Phase 1: Frame

- Restate the requested outcome.
- Identify whether the task is read-only, documentation, implementation,
  release, or external operation.
- Name the authoritative requirements and affected business rules.
- Define what is explicitly out of scope.

## Phase 2: Inspect

- Check repository status and applicable instructions.
- Read affected code and tests before proposing structure.
- Search for existing patterns and ownership.
- Verify unstable SDK, service, legal, or platform facts against primary
  sources when they affect the design.
- Record blockers and user-owned overlapping changes.

## Phase 3: Plan

For multi-file work, define ordered, independently verifiable increments. At
most one increment should be in progress. Identify:

- expected files;
- public contract changes;
- data/security/UX risks;
- tests and runtime checks;
- rollback or safe fallback;
- documentation updates.

## Phase 4: Implement

- Start with the narrowest end-to-end slice.
- Keep domain logic pure and adapters thin.
- Preserve working behavior not named in the request.
- Avoid opportunistic refactors.
- Update tests with the behavior, not after it.
- Communicate material discoveries that change the plan.

## Phase 5: Verify

Run, as applicable:

1. Targeted unit tests.
2. Integration/contract tests.
3. Typecheck and lint.
4. Production build.
5. Browser flow on the target viewport/device.
6. Performance or privacy checks for critical paths.
7. Five-run demo rehearsal for release candidates.

If a check cannot run, state the exact reason and the remaining risk.

## Phase 6: Self-review

Use `pr-review-checklist.md`. Inspect the diff, not just the final files.
Remove debug code, accidental dependencies, stale comments, and hidden
simulation.

## Phase 7: Handoff

Lead with the outcome. Report:

- what changed;
- what was verified and how;
- what remains proposed, simulated, sandboxed, or blocked;
- important files;
- one highest-value next step.

Update `context/current-project-state.md` only with verified facts.
