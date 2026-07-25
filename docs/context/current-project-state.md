# Current project state

**Status:** Active factual snapshot  
**Owner:** Engineering lead  
**Last verified:** 26 July 2026  
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
- Automated application tests: 82 unit/component tests, 6 IndexedDB
  integration/migration tests, and 15 production Chrome E2E tests pass.
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
3. Complete real-camera, screen-reader, forced-colour, and target-device
   non-happy checks for M2 and M3.
4. Select and configure the owner-controlled WeChat test channel before
   implementing any external send adapter.

## M1 evidence

- Clean temporary install audit: zero known vulnerabilities across 50
  dependencies.
- Headless Chrome blank-frame p95: 9.30 ms pose; 15.50 ms hand.
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

- Typecheck, lint, 82 unit/component tests, 6 IndexedDB
  integration/migration tests, 15 production Chrome E2E tests, production
  build, and documentation validation are verified locally.
- Standing and seated synthetic journeys, bilingual result copy,
  self-reported context exclusion, denied-camera guidance and camera-free
  recovery, model-preparation failure fallback, persistent reduced motion,
  local history, compact-screen gameplay blocking, 200% equivalent reading
  layout, offline spectator start, and a clean browser console are verified.
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
- A deterministic low-confidence window is replayed through the production
  classifier in Chrome to verify tracking-loss guidance, automatic recovery,
  quality-invalid persistence, and exclusion from trend input. A separate
  captured-history journey verifies that such a session still earns weekly
  participation credit. This remains synthetic browser evidence, not device
  proof.
- Optional browser/system cue narration is explicit and off by default, speaks
  only fixed caption text, follows cue volume, and is never required for play.
- The development-only `?debug=1` real-camera result report combines aggregate
  expected-versus-detected counts with active-session render/inference rates,
  inference duration median/p95, unclear-frame reasons/episodes, pauses, and
  audio-clock drift. It contains no cue IDs, attempts, media, per-frame timing,
  landmarks, or saved traces and never enters IndexedDB. It is collection
  tooling only; KI-002 and KI-011 remain open for human/device runs.
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
- Detailed evidence: [`m2-vertical-slice-evidence.md`](../engineering/m2-vertical-slice-evidence.md).
- PRD status map:
  [`prd-acceptance-audit.md`](../engineering/prd-acceptance-audit.md).
- M3 evidence:
  [`m3-longitudinal-supporter-evidence.md`](../engineering/m3-longitudinal-supporter-evidence.md).
