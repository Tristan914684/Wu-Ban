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
- Hierarchy: the current instruction or cue is primary during setup. During
  scored play, a warm-paper `You` rail, dominant `Now / Next` runway, and quiet
  four-phase session rail remain visible together. The current cue is largest;
  the next four to five authored cues approach a fixed action line. During camera rehearsal,
  the camera is the central proof surface; the
  current cue, move progress, centre/home guidance, and quality status sit in
  compact overlays rather than displacing it. During scored play, the playfield
  spans the available centre column without displacing the player-state rail.
  A persistent camera-state panel beside the runway separates framing from the
  calibrated home position and makes left,
  right, forward, back, gesture, and unclear states explicit in text and a
  position compass.
- Component grammar: stable playfield, four ruled movement lanes, ordered cue
  markers, imperfect ruled sections, status bands, definition lists, a compact
  Display and comfort disclosure, and one primary action. No interchangeable
  metric-card grid.

## Type, colour, and material

- Display: self-hosted Noto Serif SC variable.
- Body: self-hosted Noto Sans SC variable.
- Distance-reading floor: immediate player-state labels are at least 24 CSS px;
  Pause/Resume are at least 56 CSS px, and supporting gameplay copy is enlarged
  before decorative content is retained.
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
- Techniques: CSS focus/state transitions, audio-clock-derived cue travel on a
  bounded perspective runway, beat pulse, countdown, and one short result
  flourish.
- Library: CSS and the Web Animations/Web Audio platform APIs; no motion
  dependency.
- Why this fits: the game needs timing and recovery motion, while repeated
  screens need stability and low main-thread cost.
- Reduced motion: remove ambient movement and sweeping transitions; replace
  continuous cue travel with stable `Later / Next / Ready / Move now` steps
  while preserving the audio-clock cue time, target, text, shape, and sound.
- Preference placement: language and reduced dynamics live in the header's
  compact Display and comfort disclosure; language is an explicit two-choice
  control and reduced dynamics is a persistent on/off switch.
- Camera setup and rehearsal use a functional, high-contrast landmark skeleton
  plus plain-language detected-part status. Standing shows shoulders, hips,
  knees, and ankles over a body target; seated replaces that target with two
  hand zones and draws the detected hand joints. This diagnostic layer is
  stable, non-decorative, and does not animate independently of the live input.
- Rehearsal marks the centre/home position with a persistent axis and
  footprints or seated marker. Every repetition begins from that neutral home
  position and only another neutral return can arm the following repetition.
  After a counted movement, feedback names the exact reset action: feet return
  to the centre marks in standing mode; hands lower beside the shoulders in
  seated mode. Replay and pace controls use the side rails to preserve camera
  height.
- Scored standing play treats a fresh ankle-first step as a bounded movement
  event, keeps it available through the brief centre return, and consumes it
  for at most one cue. The same centre return re-arms the next event. The
  visible camera-state compass updates only when the semantic position changes
  and uses short CSS state transitions rather than decorative motion.
- Rejected: scroll hijacking, smooth scrolling, parallax, custom cursor,
  animated background particles during play, and floating cards.

## Responsive containment

- Primary target: 1280 x 720 and larger laptop viewport.
- At laptop widths, the header, display type, vertical spacing, controls, and
  non-essential artwork respond to viewport height so the primary setup
  journey fits without page scrolling down to a 650 px-tall viewport. Controls
  remain at least 44 px and body copy remains readable.
- Setup screens without an aside span the available editorial grid rather than
  reserving an empty visual column. Split screens keep the supporting visual in
  the right-hand region until the content itself requires stacking.
- The rehearsal camera remains visually dominant in the main practice region
  from the 1280 x 720 target down to the supported 800 x 720 compact laptop
  width; its action/reset rail stays beside it, and secondary detail collapses
  before the proof surface is displaced or clipped.
- Scored play uses three columns at 1280 x 720 and a separately composed
  two-column-plus-phase-row layout at 1024 x 720. Both keep the visible player
  state, action line, Pause, Stop, and phase progress without page scrolling.
- Compact reading: player setup stacks vertically; gameplay is unavailable on
  phone-sized viewports and offers a spectator explanation.
- Wide/TV: preserve the 16:9 playfield and increase type/targets within safe
  margins; controls remain on the laptop.
- Long labels wrap; no page-level horizontal scrolling.
- Detailed progress, privacy, and stored-record surfaces retain normal document
  scrolling when their content is genuinely longer than the viewport or text
  is zoomed; do not replace it with nested scroll panels.

## Asset plan

- Needed: movement-lane cue shapes, community-square key art, movement guide
  poses, paper/ink texture, model/music notices, and real product screenshots
  for the submission.
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
- Memorable anchor: a hand-painted movement runway crossing a golden-dusk
  community square.
