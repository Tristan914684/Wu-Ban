# Frontend performance

**Status:** Binding  
**Owner:** Frontend and gameplay engineering  
**Reference when:** Changing rendering, assets, route loading, or browser work.  
**Agent obligation:** Protect cue timing and interaction responsiveness before
visual richness.

## Main-thread budget

- Avoid tasks longer than 50 ms during gameplay.
- Separate pose inference from render work when supported.
- Bound frame processing and discard stale work.
- Do not trigger framework-wide rerenders on each pose frame.
- Keep high-frequency pose state outside generic global stores.

## Rendering

- Use imperative canvas/game rendering for high-frequency visuals if component
  reconciliation cannot meet measured budgets.
- UI framework state updates at human-facing frequency, not camera FPS.
- Precompute cue geometry and chart indexes.
- Animate transforms/opacity; avoid layout-triggering properties in the game
  loop.

## Assets

- Export Miora assets at required dimensions.
- Prefer modern compressed formats with transparent fallback needs considered.
- Use sprite sheets only when measured request/decode cost improves.
- Preload the core track, guide, cue icons, and fallback trace.
- Lazy-load supporter dashboard and nonessential environments.

## Loading perception

- Show explicit asset/model download progress when it can take seconds.
- Allow retry and explain offline limitations.
- Never display a fake progress percentage.
- Keep calibration unavailable until model and audio readiness are real.

## Bundle governance

Every runtime dependency addition records compressed size and critical-route
impact. A large pose model is isolated and cached where allowed; do not ship two
providers in the default bundle merely to preserve optionality.
