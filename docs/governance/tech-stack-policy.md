# Technology stack policy

**Status:** Binding selected stack and reconsideration gate  
**Owner:** Engineering lead  
**Reference when:** Selecting framework, runtime, pose provider, storage,
hosting, test tooling, or notification platform.  
**Agent obligation:** Apply ADR-0005; do not add a second framework, provider,
store, or test runner without a measured blocker and superseding decision.

## Selected stack

- Node.js `24.18.0` LTS with npm `11.16.0`.
- Vite `8.1.5`, React `19.2.8`, and strict TypeScript `6.0.3`.
- MediaPipe Tasks Vision `0.10.35`, Pose Landmarker Lite, and Hand Landmarker
  behind one provider-neutral adapter boundary.
- Native Web Audio, Canvas/CSS, media capture, and IndexedDB.
- Vitest, Testing Library, and Playwright.
- Static Sites hosting; no core-loop backend.

The decision and measurements live in
[`ADR-0005`](../adr/0005-browser-application-stack.md) and
[`m1-technical-proof.md`](../engineering/m1-technical-proof.md).

## Selection principles

- Target-laptop reliability over trendiness.
- Browser-first and local-first.
- Strict TypeScript and deterministic tests.
- Minimal runtime dependencies.
- Replaceable pose and notification providers.
- Static hosting unless a backend requirement is approved.
- Strong development ergonomics with one-command verification.

## Candidate categories

Any future spike that supersedes the stack must select:

- Node and package manager versions.
- Build/dev framework.
- UI renderer and any game/canvas layer.
- body pose provider.
- hand landmark provider or unified provider.
- local persistence wrapper.
- unit/component/browser testing.
- hosting.
- WeChat test channel.

Names in the PRD are candidates, not approval.

## Evaluation matrix

Score:

- required capability;
- demo-device FPS/latency;
- browser support;
- bundle/startup cost;
- API stability and types;
- licence/export rights;
- privacy/data behavior;
- testability;
- maintenance/community;
- exit/migration cost.

## Stack constraints

- One UI framework.
- One package manager and lockfile.
- One default pose provider per route.
- No backend framework for the core play loop.
- No state library without the state-management gate.
- No analytics SDK before KPI/privacy approval.
- No vendor SDK may leak into domain contracts.

## Reconsideration

A stack choice changes only for a measured blocker, security/maintenance
failure, or new accepted requirement. Upgrading for novelty is not a reason.
