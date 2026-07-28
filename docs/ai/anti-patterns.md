# AI and code anti-patterns

**Status:** Binding prohibition list  
**Owner:** Engineering lead  
**Reference when:** Planning, implementing, or reviewing.  
**Agent obligation:** Reject these patterns or record an approved exception in
an ADR with containment and exit criteria.

## Architecture

**DO NOT:**

- Create `utils`, `helpers`, `common`, or `services` dumping grounds.
- Import React, browser APIs, SDKs, IndexedDB, or HTTP into domain modules.
- Route every feature through a global event bus.
- Add a repository layer with no persistence boundary.
- Create interfaces for every class "just in case."
- split a cohesive small module into micro-files with no independent ownership.
- make cloud availability a prerequisite for local gameplay.

## State and async

**DO NOT:**

- Mirror the same state in component, global store, URL, and persistence.
- Store derived values that can be calculated cheaply and reliably.
- fire-and-forget consent, persistence, or caregiver-send operations.
- retry non-idempotent writes blindly.
- use wall-clock time for beat scoring.
- let late pose results mutate a completed or different session.

## Product shortcuts

**DO NOT:**

- Turn a fun score into a health score.
- Treat a tracking failure as a player failure.
- hide simulated data in a realistic dashboard.
- send notifications to a caregiver chosen by the system.
- infer consent from camera permission.
- describe adults aged 60-75 as universally frail, active, proud, or
  technologically incapable.

## UI slop

**DO NOT:**

- Build a marketing-card dashboard where a task flow is needed.
- rely on colour alone.
- use tiny text, low contrast, rapid flashing, or mandatory motion.
- show vague errors such as "Something went wrong."
- add decorative animation that competes with timed cues.
- infantilise players with childish copy or exaggerated praise.

## Testing and delivery

**DO NOT:**

- Assert implementation details when behavior can be tested.
- snapshot large dynamic trees as the primary test.
- mock the unit under test.
- claim a build or live service passed without running it.
- leave debug media, seeded histories, or credentials in a release.
- close an issue because documentation exists when implementation was required.
