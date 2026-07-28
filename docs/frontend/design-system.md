# Design system

**Status:** Proposed token contract; visual values require Miora/UI approval  
**Owner:** Product design  
**Reference when:** Creating visual assets, CSS, or components.  
**Agent obligation:** Use semantic tokens and preserve the "community square at
golden dusk" direction without hard-coding one asset palette into behavior.

## Token model

Use semantic tokens:

```text
color.bg.canvas
color.bg.surface
color.bg.overlay
color.text.primary
color.text.secondary
color.action.primary
color.action.secondary
color.feedback.success
color.feedback.caution
color.feedback.error
color.cue.left/right/front/hold
color.focus
```

Every cue colour has a shape, label, and position counterpart.

## Spacing and shape

- Base spacing unit: 4 px.
- Preferred steps: 4, 8, 12, 16, 24, 32, 48, 64.
- Player controls: at least 44 x 44 CSS px; prefer 56+ at laptop distance.
- Use a small radius scale; avoid a different radius on every card.
- Borders indicate grouping or state, not decoration.

## Typography

- Use a Simplified Chinese UI font with reliable system fallback.
- Gameplay body text: minimum 24 px at target distance.
- Supporter/detail text: minimum 18 px.
- Cue labels and countdown: size by viewing distance, not generic web defaults.
- Avoid light font weights and all-caps Latin text.
- Keep line length near 45-70 Chinese characters/Latin equivalents on reading
  surfaces.

## Visual hierarchy

- One high-emphasis action colour.
- Neutral surfaces dominate; festive accents mark cue and celebration moments.
- Error red does not imply health danger.
- Charts use direct labels and avoid legends where possible.

## Dark mode

Dark mode is not an MVP requirement. If added, implement through tokens,
re-test contrast and cue discrimination, and never invert camera/video content
as a shortcut.

## Skeletons

Use skeletons only for stable, known content geometry lasting perceptibly long.
Do not use skeletons for camera permission, calibration, or notification sends;
show the actual step and progress instead.

## Asset rule

Miora outputs are source assets, not design tokens. Crop, compress, and place
them through approved components. Record provenance in
`integrations/ai-creation-provenance.md`.
