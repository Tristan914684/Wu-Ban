# KPI framework

**Status:** Binding metric governance  
**Owner:** Product lead  
**Reference when:** Adding analytics, evaluating a pilot, or preparing claims.  
**Agent obligation:** Define purpose, formula, denominator, source, owner, and
guardrail before instrumenting a metric.

## Hackathon outcome metrics

| Metric | Definition | Target |
|---|---|---|
| Demo run reliability | Completed live runs / attempted consecutive runs | 5/5 |
| First success time | Time from welcome to first accepted move for a new tester | <= 90 sec |
| Scoreable cues | Authored cues with sufficient pose quality / authored cues | >= 90% in controlled demo |
| AI comprehension | Testers who can name pose + Miora + CodeBuddy roles | Qualitative pass |
| Claim comprehension | Testers who understand trend/check-in is non-diagnostic | Qualitative pass |

## Product outcomes

- Valid sessions per player per week.
- Four-week player retention.
- Completion rate.
- Enjoyment and perceived safety.
- Consent comprehension.
- Supporter check-in helpfulness.

## Guardrails

- Permission denial after disclosure.
- Invalid/excluded session rate.
- Unnecessary-alarm rate.
- Sharing revocation rate and revocation failures.
- Tracking failure by device/environment.
- Accessibility task failure.
- Raw-media persistence incidents: target zero.

## Diagnostic engineering metrics

Inference FPS, render FPS, motion-to-feedback latency, audio drift, dropped
frames, storage failure, and check-in delivery errors explain system health.
They are not product success.

## Prohibited KPIs

- MCI detection rate.
- Dementia prevention.
- "Brain score" improvement.
- Clinical sensitivity/specificity without a validated study.
- Message-send volume as evidence of wellbeing impact.
- Time spent if longer sessions reduce safety or enjoyment.

Analytics must be minimal and consented; a metric does not justify collecting
raw media or contact content.
