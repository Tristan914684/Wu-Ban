# Architecture fitness functions

**Status:** Proposed checks until application scaffold  
**Owner:** Engineering lead  
**Reference when:** Configuring lint/CI or reviewing architecture drift.  
**Agent obligation:** Implement these checks with the selected tooling; do not
weaken a rule to accommodate a violating module.

## Import boundaries

Automate:

- `domain` imports no `application`, `adapters`, `features`, `ui`, browser, or
  vendor package.
- `application` imports domain and port contracts, not concrete adapters.
- `ui` imports no feature/domain decision logic.
- features do not deep-import other feature internals.
- no circular production imports.

## Data safety

Static/search checks plus tests should prevent:

- storage or network calls with `ImageData`, `VideoFrame`, `MediaStream`,
  canvas blobs, or provider raw frame types;
- raw contact/message fields in logs;
- secrets referenced in client modules;
- simulated fixtures imported by production composition.

## Domain invariants

Automated tests:

- invalid/excluded sessions never update trend;
- source metadata survives every persistence/serialization path;
- one trend owner per session;
- revocation blocks sends;
- duplicate check-in command sends once;
- low-confidence frame is unscoreable, not miss;
- audio clock controls cue time.

## Complexity and size

Lint warnings at agreed complexity/size budgets. A reviewed exception names why
cohesion is better than splitting.

## Contract drift

- schema/chart fixtures validate current and previous supported versions;
- localization keys are complete;
- environment schema matches `.env.example`;
- dependency licence inventory is generated for release.
