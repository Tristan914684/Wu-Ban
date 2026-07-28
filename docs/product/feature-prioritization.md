# Feature prioritization

**Status:** Binding scope method  
**Owner:** Product lead  
**Reference when:** Adding, cutting, or resequencing a feature.  
**Agent obligation:** Protect Must scope and the demo narrative; do not promote a
feature because it is technically interesting.

## Gate 1: admissibility

Reject or defer a feature that:

- conflicts with safety, consent, rights, or claim boundaries;
- requires an unresolved critical dependency;
- cannot be made testable before scope freeze;
- duplicates a current capability;
- has no user or judging outcome.

## Gate 2: class

### Must

Required for the four-minute proof, safety, privacy, submission, or a binding
PRD acceptance criterion.

### Should

Materially improves comprehension, accessibility, or judging evidence without
threatening Must reliability.

### Stretch

Valuable after every Must gate passes. Must remain isolated and removable.

### Won't now

Explicitly protected from accidental work.

## Gate 3: score

Score 0-3:

- User value.
- Hackathon judging contribution.
- Risk reduction.
- Evidence/validation value.
- Feasibility before freeze.

Subtract 0-3:

- New dependency/credential risk.
- Safety/privacy/rights uncertainty.
- Demo failure surface.
- Long-term maintenance burden.

The score informs; it does not override a safety or scope gate.

## Feature-creep rule

Adding a Must after M1 requires naming the displaced Must, owner approval, and a
roadmap update. "Small" is not a reason.
