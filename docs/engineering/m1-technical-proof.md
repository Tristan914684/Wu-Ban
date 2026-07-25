# M1 technical proof

**Status:** Active evidence record  
**Owner:** Gameplay engineering  
**Reference when:** Changing the camera, landmark provider, audio clock,
movement set, or performance budget.  
**Agent obligation:** Keep synthetic, headless, and real-device evidence
separate; repeat measurements after critical-path changes.

## Environment

- Date: 2026-07-26.
- Machine: current development Mac, 12 logical cores reported by Chrome.
- Browser: headless Google Chrome 150.
- Runtime used for the spike: Node.js `25.9.0`; selected project runtime is
  Node.js `24.18.0` LTS.
- Provider: `@mediapipe/tasks-vision@0.10.35`, CPU delegate.
- Input: 640 x 480 blank canvas after one warm-up run.
- Debug overlay: off.

Blank input isolates graph cost. It does not establish human movement accuracy.

## Runtime reproducibility

A clean archive of committed source was installed under the selected Node.js
`24.18.0` LTS and npm `11.16.0` runtime. `npm ci` installed 260 locked
packages, `npm audit --audit-level=high` reported zero vulnerabilities, and
the complete documentation, lint, typecheck, unit, IndexedDB integration,
production build/budget, and 15-journey Chrome gate passed. This resolves
KI-012; it does not replace the target-device measurements below.

## Landmark timing

Thirty warmed video-mode runs:

| Task | Mean | Median | p95 | Minimum | Maximum |
|---|---:|---:|---:|---:|---:|
| Pose Landmarker Lite | 8.24 ms | 8.10 ms | 9.30 ms | 7.80 ms | 10.00 ms |
| Hand Landmarker, `numHands=2` | 14.96 ms | 15.00 ms | 15.50 ms | 14.40 ms | 15.60 ms |

Each route runs only its required graph. Both results fit the 50 ms main-thread
task ceiling on this synthetic input. Real-frame inference rate and
motion-to-feedback latency remain demo-device gates.

The gameplay scheduler now permits a camera inference at most every 30 ms.
Deterministic 30 FPS and 60 FPS render-cadence tests prove the scheduler itself
does not impose a rate below the 20 effective-FPS release budget. Actual
effective FPS still depends on camera, browser, provider, and demo-laptop
performance and remains unverified until the real-device pass.

## Camera boundary proof

A browser contract test with a fake video device produced this sequence:

1. Acquisition before disclosure returned `blocked-before-disclosure`.
2. After disclosure, `getUserMedia` acquired one 640 x 480 video track.
3. The track was `live` during the session.
4. Calling `stop()` changed the track to `ended` and the stream to inactive.

The proof did not request audio and did not persist or transmit a frame.

## Human and device collection contract

A development-only real-camera run at `?debug=1` now turns completed
non-warm-up move attempts and in-session timing samples into one ephemeral
aggregate evidence report:

- expected-versus-observed counts for all four cues in the selected mode;
- total, scoreable, and matched move-cue counts;
- scoreable, overall-match, and scoreable-match rates; and
- p95 absolute timing error for matched move cues;
- active-session render and inference rates;
- inference duration median and p95 plus mean landmark confidence;
- scoreable/unclear frame totals, contiguous unclear episodes, and reasons;
- pause count; and
- absolute audio-clock drift at the end of the run and p95 across the run.
  The artifact explicitly records that the debug overlay was enabled.

The report contains no session ID, cue ID, individual attempt list, image,
audio, landmark, per-frame timestamp, or trace and is not stored in IndexedDB.
Synthetic and production sessions do not receive it. Unit tests cover
confusion, unscoreable/neutral outcomes, no-go exclusion, rates, percentiles,
pause exclusion, clock drift, chart binding, and forbidden raw-field absence;
a component test covers result presentation.

This makes the collection protocol executable but is not human evidence.
KI-002 and KI-011 remain open until dated reports are recorded across
representative people, demo speed, device, lighting, clothing, occlusion, and
companion conditions. Motion-to-feedback latency still requires an external
ground-truth capture; inference duration is not a substitute for that measure.

## Audio clock proof

An `OfflineAudioContext` at 48 kHz scheduled a 440 Hz cue from 50 ms to 100 ms.
The audio clock advanced from 21.33 ms to 120 ms monotonically. The rendered
buffer's first audible sample was at 50.02 ms; pre-cue and post-cue regions were
silent. This validates authored scheduling against the audio timeline. A
four-minute real-output drift run remains required.

## Licence and model limits

- SDK repository/package: Apache-2.0.
- Pose Landmarker Lite SHA-256:
  `59929e1d1ee95287735ddd833b19cf4ac46d29bc7afddbbf6753c459690d574a`.
- Hand Landmarker SHA-256:
  `fbc2a30080c3c557093b5ddfc334698132eb341044ccee322ccf8bcf3607cde1`.
- Both official model cards declare Apache-2.0.
- The pose model card describes entertainment as its primary intended
  application, excludes life-critical decisions and metric-accurate depth, and
  says only one person is tracked when multiple people are present.
- The web APIs are marked Preview. The adapter and fallback remain mandatory.

## Locked provider-neutral cue vocabulary

The first deterministic trace suite must cover:

| Mode | Cue | Provider-neutral evidence |
|---|---|---|
| Standing | `step-left` | Hip centre translates left relative to calibrated stance while visibility is scoreable. |
| Standing | `step-right` | Hip centre translates right relative to calibrated stance while visibility is scoreable. |
| Standing | `step-forward` | Calibrated shoulder/hip scale and foot placement indicate bounded approach. |
| Standing | `step-back` | Calibrated shoulder/hip scale and foot placement indicate bounded retreat. |
| Seated | `left-palm` | Scoreable left hand with extended fingers in its cue region. |
| Seated | `right-palm` | Scoreable right hand with extended fingers in its cue region. |
| Seated | `both-palms` | Both scoreable hands open within the timing window. |
| Seated | `index-hold` | One index finger extended while the other fingers remain folded for the hold duration. |

Low-confidence frames are unscoreable. Human-trace confusion evidence may
replace front/back cues before M2 is called complete; it cannot silently change
the chart vocabulary.

## Remaining evidence

- Representative human traces for all eight cues and front/back confusion.
- Real-camera FPS, p95 motion-to-feedback, and low-light/occlusion behavior.
- Four-minute audio/output drift on the demo laptop.
- Worker-versus-bounded-main-thread comparison with real frames.
