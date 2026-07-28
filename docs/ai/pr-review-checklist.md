# Pull request and self-review checklist

**Status:** Binding review gate  
**Owner:** Engineering lead  
**Reference when:** Before handoff, merge, or release.  
**Agent obligation:** Review for defects and risk. Do not substitute a prose
summary for inspection.

## Correctness

- [ ] Acceptance criteria are demonstrably met.
- [ ] Boundary cases and non-happy states are covered.
- [ ] Time, async, retries, cancellation, and duplicate events behave
  deterministically.
- [ ] Expected failures use typed results and actionable user recovery.
- [ ] No stale closure, race, or out-of-order update can corrupt a session.

## Product and safety

- [ ] Fun score, measures, and trends remain separate.
- [ ] No medical overclaim or alarmist copy was introduced.
- [ ] Consent and revocation are preserved.
- [ ] Simulated data cannot be mistaken for real data.
- [ ] Movement and accessibility constraints are met.

## Architecture

- [ ] Dependencies point inward.
- [ ] SDK types stop at adapters.
- [ ] Business logic is not duplicated in UI, storage, or transport code.
- [ ] New abstractions have at least one concrete need and clear ownership.
- [ ] No catch-all utility or service module was created.

## Data and security

- [ ] Input is validated at the boundary.
- [ ] Raw camera/audio media is not stored, logged, or transmitted.
- [ ] Sensitive fields are minimized.
- [ ] Secrets and environment values are absent from client bundles and diffs.
- [ ] Notification calls are consented, scoped, idempotent, and auditable.

## UX

- [ ] One primary action is obvious.
- [ ] Permission, loading, partial, error, and recovery states exist.
- [ ] Keyboard, screen-reader, contrast, caption, and reduced-motion behavior
  are considered.
- [ ] Simplified Chinese copy is adult, direct, and non-medical.

## Tests and operations

- [ ] Tests fail for the old behavior and pass for the new behavior.
- [ ] No test was weakened without a documented correction.
- [ ] Performance budgets were measured where affected.
- [ ] Logging is useful and privacy-safe.
- [ ] Rollback or disable path is documented.
- [ ] Current-state and decision docs are updated.

Review findings should name file, line, severity, user impact, and a concrete
fix. If there are no findings, say so and list residual risks.
