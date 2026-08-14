# AI-Assisted Gameplay Trend Design

**Status:** Approved direction pending written review  
**Date:** 14 August 2026  
**Scope:** Personal gameplay trend classification and progress presentation

## Problem

The progress report already compares a player's derived session measures with
their personal baseline, but its most visible result uses research-oriented
phrases such as `usual-range` and `sustained-shift`. This hides the product's
real on-device AI contribution and does not provide the three simple outcomes
requested for the hackathon demonstration: Stable, Declined, and Improving.

The application does not use an LLM or external trend-analysis API. It must not
claim that one exists. MediaPipe AI genuinely estimates body or hand landmarks
on the device; transparent rules convert those estimates into gameplay
measures and analyse their local history. The UI may describe this complete
pipeline as AI-assisted gameplay-history analysis while disclosing the rule-
based trend step precisely.

## Approved Outcome

The progress report will contain a prominent AI analysis component with this
hierarchy:

- `AI-ASSISTED GAMEPLAY HISTORY` as the model/process label;
- `Using on-device AI to analyze your performance` as the active explanation;
- one large result: `STABLE`, `DECLINED`, or `IMPROVING`;
- the number of same-mode, clear local sessions used by the report;
- the existing per-measure evidence and method disclosure beneath the result.

The result describes **gameplay performance**, not health. It will not mention
an LLM, disease, cognitive decline, risk, diagnosis, urgency, or medical cause.
Simulated history retains its visible simulated-data label.

## Trend Contract

Add a separate public gameplay direction to `TrendReport`:

```ts
type PerformanceTrend = "stable" | "declined" | "improving";
```

The existing internal trend status remains intact. It continues to represent
history readiness and the existing downward check-in gate, so supporter
sharing cannot become authorised by an improvement or by the new default
presentation.

For each of Beat, Shape, Flow, and Memory:

1. The first five comparable valid sessions form the personal baseline.
2. The lower boundary remains `median - max(0.12, 2 * MAD)`.
3. Add a symmetric upper boundary, `median + max(0.12, 2 * MAD)`.
4. A family is repeatedly declined when at least two of the latest three valid
   sessions fall below its lower boundary.
5. A family is repeatedly improving when at least two of the latest three valid
   sessions rise above its upper boundary.

The overall gameplay direction is:

- **Declined** when at least two families repeatedly decline and the declining
  family count is greater than the improving family count.
- **Improving** when at least two families repeatedly improve and the improving
  family count is greater than the declining family count.
- **Stable** in every other case, including insufficient history, a mixed tie,
  or ordinary variation within the personal range.

Defaulting incomplete history to Stable is a hackathon presentation choice,
not evidence of clinical stability. The method disclosure and analysed-session
count keep that limitation inspectable without showing a `Collecting data`
result.

## Components and Data Flow

`evaluatePersonalTrend` remains the only owner of trend calculations. It will
return the gameplay direction plus declining and improving family evidence.
It will not depend on React, storage, MediaPipe, a network client, or an LLM.

A focused progress component will render the AI process label, three-state
result, and concise evidence. `PersonalPatternReport` will compose it above the
existing measure breakdown. `ProgressScreen` will continue to hide personal
results when local storage is unavailable and will continue to keep standing,
seated, captured, and simulated histories separate.

The data path remains:

`on-device landmark AI -> gameplay measures -> local session summaries ->
versioned trend rule -> three-state gameplay result`

No API key, backend, dependency, raw-frame persistence, or network request is
introduced.

## Copy and Accessibility

The result must be expressed in text, not colour alone. The component uses the
existing large-type, warm paper-and-ink visual system and exposes its result as
a polite status. Chinese copy receives the same three meanings: 稳定、下降、
改善.

The method disclosure will say that on-device AI estimates movement landmarks
and a local prototype rule compares the derived session summaries. This makes
AI visible to judges without attributing the statistical calculation to a
nonexistent LLM.

## Error and Safety Behaviour

- Unavailable local history remains unavailable; it is never converted to a
  fabricated Stable result.
- Successfully loaded history with fewer than eight comparable sessions shows
  Stable, as explicitly requested, together with the actual analysed count.
- Invalid, interrupted, simulated, or different-mode records retain their
  current exclusion and separation rules.
- Only a repeated downward result can preserve the existing supporter check-in
  gate. Stable and Improving never authorise a check-in.
- The report continues to state that gameplay patterns do not identify a
  condition or explain a cause.

## Tests and Verification

Focused domain tests will prove:

- incomplete but available history defaults to Stable;
- repeated lower movement in at least two families produces Declined;
- repeated upper movement in at least two families produces Improving;
- mixed or tied repeated directions produce Stable;
- invalid, simulated, and different-mode sessions remain excluded;
- the existing supporter check-in gate still requires the downward internal
  status.

Component coverage will verify the visible AI-assisted label, each result, the
analysed-session count, the simulated-data label, and the non-LLM method copy.
Verification will include focused tests, lint, typecheck, document validation,
and a production build. Browser or device inspection remains separate evidence.

## Documentation and Rollback

The accepted product clarification will be recorded in the decision log, and
the current-project-state and M3 evidence will be updated only after local
verification. Rollback removes the new presentation direction and component
while leaving stored session summaries and the existing versioned downward
trend rule intact. No migration is required.

## Alternatives Considered

- **Pretend an LLM performs history analysis:** rejected because it creates a
  knowingly false product claim and weakens the hackathon evidence story.
- **Add a real hosted LLM call:** rejected for this iteration because it adds
  credentials, backend work, privacy review, nondeterminism, and cost without a
  labelled dataset or evidence that it improves classification.
- **Make the real AI-assisted pipeline visible:** selected because it uses the
  existing on-device model, remains private and deterministic, and gives judges
  an accurate end-to-end AI story.
