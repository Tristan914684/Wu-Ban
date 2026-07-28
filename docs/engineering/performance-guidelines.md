# Performance guidelines

**Status:** Binding budgets  
**Owner:** Gameplay engineering  
**Reference when:** Touching camera, pose, audio, rendering, storage, or startup.  
**Agent obligation:** Measure on the demo laptop; do not "optimise" from
intuition or move work to a server without evidence.

## Release budgets

| Measure | Budget |
|---|---|
| Effective pose inference | >= 20 FPS |
| Visual rendering | >= 30 FPS |
| Motion-to-feedback p95 | < 180 ms |
| Audio/cue drift over four minutes | < 50 ms |
| Returning calibration | < 30 seconds in supported conditions |
| First cue for returning player | < 45 seconds |
| Long task on main thread | Avoid > 50 ms |

## Critical-path rules

- Audio clock schedules cues.
- Only the newest useful pose frame enters inference; bound queues.
- Drop obsolete frames rather than processing a growing backlog.
- Decouple inference and rendering rates.
- Reuse buffers/objects in measured hot loops only when it improves profiling.
- Keep storage and notification work outside the frame loop.
- Preload the single demo track and essential cue assets before countdown.
- Lazy-load supporter/reporting surfaces after gameplay readiness.

## Caching

Cache immutable versioned assets aggressively. Do not cache:

- raw camera frames;
- consent state beyond its authoritative store;
- notification send outcomes without reconciliation;
- trend results without algorithm and input-version keys.

## Performance workflow

1. Reproduce on the target device.
2. Record baseline, profile, and isolate the dominant cost.
3. Change one mechanism.
4. Repeat the same trace.
5. Add a regression budget or benchmark.

Report median and p95, device/browser, trace/chart version, and whether debug
overlays were enabled.
