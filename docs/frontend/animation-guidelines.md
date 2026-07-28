# Animation guidelines

**Status:** Binding  
**Owner:** Product design and gameplay engineering  
**Reference when:** Adding movement, transitions, parallax, particles, or
Miora-generated motion.  
**Agent obligation:** Use motion to convey timing, state, or reward; remove it
when it harms tracking, comprehension, comfort, or performance.

## Motion categories

- **Essential:** cue approach, beat pulse, countdown, guide demonstration.
- **Functional:** focus transition, panel reveal, progress change.
- **Celebratory:** result flourish.
- **Decorative:** background parallax, ambient particles.

Essential motion must have a reduced alternative that preserves timing
information through position, scale, text, or audio. Decorative motion is first
to be removed.

## Rules

- Do not animate camera preview geometry during calibration.
- Do not shake, flash, or rotate the whole playfield for errors.
- Avoid motion behind high-attention cues.
- Cap celebration duration and allow skip.
- Pause ambient animation when the tab is hidden or gameplay needs resources.
- Use consistent easing/duration tokens for UI transitions.
- Do not use infinite skeleton shimmer when a determinate state is available.

## Reduced motion

When reduced motion is active:

- remove parallax and ambient particles;
- replace sweeping transitions with fades or instant changes;
- reduce celebration distance/count;
- keep essential cue motion slow and bounded, with redundant static targets;
- retain the player's chosen setting across sessions.

## Verification

Test at normal and reduced motion, on the demo device, while pose inference is
running. A visually pleasing animation that breaks latency budget does not ship.
