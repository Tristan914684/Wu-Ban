# Testing strategy

**Status:** Binding strategy; commands activate after stack selection  
**Owner:** Engineering lead  
**Reference when:** Planning, implementing, reviewing, or releasing behavior.  
**Agent obligation:** Test public behavior and business-rule invariants at the
lowest reliable level, then verify critical journeys in a real browser.

## Test layers

### Unit

Pure, deterministic tests for:

- chart validation and cue scheduling inputs;
- landmark normalization and movement classification;
- quality gates;
- Beat/Shape/Flow/Memory scoring;
- adaptive difficulty bounds;
- session validity;
- baseline/trend rule;
- consent and revocation decisions;
- check-in copy model.

Use fixed clocks, IDs, and synthetic landmark traces. Unit tests must not load a
camera, audio device, IndexedDB, or network.

### Contract/integration

Verify each adapter against its port:

- pose-provider payload to provider-neutral frame;
- Web Audio clock and cue scheduler;
- IndexedDB repository and schema migration;
- notification request/response, idempotency, and failures;
- localization completeness.

### Component

Test permission, loading, tracking lost, invalid session, insufficient history,
simulated label, consent, revocation, and send-result states. Prefer role and
accessible-name queries over implementation selectors.

### Browser end to end

Critical journeys:

1. First-run disclosure to successful result using a synthetic pose stream.
2. Tracking loss and recovery.
3. Invalid session excluded from trend.
4. Simulated history cannot lose its label.
5. Grant, send test check-in, revoke, and block future sends.
6. Seated hand/finger route.
7. Offline spectator fallback.

The automated tracking-loss journey must route a low-confidence landmark frame
through the production classifier and gameplay state machine, then verify
visible recovery and persisted validity. A separate captured-history assertion
must prove participation credit is independent from trend validity. This
synthetic fault route does not replace the manual device pass.

Run a manual real-camera pass on the demo device; automation does not replace
hardware evidence.

## Coverage policy

Coverage is a signal, not the goal. Require 100% decision coverage for safety
and privacy invariants where practical; do not set a global percentage that
rewards trivial tests. Every business rule affected by a change must have a
named test.

## Test quality

- Arrange one behavior.
- Assert outcomes, not private calls.
- Avoid sleeps; control time.
- Builders default to valid safe values.
- A regression test must fail before the fix.
- Flaky tests are defects; quarantine requires an owner and short deadline.
