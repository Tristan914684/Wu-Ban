# Consent-to-result vertical slice

**Status:** Implemented; locally verified with synthetic input; device gates open  
**Owner:** Product and gameplay engineering  
**Target milestone:** M1 movement trace completion and M2 playable slice  
**PRD requirements:** FR-001 through FR-038, NFR-001 through NFR-031  
**Business rules:** BR-001 through BR-008, BR-013 through BR-018  
**Related ADRs:** ADR-0001, ADR-0002, ADR-0003, ADR-0005

## Outcome

An adult player can understand local camera use, choose standing or seated play,
calibrate, complete an authored cue session with live or visibly simulated
landmarks, and receive a quality-aware non-diagnostic result stored locally.

## User and job

- User: adult aged 60-75, with an optional companion nearby.
- Mode/frequency: first-run and returning laptop play.
- Job: enjoy a safe guided dance while preserving a useful personal movement
  and attention pattern.
- Risk: camera mistrust, physical overreach, tracking blame, hidden simulation,
  or health interpretation.

## Problem evidence

The edited PRD identifies screening avoidance and pride as product context.
Older-adult comprehension and physical usability remain assumptions until the
scheduled formative sessions. This slice proves the interaction and data
boundaries before those sessions.

## In scope

- Simplified Chinese player flow with an English toggle.
- Disclosure before camera permission.
- Standing and seated mode selection and safety copy.
- Provider loading, camera framing, calibration, tutorial, countdown,
  follow/rhythm/memory-no-go cues, cooldown, and result.
- Three uninterrupted seconds of scoreable calibration and two comfortable
  repetitions of each tutorial move.
- Thirty seconds of unscored warm-up followed by the exact 60/75/75-second
  Follow, Rhythm, and Memory/no-go structure.
- One primary player.
- MediaPipe body or hand landmarks behind an adapter.
- Visibly labelled synthetic demonstration and accelerated browser-test route.
- Unscoreable frame handling, session validity, participation credit, fun score,
  and derived session summary.
- IndexedDB storage with a reset action.
- Web Audio cue scheduling and the rights-traced procedural `茉莉花`
  arrangement.
- Pre-countdown Web Audio failure recovery with a fresh-context retry and a
  persistently labelled silent-practice path that is never trend-valid.
- An optional unusual-day context response that keeps the game result and
  participation while excluding the session from the personal trend.
- Pause, resume, stop, permission denial, tracking loss, and provider failure.
- Deterministic adaptive cue preview, gentler support, independent music/cue
  volume, fixed-copy opt-in browser narration, companion overlap exclusion,
  and privacy-safe landmark replay.

## Out of scope

- Multiple scored players.
- Arbitrary songs or automatic chart generation.
- Clinical screening, diagnosis, risk, urgency, or brain-health score.
- Supporter consent, trend calculation, and WeChat transport, which are M3.
- Final Miora art and project-owner soundtrack listening, which remain later
  gates.

## UX flow

First run: Home -> disclosure -> camera or synthetic choice -> mode -> safety
-> provider preparation -> calibration -> tutorial -> countdown -> play ->
cooldown -> quality-aware result.

Returning captured player: Home with saved mode and approximate duration ->
camera purpose/permission or synthetic choice -> safety -> provider preparation
-> shortened calibration -> countdown -> play -> cooldown -> quality-aware
result. Simulated history does not activate this returning path.

The cooldown asks whether pain, illness, unusual fatigue, or a camera problem
made the day different. Either answer reaches the result; an unusual-day answer
adds `self-reported-context` to the exclusion reasons without removing the fun
score or participation credit.

Recovery: denial or provider failure offers browser guidance, retry, or the
labelled synthetic demonstration. Audio preparation failure stays before
countdown and offers a fresh-context retry or labelled silent practice.
Fatal audio failure after scoring begins ends the round with a trend-invalid
participation result rather than continuing a corrupted clock. Tracking loss
pauses scoring but not participation. Stop ends the camera, invalidates pending
audio work, and marks an active session incomplete.

Required states: empty, loading, partial, permission, denied, recoverable error,
tracking lost, paused, invalid, success, and synthetic.

## Functional requirements

| ID | Requirement | Acceptance |
|---|---|---|
| VS-001 | Disclosure gates camera acquisition. | No `getUserMedia` call can occur before the disclosure action. |
| VS-002 | One explicit mode owns one provider. | Standing loads pose only; seated loads hands only. |
| VS-003 | Raw media stays transient. | Camera objects remain inside the adapter and all tracks stop on exit. |
| VS-004 | Frames are quality-gated. | Low-confidence input emits `unscoreable`, never an incorrect move. |
| VS-005 | Audio clock owns cue time. | Cue lookup derives from the audio clock, not animation frame counts. |
| VS-006 | Synthetic input is explicit. | Every synthetic session screen and stored summary carries a visible label and `simulated=true`. |
| VS-007 | Invalid sessions do not become trend input. | Completion summary carries validity and exclusion reasons separately from participation credit. |
| VS-008 | Local history stores summaries only. | IndexedDB records contain no media or landmark frames. |
| VS-009 | Player can pause or stop. | Both actions are pointer and keyboard reachable throughout timed play. |
| VS-010 | Seated play is functional. | Four seated gesture cues have calibration, classification, and trace tests. |
| VS-011 | Warm-up does not shape results. | Warm-up cues are visible but never enter score, quality ratio, or trend measures. |
| VS-012 | Tutorial confirms comfortable practice. | Each selected mode rehearses its four cues twice; standing can switch to seated and recalibrate. |
| VS-013 | Adaptation is bounded and explainable. | Only preview support changes one step at a time; the player can always request gentler support. |
| VS-014 | Companion overlap cannot corrupt a profile. | Extra detected bodies mark the affected segment unscoreable and receive no score. |
| VS-015 | Fallback uses the real domain path. | Labelled synthetic landmark frames pass through production classifiers and scoring without saved video. |
| VS-016 | Audio failure cannot silently change scoring meaning. | Scored cues wait for a prepared clock; retry uses a fresh context, silent practice remains labelled and carries `clock-error`, and a fatal runtime fault ends scoring with a trend-invalid result. |

## Data and contracts

- Inputs: transient camera frame or versioned synthetic landmark frame, audio
  clock time, chart cue, player mode, language, and reduced-motion preference.
- Outputs: ephemeral feedback plus immutable derived session summary.
- Stored data: session ID, timestamps, mode, chart/version, fun score, aggregate
  measures, quality/validity, participation, and simulation flag.
- Retention/deletion: local until the player uses Reset local history.
- Simulated/test behavior: separate adapter and explicit metadata; accelerated
  timing only under a visible synthetic test configuration.
- Versioning: chart, classifier, quality, scoring, and summary schema versions.
  Classifier version 2 identifies the forgiving gentle-step thresholds and
  one-cue event-capture behavior; stored version-1 summaries remain readable.

## Safety, privacy, and accessibility

- Consent: camera processing disclosure is separate from future supporter
  sharing.
- Optional browser narration receives only the fixed displayed cue label after
  the player opts in; it receives no camera, landmark, score, trend, contact,
  or health data, and core play never depends on it.
- Threats: hidden capture, track leak, accidental persistence, provider network
  fetch, and late async result after session reset.
- Claim boundary: result says movement-and-attention session, uncertainty, and
  “not a diagnosis.”
- Physical safety: no jumps, fast spins, full backward travel, or required
  one-leg balance; Stop remains fixed.
- WCAG/older-adult requirements: 44 px minimum targets, 24 px gameplay copy,
  keyboard access, visible focus, redundant cue channels, 200% reading zoom,
  reduced motion, and no phone gameplay claim.

## Architecture

- Owning modules: `movement`, `quality`, `chart`, `scoring`, `session`, gameplay
  application controller, camera/pose/audio/storage adapters, and feature UI.
- Ports/adapters: landmark stream, audio clock, camera session, session
  repository, ID, and time.
- Dependency or ADR needs: ADR-0005 is accepted; dependency decisions are
  recorded.
- Failure and cancellation: adapter operations accept abort signals or
  session identity; leaving a screen stops camera, animation, audio, and stale
  results.

## Metrics

- Outcome metric: percentage of started sessions reaching a clear result.
- Guardrail metric: unscoreable-frame ratio and invalid-session count.
- Diagnostic metric: provider load time and p95 inference time.
- Prohibited inference: MCI probability, diagnosis, clinical urgency, brain
  age, or composite health risk.

## Test plan

- Unit: movement and synthetic landmark traces, frame quality, stability,
  adaptive support, weekly participation, cue lookup, scoring, and validity.
- Contract: camera lifecycle, MediaPipe translation, audio schedule, and
  IndexedDB record shape.
- Component: disclosure, loading, permission error, audio recovery,
  simulation label, pause, tracking loss, invalid result, and seated mode.
- Browser/device: synthetic first-run route, denial/recovery, seated route,
  returning captured route, offline load, keyboard, accessibility scan, and
  manual real camera.
- Non-happy: provider/model failure, audio preparation/retry/cancellation,
  runtime clock failure, no landmarks, low confidence, hidden tab, stop,
  storage failure, and narrow viewport.

## Rollout and rollback

- Feature flag/config: query-driven synthetic fast mode is test/demo-only and
  visibly labelled. Its `scenario=tracking-loss` fault variant remains
  synthetic and is used only to exercise classifier-backed recovery behavior.
- Migration: session summary schema version 1; future changes require a
  migration.
- Rollback: disable live provider and retain the labelled spectator
  demonstration; no user media is stranded.
- Observability: local privacy-safe timing and state diagnostics without
  contact identifiers, landmarks, or frames.

## Documentation updates

- Current project state, known issues, technical proof, local development,
  dependency record, rights record, and changelog.
- Current implementation evidence:
  [`m2-vertical-slice-evidence.md`](../engineering/m2-vertical-slice-evidence.md).

## Open decisions

- Human-trace thresholds for front/back steps.
- Project-owner listening approval for the procedural `茉莉花` arrangement.
- Final Miora environment/guide assets and provenance.
- Exact real-camera worker threshold after target-device profiling.
