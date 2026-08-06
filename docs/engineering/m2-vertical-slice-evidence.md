# M2 vertical-slice evidence

**Status:** Active evidence record; locally verified, demo-device gates open  
**Owner:** Product and gameplay engineering  
**Last verified:** 3 August 2026
**Reference when:** Changing or reporting the consent-to-result player journey.  
**Agent obligation:** Keep automated, simulated, local-browser, real-camera,
demo-device, and deployed evidence distinct.

## Implemented journey

The browser application implements:

- Simplified Chinese-first copy with an English toggle;
- disclosure before the permission choice;
- explicit real-camera and visibly labelled synthetic paths;
- standing movement and seated hand/finger modes;
- safety, calibration, tutorial, countdown, audio-clock gameplay, cooldown,
  quality-aware result, and stop;
- an explicit pre-countdown audio failure state with fresh-context retry or a
  persistently labelled silent practice that is excluded from trend input;
- three seconds of stable calibration plus a camera-centred four-move tutorial
  requiring two comfortable classifier-confirmed repetitions per move, with a
  visible centre/home guide and a neutral return before each repeat;
- mirrored player-facing landmark normalization, averaged standing
  calibration, ankle-first side-step recognition with hip-centre fallback,
  and visible body/hand landmark diagnostics during calibration and rehearsal;
- forgiving classifier-version-2 standing thresholds, one-cue movement-event
  capture through a prompt centre return, and a persistent scored-play compass
  naming the live centred/directional/unclear camera state;
- an unscored warm-up followed by the authored Follow, Rhythm, and
  Memory/no-go durations;
- deterministic bounded preview support, an always-available gentler action,
  independent music/cue volume, captions, and optional fixed-copy browser
  narration;
- low-light and companion-boundary guidance, with overlapping bodies excluded
  from scoring;
- an unusual-day context choice that preserves the result and participation
  while excluding the session from trend input;
- one scored primary player;
- unscoreable-frame handling, participation credit, fun score, and
  non-diagnostic result copy;
- summary-only IndexedDB storage and local deletion; and
- invalid interrupted-session storage during active play/cooldown, with no
  phantom score or participation before the first attempted cue;
- explicit local-data loading, unavailable, and retry states that do not
  reinterpret a failed read as empty history, while gameplay remains
  available and result completion still requires a successful summary save;
- an exact local-record inspector showing derived JSON fields and values; and
- a returning-player path that reuses the last captured mode, repeats camera
  purpose/permission and safety, and replaces mode selection plus the full
  tutorial with shortened calibration; and
- an ephemeral, development-only real-camera evidence report that combines
  aggregate cue outcomes with render/inference timing, unclear-frame episodes,
  pauses, and audio-clock drift without persisting cue IDs, attempts, media,
  landmarks, per-frame timings, or traces, with a local aggregate-JSON
  download for the dated device-evidence record; and
- a compact-screen reading state that blocks phone gameplay.

The self-hosted MediaPipe runtime, pose model, and hand model are loaded only
for a real-camera session. Synthetic fast timing is available only with
`?fast=1` and retains the visible simulation badge and `simulated=true`. It
constructs deterministic pose/hand landmark frames and routes them through the
production classifiers; it is not a prerecorded live-looking video. The
test-only `?fast=1&scenario=tracking-loss` variant injects a bounded
low-confidence landmark window through the same classifier and gameplay
tracking state machine while retaining those simulation disclosures.

## Automated evidence

Run on the current worktree and repeated from a clean archived checkout with
Node.js `24.18.0` and npm `11.16.0`:

| Check | Result |
|---|---|
| `npm run typecheck` | Passed |
| `npm run lint` | Passed with zero warnings |
| `npm test` | 36 files, 118 tests passed |
| `npm run test:integration` | 3 files, 7 tests passed |
| `npm run build` | Vite production build passed |
| `npm run test:e2e` | 24-test suite passed before this follow-up; 2 affected Chrome tests passed afterward |
| `npm run docs:validate` | 94 documentation files and 2 entrypoints passed |

For the movement-runway, gentle-step, and live-position follow-ups,
documentation validation, lint, 118 unit/component tests, 7 IndexedDB
integration/migration tests, TypeScript compilation, and the production build
pass in the current worktree. Focused production Chrome checks cover the
scored-play viewport and Pause/Resume/Stop journey; demo-device camera evidence
remains open.

The tests cover player-facing coordinate normalization, hand-landmark
confidence translation, ankle-first standing side steps, calibration-window
averaging, gentle-step and bounded-depth thresholds, one-cue movement-event
capture, centre-return re-arming, visible landmark diagnostics,
tutorial centre-return latching, camera-first hierarchy, wide/split step-layout
selection, deterministic
movement and landmark-replay traces,
low-confidence and multi-person input, three-second stability, chart phase
durations, adaptive support, forgiving feedback, weekly participation, scoring
rules, session validity/state transitions, camera inference cadence, disclosure
and permission behavior, model-preparation failure recovery, privacy-safe
camera evidence aggregation and percentiles, camera stop behavior, countdown
transitions, and
IndexedDB save/list/clear plus corrupted-record filtering and exact-shape
reconstruction.

Production-browser tests additionally cover both synthetic modes, unusual-day
exclusion, keyboard Pause/Resume/Stop, disclosure ordering, browser-denied
camera guidance and camera-free recovery, personal-trend and sharing
separation, reduced-motion persistence, 200% equivalent reading layout,
narrow-screen gameplay blocking, axe scans, offline spectator load, the
captured returning-player shortcut, classifier-backed tracking loss and
recovery, quality-invalid persistence, weekly participation without trend
inclusion for a captured invalid record, and absence of the dev camera report
from production synthetic results. Screen changes focus the new visible task
heading for assistive-technology orientation across home, disclosure,
progress, sharing, and result, after which Tab follows the task order. The E2E
runner builds and serves the current source on dedicated port 4174 with preview
reuse disabled. Simulated history is excluded from both returning-player
classification and weekly participation. Synthetic adapter failures also prove
that database-open retries use a fresh opening attempt, unavailable history is
not described as zero history, and a rejected local grant write cannot activate
sharing. Web Audio fault injection proves that scored cues do not begin after a
preparation failure, retry creates a fresh context, silent practice remains
visibly labelled and carries `clock-error`, and leaving during pending
preparation cannot trigger a stale countdown. A separate runtime fault rejects
Web Audio pause during scored play and verifies that scoring ends immediately,
the result remains participation-preserving and trend-invalid, and no corrupted
gameplay continues.

## Local browser evidence

The Vite application was exercised in the Codex in-app browser at a 1440 x 900
desktop viewport:

1. Standing simulated journey completed from disclosure to result.
2. Seated simulated journey completed from disclosure to result.
3. Every post-selection screen retained the `模拟演示` / `SIMULATED` label.
4. Both results showed Beat, Shape, Flow, and Memory separately from the fun
   score and placed `这不是诊断。` / `This is not a diagnosis.` with the result.
5. Returning home showed the incremented local session count.
6. The English toggle translated the result and privacy status.
7. The reduced-motion control set both `aria-pressed=true` and the application
   reduced-motion state.
8. At 390 x 844, gameplay content was hidden and the laptop-use explanation
   was visible.
9. A clean regression run completed with no browser console warnings or
   errors.
10. Visual checks at 1280 x 720, 1024 x 720, and 800 x 720 confirmed that the
    tutorial camera stays horizontally centred and dominant, its overlays do
    not collide, and the complete practice task fits without page scrolling.
    A production Chrome pass at 1280, 1024, and 768 px wide also measured the
    scored playfield at zero horizontal centre offset with no page overflow.
    Its contained HUD keeps pause, gentler support, optional cue narration, and
    both volume controls visible without displacing the cue target.
11. Production Chrome at 1280 x 720 verifies the scored-play move runway is
    visible without page scrolling and renders at least four ordered upcoming
    cues while Pause remains reachable; its automated axe scan reports no
    detectable violations.
12. A headed 1280 x 720 browser pass verifies the persistent five-position
    camera-state compass is visible beside the runway, explicitly says the
    player is centred, explains that one gentle step is sufficient, and does
    not reintroduce page scrolling.

The production bundle was also served through Vite Preview at 1280 x 720 in
Chrome. After its generated service worker installed the exact bundle,
self-hosted models, and MediaPipe runtime, the browser network was disabled and
the page reloaded successfully. The offline user could begin the disclosed,
visibly labelled synthetic spectator route.

This evidence uses authored synthetic landmarks. It does not establish
real-camera accuracy, older-adult usability, or demo-device performance.

## Open M2 and device gates

- Representative human runs and a front/back confusion matrix; the dev-only
  aggregate report is implemented, but no human output is claimed yet.
- Real-camera inference, tracking-loss, multi-body, lighting, and occlusion
  checks on the demo laptop.
- Four-minute real-output audio drift and full-length offline run on the demo
  laptop; the production offline spectator start is automated.
- Project-owner listening/comfort approval for the implemented rights-traced
  procedural `茉莉花` arrangement.
- Manual screen-reader and forced-colour smoke; automated axe, task-heading
  focus, keyboard core controls, reduced-motion persistence, forced colours,
  and 200% equivalent reading layout pass.
- Final Miora environment and cue assets with provenance.
