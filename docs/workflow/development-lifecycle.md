# Development lifecycle

**Status:** Binding  
**Owner:** Engineering lead  
**Reference when:** Moving any change from idea to release.  
**Agent obligation:** Do not skip a gate because a change was AI-generated or
time-boxed.

## 1. Intake

- Confirm user outcome and authority.
- Link PRD requirement, decision, issue, or defect.
- Classify safety/privacy/rights risk.
- Choose the smallest applicable template.

## 2. Shape

- Define acceptance and non-goals.
- Map the user flow and recovery states.
- Identify business rules, module owner, data, integrations, and metrics.
- Create RFC/ADR only for material structural decisions.

## 3. Prove risky assumptions

Time-box unknowns such as pose support, hand tracking, audio timing, WeChat
channel, licence, or device performance. A spike produces evidence and a
decision; disposable code does not silently become production code.

## 4. Implement

- Branch from current main.
- Build one vertical slice.
- Add tests with behavior.
- Keep commits reviewable.
- Update documentation as the contract changes.

## 5. Verify

Run targeted checks during development and the full applicable quality gate
before review. Use the real browser and demo device for critical flows.

## 6. Review

Self-review the diff, then seek human/peer review appropriate to risk. Health
claims, consent, movement safety, rights, and external messaging require named
review.

## 7. Integrate

Merge only green, current changes. Delete the short-lived branch after merge.
No direct production release is implied by merge.

## 8. Release

Build an immutable version, run release checks, deploy with rollback ready,
smoke as a signed-out user, and record evidence.

## 9. Learn

Update current state, known issues, debt, metrics, and retrospectives. A failed
assumption should improve a rule or test, not remain oral history.
