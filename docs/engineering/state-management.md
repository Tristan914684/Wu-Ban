# State management

**Status:** Binding  
**Owner:** Frontend engineering  
**Reference when:** Adding UI, session, persistence, or remote state.  
**Agent obligation:** Give every state one authoritative owner and derive
everything else.

## State categories

- **Ephemeral UI:** open panel, focus, temporary input. Keep local to the
  component/feature.
- **Session state:** calibration, phase, cue, tracking quality, pause. Own in
  one session state machine or reducer.
- **Domain state:** completed session, consent grant, trend result. Create
  through domain/application operations.
- **Durable local state:** repository-backed summaries/preferences.
- **External state:** notification delivery or future sync; access through an
  adapter/query layer.
- **URL state:** role/demo route and shareable non-sensitive navigation only.

## Rules

- Do not copy durable records into a global store and mutate both.
- Derive score display from session events; do not maintain parallel counters
  in multiple components.
- Session transitions are explicit and exhaustive.
- Reset creates a new session identity so late async results are ignored.
- Persist at meaningful boundaries, not every pose frame.
- Do not persist permission status as proof that browser permission remains.
- Simulated mode is explicit in state and cannot be toggled by production data.

## State machine

Expected top-level phases:

`idle -> disclosure -> permission -> mode -> safety -> calibrating -> tutorial
-> countdown -> playing -> cooldown -> completing -> result`

Recoverable substates include tracking lost, paused, and adapter retry. Fatal
clock/identity errors end scoring and mark the session invalid.

## Global state gate

A global state library requires evidence that framework-native state plus a
session reducer and repository/query adapter cannot meet the need. Document the
ownership model before adding it.
