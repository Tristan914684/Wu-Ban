# Definition of done

**Status:** Binding completion gate  
**Owner:** Engineering lead  
**Reference when:** Before marking a task or milestone complete.  
**Agent obligation:** Satisfy every applicable item or report the item as an
explicit unresolved gate.

## Any repository change

- [ ] Requested outcome is met without unrelated scope.
- [ ] Working-tree changes were reviewed.
- [ ] No user-owned changes were overwritten.
- [ ] Relevant business rules and ADRs are preserved.
- [ ] New behavior has appropriate tests.
- [ ] Applicable checks passed in the current worktree.
- [ ] Errors and non-happy states are handled.
- [ ] Secrets, raw media, and sensitive data are absent from logs and commits.
- [ ] Documentation and current-state facts are current.

## Feature

- [ ] Feature spec has acceptance criteria and non-goals.
- [ ] One vertical path works end to end.
- [ ] Empty, loading, permission, error, partial, and success states are covered
  where relevant.
- [ ] Accessibility and reduced-motion behavior are verified.
- [ ] Analytics measure outcomes without collecting unnecessary sensitive data.
- [ ] Rollback or disable path is known.

## Camera/gameplay

- [ ] Audio clock drives cues.
- [ ] Uncertain frames are unscoreable, not misses.
- [ ] Tracking-loss recovery works.
- [ ] Raw frames are neither stored nor transmitted.
- [ ] Target-device latency and inference rate are measured.
- [ ] Synthetic fallback is visibly labelled.

## Trend/sharing

- [ ] Invalid and excluded sessions cannot update trends.
- [ ] Simulated data remains segregated and labelled.
- [ ] Consent, revocation, recipient scope, and duplicate suppression are tested.
- [ ] Copy stays non-diagnostic and explains uncertainty.
- [ ] Test/sandbox delivery is not described as production rollout.

## Documentation-only work

- [ ] Files are navigable and cross-linked.
- [ ] Rules state status, owner, when to reference, and agent obligation.
- [ ] Proposed requirements are not described as existing enforcement.
- [ ] Internal links and file inventory pass validation.

## Completion vocabulary

Use exactly:

- **Documented** - contract exists.
- **Implemented** - code exists.
- **Verified locally** - current checks passed.
- **Verified on demo device** - target hardware flow passed.
- **Sandbox verified** - external test environment succeeded.
- **Deployed** - production URL/version exists.
- **Received** - intended external recipient confirmed delivery.
