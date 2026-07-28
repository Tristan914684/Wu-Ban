# UI principles

**Status:** Binding  
**Owner:** Product design  
**Reference when:** Designing or reviewing any player or supporter surface.  
**Agent obligation:** Optimise comprehension, safety, and recovery before visual
novelty.

## Experience hierarchy

1. The next safe action is obvious.
2. Current camera/game state is understandable.
3. Feedback helps the player continue.
4. Consent and uncertainty are clear.
5. Visual identity supports, never competes with, the task.

## Player surfaces

- One primary action per screen.
- Demonstrate before explaining.
- Reveal complexity progressively.
- Keep the timed playfield stable.
- Celebrate participation and recovery, not perfect movement.
- Treat tracking uncertainty as a system state.
- Preserve a large Pause/Stop action.
- Do not show a trend warning on the play home screen.

## Supporter surfaces

Use a priority stack:

1. Whose data and sharing status.
2. Plain-language recent pattern.
3. Why the product surfaced it.
4. Data quality and uncertainty.
5. Suggested check-in.

Do not use a grid of decorative KPI cards, clinical colours, or dense tables.

## Required states

Every async or data-bearing surface defines:

- empty;
- loading;
- partial;
- permission;
- recoverable error;
- terminal invalid state;
- success;
- long-running progress/cancel;
- revoked or unavailable access.

## Cognitive load

- One instruction at a time during calibration.
- Persistent placement for primary controls.
- Concrete labels: "Turn on camera," not "Continue."
- No more than four simultaneous gameplay cue concepts in the MVP.
- Use shape, position, text, and sound together.
- Keep technical details behind "Why am I seeing this?"

## Explicit non-patterns

No AI chat, chatbot, conversational onboarding, command palette, table-heavy
dashboard, or gamified health ranking is approved. A future feature needs its
own spec and accessibility model.
