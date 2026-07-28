# ADR-0005: Vite React browser stack with MediaPipe landmarks

**Status:** Accepted  
**Date:** 26 July 2026  
**Decision owner:** Engineering lead

## Context

舞伴 needs a stateful, laptop-first browser experience with a strict local
camera boundary, a seated hand route, deterministic domain logic, and a static
deployment. The repository prohibited scaffolding until an M1 spike measured
the critical browser path.

The spike self-hosted MediaPipe Tasks Vision `0.10.35`, its WebAssembly runtime,
the Pose Landmarker Lite model, and the Hand Landmarker model. In headless
Chrome 150 on the development Mac, thirty warmed blank-frame CPU runs measured:

| Task | Mean | Median | p95 | Maximum |
|---|---:|---:|---:|---:|
| Pose Landmarker Lite | 8.24 ms | 8.10 ms | 9.30 ms | 10.00 ms |
| Hand Landmarker, up to two hands | 14.96 ms | 15.00 ms | 15.50 ms | 15.60 ms |

The same proof verified disclosure-gated camera acquisition and track shutdown,
plus a Web Audio-authored cue whose first signal appeared at 50.02 ms on a
50 ms schedule. The package and both model cards declare Apache-2.0. The models
remain preview technology and require representative human trace validation.

## Decision

- Runtime: Node.js `24.18.0` LTS and npm `11.16.0`.
- Application: Vite `8.1.5`, React `19.2.8`, and strict TypeScript `6.0.3`.
- Body provider: MediaPipe Tasks Vision `0.10.35` with Pose Landmarker Lite,
  one scored primary player, and self-hosted assets.
- Seated provider: the same SDK with Hand Landmarker and provider-neutral
  gesture classification.
- Rendering: React at human-facing frequency, with native Canvas/CSS for the
  timed playfield. No game engine or global state library.
- Persistence: browser IndexedDB behind a repository port; no wrapper
  dependency until native complexity is measured.
- Tests: Vitest, Testing Library, and Playwright with synthetic traces.
- Delivery: static browser output through Sites; no backend for core play.

Provider calls belong in a worker-capable adapter. The first implementation may
run bounded inference on the main thread only while measured tasks remain under
the 50 ms long-task ceiling; worker migration is required if real-frame
profiling or combined work breaks that budget.

## Consequences

- The application scaffold is now authorised.
- Models and WebAssembly are versioned project assets so play can run offline
  after the application is loaded.
- MediaPipe payloads cannot cross the pose adapter.
- Standing and seated modes run separate providers rather than both inference
  graphs concurrently.
- Real-camera movement accuracy, occlusion, low light, and front/back confusion
  remain release evidence gates rather than being inferred from blank frames.
- Tencent or another provider can replace MediaPipe through the same port if
  target-device evidence shows a blocker.

