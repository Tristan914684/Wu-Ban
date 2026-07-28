# Debugging guide

**Status:** Binding method  
**Owner:** Engineering lead  
**Reference when:** Diagnosing incorrect behavior, performance, or integration
failure.  
**Agent obligation:** Reproduce and isolate before changing code.

## Workflow

1. Capture exact symptom, environment, expected result, and first bad version.
2. Reduce to the smallest reproducible chart/trace/state.
3. Inspect privacy-safe debug metrics.
4. Identify the boundary where actual diverges from expected.
5. Form one falsifiable hypothesis.
6. Add a failing regression test or repeatable measurement.
7. Apply the smallest fix.
8. Re-run nearby and full applicable gates.
9. Remove temporary diagnostics.

## Gameplay diagnostic order

1. Audio clock and cue timestamp.
2. Camera frame timestamp.
3. Provider inference latency.
4. Landmark confidence/visibility.
5. Calibration transform.
6. Movement classifier.
7. score window.
8. UI render.

Do not tune score windows until the clocks and transforms are known correct.

## Tracking

Use synthetic traces to separate provider failure from domain failure. Never
save a player's raw camera feed to make debugging easier. If a human recording
is ever required for research, it is outside the MVP and needs separate
consent/handling.

## Notification

Inspect consent version, active grant, recipient mapping, idempotency key,
provider response code, and audit outcome. Never paste real tokens, recipients,
or message content into issues.

## Performance

Compare the same device, browser, trace, chart, and build mode. Debug mode can
distort measurements; record it.
