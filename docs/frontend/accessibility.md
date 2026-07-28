# Accessibility

**Status:** Binding  
**Owner:** Product design and frontend engineering  
**Reference when:** Designing, implementing, or testing any user-facing flow.  
**Agent obligation:** Target WCAG 2.2 AA as a baseline and apply the stronger
older-adult requirements below.

## Interaction

- All non-camera functionality is keyboard operable.
- Focus order follows the visual task order.
- Focus is visible and not obscured by sticky controls or overlays.
- No drag-only operation.
- Controls have visible labels matching accessible names.
- Player controls target at least 44 x 44 CSS px.
- Pause/Stop is reachable by pointer and keyboard.

## Visual

- Text contrast meets AA; important icons and focus indicators meet non-text
  contrast.
- Do not rely on colour alone.
- Support 200% text zoom on non-gameplay reading surfaces without lost content.
- Avoid thin weights and background text over detailed Miora art without an
  opaque surface.
- Keep cue targets large and separated.

## Audio and captions

- Spoken instruction has synchronized visible text.
- Music and instruction volumes are independently controllable where feasible.
- Do not require hearing to distinguish a cue.
- No autoplay before the player initiates the session.

## Motion

- Respect `prefers-reduced-motion`.
- Provide a product-level reduced-motion control because gameplay contains
  intentional motion.
- Essential cue timing may move, but decorative parallax, camera sweeps, and
  celebration motion are removed or reduced.
- No flashing content above safe thresholds.

## Camera alternatives

- Explain why camera interaction is essential to scoring.
- Provide spectator/fallback demonstration, not a fake accessible equivalent
  to a movement session.
- Seated hand/finger mode has separate instructions and reachable controls.

## Testing

- Automated accessibility scan.
- Keyboard-only route.
- Screen-reader smoke for disclosure, settings, result, progress, and sharing.
- Contrast and zoom.
- Reduced motion.
- Older-adult usability observation.

Accessibility failures affecting consent, Pause/Stop, or core comprehension are
release blockers.
