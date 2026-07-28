# Dependency decisions

**Status:** Active decision record  
**Owner:** Engineering lead  
**Reference when:** Adding, upgrading, replacing, or removing a package, model,
font, or hosted service.  
**Agent obligation:** Complete the approval fields before changing a manifest;
replace time-boxed decisions with approved or rejected outcomes after evidence
is collected.

## Time-boxed M1 spike

### Dependency: `@mediapipe/tasks-vision@0.10.35`

- Requirement: Local body and hand landmarks for standing and seated play.
- Category: SDK.
- Alternatives considered: Tencent Effect body detection, TensorFlow.js pose
  models, separate pose and hand packages, and synthetic-only input.
- Why platform/existing code is insufficient: Browsers expose camera frames but
  do not provide body or hand landmarks.
- Licence and redistribution: Package metadata and the upstream repository
  declare Apache-2.0. Model-card and bundled-model redistribution terms must
  still be captured before committing model files.
- Security/maintenance evidence: The upstream repository had an April 2026
  stable release and the package registry reports `0.10.35` as the latest
  stable release checked on 2026-07-26. The web APIs remain labelled Preview.
- Browser/device support: Official web guides expose video-mode Pose Landmarker
  and Hand Landmarker APIs. Target-laptop timing is part of this spike.
- Bundle/install/transitive impact: Registry unpacked size is approximately
  34.8 MB before model assets. Shipped compressed size and critical-route load
  time must be measured.
- Data sent/received: Inference is on device. Runtime code and models must be
  self-hosted for the offline path; no raw frame may leave the adapter.
- Failure and offline behavior: Model-load or inference failure disables live
  scoring and offers a visibly labelled synthetic demonstration.
- Adapter/containment: One provider adapter translates SDK landmarks into
  provider-neutral frames. Domain modules do not import MediaPipe types.
- Test strategy: Static-fixture load, repeated video-mode inference timing,
  adapter contract tests, camera lifecycle test, and manual demo-device pass.
- Exit/replacement path: Replace the adapter and model assets without changing
  movement, scoring, session, or UI contracts.
- Owner: Engineering lead.
- Decision: Approved at `0.10.35`; real-frame evidence remains a release gate.
- Review/expiry date: 2026-08-10.

### Dependency: Vite, React, and TypeScript

- Requirement: A stateful browser game with explicit session phases,
  provider-loading states, local persistence, route-level code splitting, and
  testable UI composition.
- Category: Runtime and build.
- Alternatives considered: Static HTML/CSS/JavaScript, Next.js, and Phaser.
- Why platform/existing code is insufficient: Static JavaScript could run the
  proof but would make the approved multi-screen state machine and component
  state tests materially harder to maintain. Server rendering and a game
  engine are unnecessary for the local-first loop.
- Licence and redistribution: Vite and React declare MIT; TypeScript declares
  Apache-2.0.
- Security/maintenance evidence: Official projects with active 2026 releases.
  Exact versions, install scripts, audit output, and lockfile are captured by
  the spike.
- Browser/device support: Vite production output targets modern widely
  available browsers. The MVP is laptop Chrome/Edge first.
- Bundle/install/transitive impact: React is accepted only for human-frequency
  UI state. Camera inference and cue drawing are isolated from framework-wide
  rerenders. No game-engine dependency is approved.
- Data sent/received: None at runtime by the framework.
- Failure and offline behavior: Production output is static and must work
  without an application backend. Provider assets are self-hosted.
- Adapter/containment: React stays in `app`, `features`, and `ui`; domain and
  application contracts remain framework-independent.
- Test strategy: Strict typecheck, unit/component tests, production build, and
  real-browser synthetic journey.
- Exit/replacement path: Standard web modules and explicit ports keep domain
  logic portable; the UI layer is replaceable.
- Owner: Engineering lead.
- Decision: Approved with exact manifest pins and Node.js `24.18.0` LTS.
- Review/expiry date: 2026-08-10.

### Dependency: Vitest, Testing Library, and Playwright

- Requirement: Deterministic domain, component, adapter-contract, accessibility,
  and critical-browser-flow verification.
- Category: Development and test.
- Alternatives considered: Node test runner plus manual browser testing.
- Why platform/existing code is insufficient: Node's runner does not provide the
  browser-like component queries and real-browser camera/fallback journey
  required by the testing strategy.
- Licence and redistribution: Vitest and Testing Library declare MIT;
  Playwright declares Apache-2.0.
- Security/maintenance evidence: Official, actively maintained packages.
  Versions and audit output are pinned after scaffold.
- Browser/device support: Playwright Chromium covers synthetic journeys; a
  manual target-device pass remains mandatory.
- Bundle/install/transitive impact: Development-only and excluded from the
  production bundle.
- Data sent/received: No production data. Tests use versioned synthetic traces.
- Failure and offline behavior: Deterministic tests do not depend on network,
  camera, audio hardware, or real personal data.
- Adapter/containment: Test support lives outside production domain behavior.
- Test strategy: The packages are the strategy implementation.
- Exit/replacement path: Tests assert public contracts and can migrate runners
  without changing production behavior.
- Owner: Engineering lead.
- Decision: Approved as development-only tooling.
- Review/expiry date: 2026-08-10.

### Dependency: Fontsource Noto Serif SC and Noto Sans SC `5.3.0`

- Requirement: Distinctive, legible Simplified Chinese display and body type
  that works without a font CDN.
- Category: Asset.
- Alternatives considered: Platform-only Chinese fonts, remote Google Fonts,
  and a licensed commercial typeface.
- Why platform/existing code is insufficient: Platform-only rendering would not
  provide the selected editorial identity, while remote fonts break the
  offline-first route.
- Licence and redistribution: Both packages declare SIL Open Font License 1.1.
- Security/maintenance evidence: Fontsource release metadata and immutable
  packaged WOFF2 assets; no runtime code.
- Browser/device support: WOFF2 with declared fallback stacks.
- Bundle/install/transitive impact: Approximately 11.3 MB unpacked across both
  packages; import only the required Simplified Chinese variable subsets.
- Data sent/received: None at runtime.
- Failure and offline behavior: `font-display: swap` and platform Chinese
  fallbacks preserve readable content.
- Adapter/containment: Typography tokens only.
- Test strategy: Build-size inspection, offline load, 200% zoom, and Chinese
  glyph screenshot review.
- Exit/replacement path: Replace token imports and retain semantic type roles.
- Owner: Product design and frontend engineering.
- Decision: Approved.
- Review/expiry date: 2026-08-10.

### Dependency: GitHub-maintained CI actions

- Requirement: Reproducible pull-request verification with no repository
  write access or external-service secrets.
- Category: Development and CI.
- Alternatives considered: Unpinned action tags, a third-party CI platform,
  and local-only verification.
- Why platform/existing code is insufficient: GitHub workflows require source
  checkout and an exact Node.js toolchain before repository commands can run.
- Licence and redistribution: `actions/checkout` and `actions/setup-node`
  declare MIT.
- Security/maintenance evidence: Official GitHub-maintained repositories;
  releases are pinned to immutable commits rather than floating tags.
- Browser/device support: Ubuntu hosted runner with Node.js from `.nvmrc`;
  Playwright installs Chrome through its own pinned CLI.
- Bundle/install/transitive impact: CI-only; no production bundle impact.
- Data sent/received: Repository source and npm packages only. Workflow
  permissions are `contents: read`; no WeChat or hosting secrets are provided.
- Failure and offline behavior: CI fails closed; local `npm run verify:full`
  remains the recovery path.
- Adapter/containment: `.github/workflows/ci.yml` only.
- Test strategy: Run the same deterministic and browser commands used locally.
- Exit/replacement path: Replace the workflow while retaining repository
  scripts as the portable contract.
- Owner: Engineering lead.
- Decision: Approved at checkout `v6.0.2` and setup-node `v6.4.0`, pinned by
  commit SHA.
- Review/expiry date: 2026-08-10.

## Evidence sources

- [MediaPipe Pose Landmarker web guide](https://developers.google.com/edge/mediapipe/solutions/vision/pose_landmarker/web_js)
- [MediaPipe Hand Landmarker web guide](https://developers.google.com/edge/mediapipe/solutions/vision/hand_landmarker/web_js)
- [MediaPipe Apache-2.0 licence](https://github.com/google-ai-edge/mediapipe/blob/master/LICENSE)
- [Vite official guide](https://vite.dev/guide/)
