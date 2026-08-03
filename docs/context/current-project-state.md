# Current project state

**Status:** Active factual snapshot  
**Owner:** Engineering lead  
**Last verified:** 3 August 2026
**Reference when:** Starting any task or reporting progress.  
**Agent obligation:** Never describe proposed work as implemented; update this
file after material verified changes.

## Repository state

- Product name: 舞伴 (Wǔbàn); repository/internal name remains DanceBros.
- Stage: M1/M2 real-device hardening and M3 external-owner-test preparation.
- Application scaffold: Vite/React/TypeScript browser app is implemented.
- Package manager/runtime: Node.js `24.18.0` LTS and npm `11.16.0` selected;
  exact project pins are present. A clean archived checkout installed and
  passed the complete verification gate on those exact versions.
- Frontend framework: Vite `8.1.5`, React `19.2.8`, and TypeScript `6.0.3`
  selected and installed under ADR-0005.
- Pose provider: MediaPipe Tasks Vision `0.10.35`, Pose Landmarker Lite, and
  Hand Landmarker are self-hosted behind an adapter; real-frame validation
  remains.
- Backend: not approved for the core local-first loop.
- Automated application tests: 118 unit/component tests and 7 IndexedDB
  integration/migration tests pass in the current worktree. The 24-test
  production Chrome suite passed before this gameplay follow-up; the two
  affected scored-play and Pause/Resume/Stop journeys pass after it.
- CI: least-privileged GitHub Actions workflow is implemented locally; its
  first remote run remains unverified until the branch is pushed to GitHub.
- Production deployment: private Sites URL is live at
  `https://wuban-dance-companion.hello18528.chatgpt.site`; the signed-out access
  gate is verified, while owner-authenticated application smoke awaits account
  selection.
- Miora: official web studio identified, but the available Chrome session is
  signed out, so final asset generation remains blocked on owner sign-in.
- CodeBuddy: owner-account submission evidence remains unverified.
- Documentation operating system: active; 94 Markdown files and two repository
  entrypoints validate locally with `node scripts/validate-docs.mjs`.

## Binding MVP direction

- Audience: adults aged 60-75; no "active senior" prerequisite.
- Demo: laptop-first; TV mirroring is future-compatible, not a separate MVP.
- Primary play: standing movement.
- Accessibility path: seated hand/finger gesture play must be represented, not
  merely promised.
- Tracking: one calibrated primary player contributes to scoring and trends.
  Extra detected bodies pause scoring for the affected segment.
- Session structure: 30-second unscored warm-up, 60-second Follow, 75-second
  Rhythm, and 75-second Memory/no-go phases precede cooldown.
- Personalization: deterministic preview support changes one bounded step at a
  time, with an always-available gentler action.
- Music: a project-authored procedural `茉莉花 (Mo Li Hua)` arrangement is
  implemented from a public-domain score reference with no bundled recording,
  sample, or soundfont. Project-owner listening and demo-laptop output review
  remain open.
- Caregiver: include a real, consented non-diagnostic check-in path for owner
  testing, with a WeChat implementation guide. It is not a medical alert.
- Claims: movement-and-attention trends only; no diagnosis, screening, risk
  score, or "months earlier" claim.
- Data: raw camera frames remain in memory and are discarded.
- Longitudinal demo: simulated history stays visibly labelled.

## Next approved work

1. Capture representative human traces and run real-camera validation on the
   demo laptop.
2. Complete project-owner listening and the four-minute real-output audio run
   for the implemented rights-traced procedural `茉莉花` arrangement.
3. Complete real-camera, manual screen-reader, manual forced-colour, and
   target-device non-happy checks for M2 and M3.
4. Select and configure the owner-controlled WeChat test channel before
   implementing any external send adapter.

## M1 evidence

- Clean temporary install audit: zero known vulnerabilities across 50
  dependencies.
- Headless Chrome blank-frame p95: 9.30 ms pose. The current seated adapter's
  640 x 480 supplied-frame video replay measured 28.40 ms median and 29.30 ms
  warm p95 across 40 detections; a representative demo-device run remains
  required.
- The camera scheduler requests inference at most every 30 ms rather than
  imposing a sub-20-FPS ceiling; real effective FPS remains a demo-device gate.
- Real-camera development sessions can emit an ephemeral aggregate device
  report with cue confusion, scoreable/match rates, matched timing p95,
  render/inference rates, inference duration median/p95, unclear-frame
  episodes, and audio-clock drift; representative human runs have not yet
  been recorded.
- Camera lifecycle: disclosure guard, acquisition, live track, stopped track.
- Offline audio schedule: first signal at 50.02 ms for a 50 ms authored cue.
- Model-card licences and limitations visually reviewed from the official PDFs.

## Evidence status

- Documentation validation, lint, 118 unit/component tests, 7 IndexedDB
  integration tests, TypeScript compilation, production Vite build, and bundle
  budget are verified in the current worktree.
- Movement rehearsal features a clean 3-column, single-page layout without text overlays on the camera preview. All move lists, active cue cards, position reset instructions, and tracking readouts live in layout panels around the video. Every movement cue provides clear, explicit movement instructions in both English and Simplified Chinese side-by-side. The entire workspace fits within 100dvh without vertical scrolling.
- Standing and seated synthetic journeys, bilingual result copy,
  self-reported context exclusion, denied-camera guidance and camera-free
  recovery, model-preparation failure fallback, persistent reduced motion,
  local history, compact-screen gameplay blocking, 200% equivalent reading
  layout, offline spectator start, and a clean browser console are verified.
- The chosen Simplified Chinese or English interface now persists locally and
  updates the document language for assistive technology. Language and the
  persistent reduced-dynamics switch live in a compact Display and comfort
  disclosure instead of occupying the primary header row.
- Calibration status and recovery guidance occupy separate preview regions.
  Missing landmarks now prompt repositioning instead of being labelled as a
  lighting problem, and the MediaPipe provider confidence gate is aligned to
  the domain gate at `0.45`. Real-camera accuracy under representative
  lighting remains an open device-evidence gate.
- Seated camera frames now pass through a reusable transient in-memory canvas
  and fresh Hand Landmarker image inference. This avoids both the task's
  unpopulated per-landmark visibility field and the browser build's empty
  stateful video-tracker result. Both supplied real frames and a 40-frame video
  replay reach the seated classifier and visible hand count; representative
  live human-device validation remains open.
- Real-camera landmarks are normalized to the same mirrored player view as the
  visible preview. Standing side steps use ankle displacement first with
  a bounded hip-centre fallback. Classifier version 2 lowers the entertainment
  movement thresholds so a gentle intentional ankle step or bounded depth
  change is sufficient; the three-second calibration still stores an average
  rather than one final frame. Calibration and movement practice now
  draw the scoreable body/hand landmarks and name the detected parts; rehearsal
  also reports the current classified direction. These changes have automated
  landmark and classifier evidence, but still require a representative human
  run on the demo camera.
- Movement rehearsal now keeps the camera as the centred, dominant proof
  surface. Move progress, the active cue, centre/home guidance, and tracking
  status are compact overlays. The rehearsal frame expands to a taller 16:10,
  laptop-width surface while the 4:3 camera and tracking geometry remain
  aligned in its centre, with replay and pace controls in the side rails. Reset
  feedback names the next physical action for standing feet or seated hands. A
  drawn centre axis with standing footprints or seated marker makes the default
  position explicit, and a held movement cannot count twice until the
  classifier observes a neutral return.
- Setup screens without a supporting visual now use the full editorial grid
  instead of reserving an empty right column. Split screens keep their visual
  active at common laptop widths, while the scored playfield is bounded to the
  remaining dynamic viewport height and keeps its cue target at the true screen
  centre beneath a contained HUD without page-level vertical scrolling.
- Scored play now presents four stable, mode-specific movement lanes with a
  fixed action line and four to five ordered upcoming cues. Cue position is
  derived from the existing audio-clock chart; scoring and narration contracts
  are unchanged, and every marker retains text, symbol, shape, and lane cues.
- Scored play now captures each fresh movement as a short-lived event, so a
  correct step remains countable after the player promptly returns to centre
  instead of requiring them to hold the pose until cue evaluation. Centre
  return re-arms the next event and a held pose cannot score twice. A persistent
  camera-state panel shows centred, left, right, forward, back, seated gesture,
  and unclear states using plain language plus a five-position compass.
- The seven primary setup surfaces now respond to both viewport width and
  height. At the 1280 x 720 target, home, disclosure, permission, mode, safety,
  calibration, and movement practice require no page-level vertical scrolling;
  the same path was browser-measured without overflow from 650 to 900 px tall.
  Long progress, privacy, stored-record, and zoomed reading surfaces retain
  normal document scrolling rather than shrinking below accessible sizes.
- Three-second stable calibration, four-move/two-repetition rehearsal,
  warm-up exclusion, Good/Nearly/Try-next feedback, weekly participation,
  adaptive preview support, independent music/cue volume, companion
  quality-gating, and deterministic landmark replay are implemented and
  covered locally.
- Stopping active gameplay or cooldown persists an invalid summary with typed
  interruption/quality reasons, and the privacy surface can reveal the exact
  locally stored summary JSON before deletion.
- IndexedDB session reads deeply validate and reconstruct the approved summary
  schema. Malformed nested values are ignored, and unexpected stored fields
  cannot flow into history, trend evaluation, or the privacy inspector.
- Local history and sharing hydration expose loading and unavailable states
  instead of converting failures into zero history or sharing-off claims.
  Database-open failures clear the cached opening attempt so an explicit retry
  can recover. Data-dependent trend and consent controls stay hidden while
  unavailable; gameplay remains available, completion waits for a successful
  summary save, and a failed grant write never becomes active consent.
- Audio preparation failure now stops before countdown instead of silently
  changing clocks. The player can retry with a fresh Web Audio context or
  choose a persistently labelled silent practice; silent results retain fun
  and participation but carry `clock-error` and never shape a personal trend.
  Leaving while audio is still preparing invalidates the pending attempt, so a
  late adapter result cannot start a stale session.
- A fatal audio pause/resume failure during scored play now ends scoring
  immediately instead of leaving a corrupted session active. The result keeps
  participation, carries `clock-error`, explains that the beat was unavailable,
  and remains excluded from personal trends.
- A deterministic low-confidence window is replayed through the production
  classifier in Chrome to verify tracking-loss guidance, automatic recovery,
  quality-invalid persistence, and exclusion from trend input. A separate
  captured-history journey verifies that such a session still earns weekly
  participation credit. This remains synthetic browser evidence, not device
  proof.
- Optional browser/system cue narration is explicit and off by default, speaks
  only fixed caption text, follows cue volume, and is never required for play.
- Each reading-surface transition programmatically focuses its visible task
  heading without adding it to the normal Tab order. Production Chrome verifies
  home, disclosure, progress, sharing, and result orientation, then verifies
  that Tab advances from disclosure to its primary action. The same journey
  checks the exposed names and pressed state of the persistent settings
  controls. Manual VoiceOver and forced-colour smoke remain open.
- Production E2E starts its own build on dedicated port 4174 with preview reuse
  disabled, preventing a long-running development or preview server from
  satisfying browser tests for a different source state.
- The development-only `?debug=1` real-camera result report combines aggregate
  expected-versus-detected counts with active-session render/inference rates,
  inference duration median/p95, unclear-frame reasons/episodes, pauses, and
  audio-clock drift. It contains no cue IDs, attempts, media, per-frame timing,
  landmarks, or saved traces and never enters IndexedDB. The operator can
  download that aggregate JSON locally for the dated evidence record. It is
  collection tooling only; KI-002 and KI-011 remain open for human/device runs.
- A clean archived checkout under Node.js `24.18.0` and npm `11.16.0`
  installed 260 locked packages, reported zero vulnerabilities, and passed
  documentation, lint, typecheck, unit, integration, build/budget, and all
  production-browser journeys. KI-012 is resolved.
- Returning players with captured local history see their last played mode and
  approximate four-minute duration, repeat camera purpose/permission and
  safety, then take shortened calibration without repeating mode selection or
  the full tutorial. Simulated history does not activate this route or count
  toward weekly participation.
- Real/simulated trend separation, deterministic simulated history, separate
  supporter grant, revocation, preview-only check-in, and immediate pre-send
  consent/binding revalidation are verified locally and in the browser. No
  WeChat delivery has been attempted or claimed.
- Real-camera, demo-device, final music, Miora, older-adult, WeChat,
  authenticated production, and remote CI evidence remain open.
- KI-003 is resolved by the measured hand-landmark provider, separate seated
  calibration/acceptance criteria, classifier and replay tests, and seated
  browser journey. KI-006 is resolved by accepted ADR-0004 and the implemented
  non-diagnostic check-in boundary; the older PRD phrase does not authorise a
  health alert.
- Detailed evidence: [`m2-vertical-slice-evidence.md`](../engineering/m2-vertical-slice-evidence.md).
- PRD status map:
  [`prd-acceptance-audit.md`](../engineering/prd-acceptance-audit.md).
- M3 evidence:
  [`m3-longitudinal-supporter-evidence.md`](../engineering/m3-longitudinal-supporter-evidence.md).
