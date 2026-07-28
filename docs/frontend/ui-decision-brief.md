# UI decision brief

**Status:** Active implementation direction  
**Owner:** Product design and frontend engineering  
**Reference when:** Building or reviewing the player and supporter surfaces.  
**Agent obligation:** Preserve the product-specific hierarchy and restrained
motion; do not drift into a generic dashboard or childish fitness game.

## Direction

- Surface type: repeated-use web product with an immersive game playfield and a
  later single-column supporter view.
- Platform idiom: laptop-first web.
- Product thesis: make one safe next movement unmistakable while the camera,
  cue timing, uncertainty, and Stop control remain understandable.
- Visual direction: hand-painted editorial, translated into a warm Chinese
  community-square setting at golden dusk.
- Creative world: fibrous rice paper, visible ink edges, painted sunset light,
  lantern targets, and calm public-square geometry.
- Density: sparse during player flow; balanced on results and supporter views.
- Hierarchy: the current instruction or cue is primary, the concrete next
  action is second, and camera/quality status is peripheral but visible.
- Component grammar: stable playfield, imperfect ruled sections, status bands,
  definition lists, a compact Display and comfort disclosure, and one primary
  action. No interchangeable metric-card grid.

## Type, colour, and material

- Display: self-hosted Noto Serif SC variable.
- Body: self-hosted Noto Sans SC variable.
- Fallbacks: platform Chinese serif/sans families remain available if font
  loading fails.
- Canvas: warm paper `#f1ece2`; ink `#1a1614`; secondary ink `#4a4339`;
  rule `#c4baa8`; single oxblood action accent `#6b1f1f`.
- Festive gold and cue hues are semantic gameplay feedback, never decoration
  alone; each cue also has shape, text, and position.
- Material language: rough fine rules, paper fibre, opaque paper surfaces,
  hand-painted geometry, and print-like offset edges, without glassmorphism or
  soft elevation shadows.

## Interaction decision

- Budget: functional.
- Techniques: CSS focus/state transitions, bounded cue approach, beat pulse,
  countdown, and one short result flourish.
- Library: CSS and the Web Animations/Web Audio platform APIs; no motion
  dependency.
- Why this fits: the game needs timing and recovery motion, while repeated
  screens need stability and low main-thread cost.
- Reduced motion: remove ambient movement and sweeping transitions; retain
  slower bounded cue position, static targets, text, shape, and audio.
- Preference placement: language and reduced dynamics live in the header's
  compact Display and comfort disclosure; language is an explicit two-choice
  control and reduced dynamics is a persistent on/off switch.
- Camera setup and rehearsal use a functional, high-contrast landmark skeleton
  plus plain-language detected-part status. Standing shows shoulders, hips,
  knees, and ankles over a body target; seated replaces that target with two
  hand zones and draws the detected hand joints. This diagnostic layer is
  stable, non-decorative, and does not animate independently of the live input.
- Rejected: scroll hijacking, smooth scrolling, parallax, custom cursor,
  animated background particles during play, and floating cards.

## Responsive containment

- Primary target: 1280 x 720 and larger laptop viewport.
- At laptop widths, the header, display type, vertical spacing, controls, and
  non-essential artwork respond to viewport height so the primary setup
  journey fits without page scrolling down to a 650 px-tall viewport. Controls
  remain at least 44 px and body copy remains readable.
- Compact reading: player setup stacks vertically; gameplay is unavailable on
  phone-sized viewports and offers a spectator explanation.
- Wide/TV: preserve the 16:9 playfield and increase type/targets within safe
  margins; controls remain on the laptop.
- Long labels wrap; no page-level horizontal scrolling.
- Detailed progress, privacy, and stored-record surfaces retain normal document
  scrolling when their content is genuinely longer than the viewport or text
  is zoomed; do not replace it with nested scroll panels.

## Asset plan

- Needed: lantern cue shapes, community-square key art, movement guide poses,
  paper/ink texture, model/music notices, and real product screenshots for the
  submission.
- Source: CSS for functional cue geometry and paper/ink texture; Miora for
  final environment and guide art after provenance capture; self-hosted
  licensed fonts and models.
- Licence risk: Miora terms snapshot and every final checksum remain required.
- Bans: stock seniors, generic AI blobs, unlicensed Chinese motifs, placeholder
  imagery, and assets that obscure instructions.
- Tasteful risk: the playfield is framed like an asymmetric, hand-painted
  festival programme, restrained by one accent, stable control placement, and
  no decorative motion during scoring.

## State visuals

- Empty: explain how a session begins and where derived history comes from.
- Loading: name the model or audio asset actually loading.
- Permission: plain disclosure before the browser prompt.
- Partial: keep participation credit while identifying unscoreable periods.
- Error: what happened, why the segment will not count, and one recovery.
- Success: celebrate completing the session and offer one next action.
- Long-running: show the current preparation stage with a safe cancel.
- Simulation: persistent `模拟演示 / SIMULATED` treatment at every consumer.

## Quality bar

- Specific job: complete a safe movement-and-attention dance session.
- Proof surface: live/synthetic camera status, authored cues, quality-aware
  result, and local history.
- Required states: disclosure, loading, permission, denied, tracking lost,
  paused, invalid, result, and simulated.
- Scan-speed decision: one task and one action per player screen.
- Memorable anchor: hand-painted lantern cues on fibrous paper at golden dusk.
