# Gameplay UI/UX audit

**Status:** Implemented locally; device and usability gates remain open  
**Owner:** Product design  
**Reference when:** Planning or reviewing calibration, rehearsal, scored play,
tracking recovery, and gameplay progress.  
**Agent obligation:** Keep original findings, locally verified implementation,
and open human/device evidence separate. This record does not supersede the
PRD, product decision log, or accepted UI direction.

## Outcome

舞伴 already has most of the state required for natural play, but the active
game does not present it as one coherent feedback loop. The strongest part of
the current experience is movement rehearsal: it shows the camera, the home
position, the active move, repetition progress, and the exact reset action in
one stable workspace. Scored play should inherit that grammar.

The highest-priority defect is more direct: the active game computes a visual
`Centered`, movement-direction, gesture, and `Position unclear` panel, then the
latest KTV-stage CSS clips that panel to a 1 x 1 px visually hidden region. A
sighted player therefore cannot see the state that is meant to answer “Where
am I?” The current browser test confirms that the DOM text exists but never
asserts that the panel is visible.

The recommended direction is a **player-state rail plus movement runway**. It
keeps the four-lane rhythm model, restores a persistent “You” surface beside
the runway, makes phase progress and safety controls stable, and moves
infrequent audio/settings controls out of the player’s main attention path.

## Implementation outcome — 12 August 2026

The product owner approved this audit and the accepted direction is now
implemented in the current worktree:

- the sighted `You` rail is visible and separates framing from the calibrated
  standing start position or seated hand-ready state;
- the centre runway exposes `Later / Next / Ready / Move now`, with stepped
  positions when reduced dynamics is enabled and unchanged audio-clock times;
- four named gameplay phases replace the route-level `08 / 11` counter during
  scored play;
- Pause/Resume remain large and persistent, while narration and volume move to
  a calm paused comfort surface;
- tracking uncertainty says `Not scored` and leaves Pause and Stop available;
- the live-state label has a browser-enforced 24 px minimum, Pause has a 56 px
  minimum, and 1280 x 720 plus 1024 x 720 compositions fit without page scroll;
- active and paused states pass automated axe scans in production Chrome.

This is local automated and visual evidence. It is not real-camera latency,
older-adult comprehension, manual screen-reader, device-performance, or
authenticated-production evidence.

## Scope and evidence

This audit covers the first-time and returning player path from calibration
through scored play, with emphasis on standing and seated state awareness. It
does not change scoring, classifier thresholds, storage, camera privacy, or the
supporter experience.

Evidence reviewed:

- Governing product and UI documents, including the PRD, decision log, current
  project state, vertical-slice specification, accessibility rules, UI
  principles, interaction guidance, and UI decision brief.
- Current React state flow and the calibration, rehearsal, countdown, gameplay,
  cooldown, result, chrome, classifier-view-model, and adaptive-support code.
- The recent merged KTV-stage change in commit `898d00a` / `32087fb`.
- Browser inspection at 1280 x 720, 1024 x 720, and 800 x 720 using the
  labelled synthetic route with reduced dynamics enabled.
- Current E2E assertions around gameplay, position state, accessibility, and
  viewport overflow.

Browser evidence:

- [Calibration at 1280 x 720](../../output/playwright/ui-audit-calibration-1280x720.png)
- [Movement rehearsal at 1280 x 720](../../output/playwright/ui-audit-tutorial-1280x720.png)
- [Scored play with guide open at 1280 x 720](../../output/playwright/ui-audit-gameplay-guide-open-1280x720.png)
- [Scored play with guide collapsed at 1280 x 720](../../output/playwright/ui-audit-gameplay-guide-collapsed-1280x720.png)
- [Scored play at 1024 x 720](../../output/playwright/ui-audit-gameplay-guide-open-1024x720.png)
- [Scored play at 800 x 720](../../output/playwright/ui-audit-gameplay-guide-open-800x720.png)

These images use synthetic landmarks and prove layout only. They do not prove
real-camera accuracy, motion-to-feedback latency, or older-adult usability.

## Product job and player questions

The player’s job is to complete a safe, enjoyable rhythm session without
feeling tested. During every cue, the interface must answer six questions in a
stable order:

1. **What should I do now?**
2. **When should I do it?**
3. **What did the camera understand?**
4. **Am I back at my starting position and ready for the next cue?**
5. **Is this cue being scored, paused, or ignored because tracking is unclear?**
6. **Where am I in the session, and can I pause or stop?**

The current runway answers questions 1 and 2 reasonably well. The hidden
player-state component contains answers to 3 and 4. Tracking overlays answer 5
only after a sustained fault. The HUD answers 6, but competes with the runway
for attention.

## Current flow assessment

Priority key: P0 breaks a required gameplay comprehension or safety contract;
P1 materially weakens continuity or recovery; P2 is a lower-risk refinement.

| Stage | What works | Friction or risk | Priority |
|---|---|---|---|
| Calibration | Large preview, clear silhouette, real progress, one instruction, 100% completion gate | “Position looks good” confirms readiness but does not teach the difference between being visible and returning to the calibrated home position | P1 |
| Movement rehearsal | Best current surface: dominant camera, footprints/hand home, exact reset copy, four-move list, replay/slower/seated recovery | The player-state grammar disappears when scored play begins, creating a new learning burden | P0 |
| Countdown | Large, simple, low decision load | It does not preview the active-play layout or remind the player where the action line/home indicator will be | P2 |
| Scored play | Four stable lanes, 4-5 upcoming cues, text/symbol/shape/position redundancy, visible Pause and Stop, non-blaming feedback | “You” state is visually hidden; camera preview is cropped and small in live mode; progress and controls dominate a large right rail; action-line label is hidden | P0 |
| Tracking recovery | Unscoreable frames do not become misses; sustained loss explains recovery | Full-stage overlay interrupts visual rhythm, while low-confidence grace has no persistent visible state before the overlay | P1 |
| Cooldown/result | Preserves participation, separates unusual-day context from fun score | Active-play state is not carried into a short, comprehensible recap of what went well and what was unscoreable | P2 |

## High-severity findings

### 1. The visible player-position contract is currently broken

`GameplayScreen` renders `live-player-state`, including a five-position
standing compass and a seated gesture symbol. `live-player-state.ts` supplies
plain-language states for:

- calibrated home / neutral;
- left, right, forward, and back movement;
- left palm, right palm, both palms, and index hold;
- unclear tracking and recovery guidance.

The KTV-stage override in `src/app/styles.css` clips this panel to 1 x 1 px.
At 1280 x 720 and 800 x 720, browser measurement confirmed a visible box of
only 1 x 1 px with `clip-path: inset(50%)`.

This contradicts:

- PD-018, which requires a persistent centre/direction compass during play;
- the active UI decision brief, which requires a visible camera-state panel;
- the UI hierarchy rule that current camera/game state must be understandable;
- the user’s stated need to understand where they are relative to centre.

The E2E test at `tests/e2e/player-flow.spec.ts` checks the state attribute and
text content but does not call `toBeVisible()` on the player-state element.
The test therefore passes even when a sighted player cannot see it.

**Recommendation:** restore a persistent, sighted-player “You” surface. It
must remain visible in both expanded and compact play layouts and must have a
visibility assertion in browser coverage.

### 2. “Centered” currently combines two different ideas

The current live state is derived from the movement classifier. Its neutral
state means the player has returned to the calibrated starting pose. It is not
a complete measurement of where the person sits inside the camera frame.

The UI must distinguish:

- **Framing state:** enough required landmarks are visible, one primary player
  is in frame, and tracking is clear enough to score.
- **Home state:** the player has returned to their calibrated neutral feet or
  hand position and the next movement can arm.

Calling both states “Centered” can mislead a player who is at the calibrated
home pose but is drifting near the edge of the camera image. Conversely, a
player can be visually central but still have hands or feet outside the
scoreable frame.

**Recommendation:** use separate labels:

- `In frame` / `Move fully into the outline` for tracking and framing.
- `At start position` / `Return feet to the marks` for standing home.
- `Hands ready` / `Lower hands beside shoulders` for seated home.

Do not promise left/right camera-centering correction until the view model
actually exposes a framing offset rather than only movement direction.

### 3. The live camera monitor does not faithfully show what the detector sees

During live scored play, the KTV override changes the preview to a narrow 4:5
monitor with `object-fit: cover`. The detector still reads the source frame,
but the visible crop may hide feet, hands, or side space that the model uses.
The gameplay screen also does not render the rehearsal landmark/framing
overlay.

This creates a trust problem: the player cannot use the preview to understand
why tracking is clear or unclear.

**Recommendation:** either:

1. show the full uncropped camera aspect with `contain` and a minimal framing
   outline; or
2. replace the decorative crop with a compact, provider-neutral body/hand
   status diagram.

The first option is better for real-camera troubleshooting. The second is
better for focus and privacy. Do not present a cropped feed as if it were the
model’s full field of view.

### 4. Reduced dynamics removes essential continuity without a replacement

The global reduced-motion rules force every transition to 1 ms, including the
runway notes that update position every 100 ms. This turns smooth cue travel
into discrete jumps. The accepted animation guidance requires essential cue
timing to remain understandable through slower bounded motion or redundant
static timing cues.

**Recommendation:** reduced dynamics must change the timing representation,
not merely disable interpolation. Use a stepped beat ladder or three explicit
states—`Next`, `Ready`, `Move now`—with the action line, text, shape, and sound
remaining synchronized.

## Medium-severity findings

### 5. The hierarchy has “Now” and “Next,” but no visible “You”

The runway shows future cues and a bright action line. The HUD repeats the
current move. The bottom feedback line reports the prior outcome. Because the
player-state panel is hidden, the player must infer whether their movement was
seen from short-lived judgment feedback.

The target hierarchy should be:

1. **Now:** current cue at the action line.
2. **You:** current home/movement/tracking state.
3. **Next:** the upcoming cue runway.
4. **Session:** phase, progress, Pause, Stop.
5. **Adjustments:** gentler cues, narration, and volume.

“Now” and “You” are co-primary during movement. The next queue should remain
visible but visually quieter until it approaches the action line.

### 6. The right HUD is too expensive during a four-minute attention task

With the guide open at 1280 x 720, the HUD occupies 320 px across nearly the
entire play height. It contains phase, duplicated current cue, progress, mode,
input, time, Pause, gentler support, narration, and two volume sliders. Most of
these are setup or pause-state decisions rather than per-cue decisions.

Collapsing the guide gives the runway useful space but removes phase, progress,
time, gentler support, and audio controls. The two states therefore switch
between too much and too little rather than preserving the essential middle.

**Recommendation:** keep phase/progress, Pause, Stop, and player state always
visible. Move narration and volume to pre-play settings and the paused state.
Expose `Make cues gentler` as a stable secondary action, with a visible
confirmation of what changed.

### 7. Progress is represented twice with different meanings

The global header remains at `08 / 11` throughout the full four-minute game,
while the HUD shows continuous session progress and a phase label. A player
can reasonably read `08 / 11` as cue or round progress, but it is only the
application route number.

**Recommendation:** hide the 11-step setup counter during timed play. Replace
it with four named, segmented phases:

`Warm-up -> Follow -> Rhythm -> Lantern memory`

Show the current phase, the next phase, and time remaining. Do not expose
clinical or measurement language.

### 8. The action line lost its instruction

The current KTV override hides the `Move now` label and the runway heading.
Experienced rhythm-game players may understand the glowing line, but a first
time older-adult player should not have to infer its meaning.

**Recommendation:** restore a concise `Move now / 现在做` label at the action
line, introduced in rehearsal and countdown so its placement is already
familiar before scoring starts.

### 9. Recognition feedback is duplicated but incomplete

The active screen can show:

- a large short-lived judgment at the action line;
- a persistent feedback sentence below the runway;
- a streak badge;
- the current cue repeated in the HUD.

This creates several feedback surfaces but still omits the durable state
needed to prepare the next movement.

**Recommendation:** use one three-step response:

1. Immediate recognition: `Step seen` or `Tracking unclear`.
2. Reset instruction: `Return both feet to the start marks` or `Lower both
   hands beside your shoulders`.
3. Ready state: `At start position — ready`.

Keep `Good / Nearly / Try the next one` at the action line. Remove the streak
from the first redesign pass; it is not required to solve comprehension and
can make a forgiving activity feel performance-driven.

### 10. The visual world changes abruptly at the most demanding moment

Calibration and rehearsal use the accepted warm paper, ink, and hand-painted
editorial language. Scored play switches to an undocumented dark KTV stage
with a red curtain, saturated lane blocks, rounded arcade notes, and a separate
material system.

The darker field does improve cue contrast, but the transition feels like a
different product and conflicts with PD-013 and the active UI decision brief.

**Recommendation:** preserve the useful darkened-playfield contrast while
expressing it as the same **hand-painted community square at dusk**: inked lane
rules, paper-cut cue plates, oxblood/gold accents, and one consistent type and
edge language. Record a new product decision first if the KTV direction is
intended to supersede the accepted direction.

### 11. Compact laptop behavior needs an explicit support boundary

The game blocks phone-sized movement phases below 761 px, so 800 x 720 remains
playable. At that width, the runway contracts to 276 px while the HUD occupies
272 px. Cue labels and plates become tightly packed and can compete near the
action line.

The current product target remains 1280 x 720 or larger. The redesign should
either provide a real compact gameplay composition at 800-1023 px or clearly
block active play below the verified minimum. A partial desktop squeeze is not
a safe middle state.

## What should be preserved

The redesign should not discard the parts that already serve the player:

- disclosure before camera permission;
- a stable, large Stop action and keyboard-reachable Pause;
- standing and seated modes with separate calibration and home instructions;
- camera-dominant movement rehearsal;
- exact neutral-return copy for feet and hands;
- four stable, mode-specific lanes;
- four to five ordered future cues;
- text, symbol, shape, position, and audio redundancy;
- `Good`, `Nearly`, and `Try the next one` without blaming the player;
- unscoreable tracking periods that do not become misses;
- visibly labelled simulation;
- local-only camera processing and no raw-frame persistence;
- functional motion with an explicit reduced-dynamics path.

## Design approaches considered

| Approach | Shape | Strengths | Risks |
|---|---|---|---|
| **A. Player-state rail + runway** | Compact “You” rail beside a dominant central runway; slim phase bar; Pause/Stop fixed | Best match for current architecture and user need; keeps state visible without putting text over cues; supports standing and seated equally | Requires disciplined removal of nonessential HUD controls during play |
| B. Camera-as-stage | Large live preview with runway and state overlays anchored to the body/home marks | Strong embodiment and obvious framing; reuses rehearsal familiarity | High visual load; camera/cue contrast and crop alignment are harder; more performance and privacy sensitivity |
| C. Minimal arcade runway | Full-screen runway with a small compass/status chip near the action line | Largest cues and lowest layout complexity | Weakest recovery and camera trust; repeats the current mistake if the status chip becomes too small or transient |

**Recommendation:** Approach A. It solves the state-awareness problem with the
smallest architectural and visual change, preserves the runway decision, and
does not require a high-frequency landmark overlay during scored play.

## Recommended gameplay model

### Layout at 1280 x 720

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ Local camera status   Warm-up ━ Follow ─ Rhythm ─ Memory   Pause  Stop │
├───────────────┬─────────────────────────────────────────────────────────┤
│ YOU           │ NEXT                                                    │
│               │        small, quiet future cues                         │
│ In frame      │                                                         │
│ At start      │                    NOW                                  │
│ position      │            current cue at action line                   │
│               │                                                         │
│ [home map]    │            Good / Nearly / Next one                     │
│ Step seen ->  │                                                         │
│ return home   │                                  Make cues gentler      │
└───────────────┴─────────────────────────────────────────────────────────┘
```

The rail is not a debug panel. It is a low-frequency semantic view model that
changes only when the player’s meaningful state changes.

### Player-state contract

| Dimension | Standing presentation | Seated presentation |
|---|---|---|
| Framing clear | `In frame` plus a calm outline | `Hands visible` plus two hand targets |
| Home ready | Centre mark highlighted; `At start position — ready` | Two hand-home marks highlighted; `Hands ready` |
| Movement/gesture seen | Direction cell and label; `Step seen` | Gesture symbol and label; `Gesture seen` |
| Reset required | `Return both feet to the start marks` | `Lower both hands beside your shoulders` |
| Tracking unclear | Amber `Position unclear`; scoring state says `Not scored` | Amber `Hands unclear`; scoring state says `Not scored` |
| Multiple people | `One player inside the outline` | Same rule; no companion score |
| Paused | Freeze cues and show `Paused — continue when ready` | Same behavior |

Every state uses text, shape, and position. Colour remains supporting
information only.

### Phase and progress contract

- Replace `08 / 11` during play with the four gameplay phases.
- Show one segmented progress line with the current phase emphasized.
- Keep time remaining secondary to the phase name.
- Announce a phase change once through visible text and optional fixed-caption
  narration.
- Explain the Lantern hold mechanic before the first memory cue, not only when
  the emoji reaches the action line.

### Feedback and recovery contract

- A correct or near movement gets one short action-line judgment.
- A recognized movement immediately changes the player-state rail to the reset
  instruction.
- Returning home changes the rail to ready without another celebration.
- Unclear tracking never displays a miss, never breaks a visible streak, and
  names whether the affected cue is unscored.
- During the tracking grace window, keep cues moving but show a persistent
  caution state. After sustained loss, dim or freeze the runway while leaving
  Pause and Stop in place.
- Recovery requires stable tracking before scoring resumes and visibly says
  `Ready — scoring resumed` once.

### Reduced-dynamics contract

- No decorative curtain, ambient movement, parallax, camera zoom, or result
  sweep.
- Replace continuous runway interpolation with a three-position beat ladder or
  stepped countdown.
- Keep the action line, cue label, shape, and optional sound synchronized.
- Do not globally shorten every transition if that removes essential temporal
  continuity.

## UX decision brief

- **Job:** Complete a safe rhythm session while always knowing the next move,
  whether the movement was seen, and when the body/hands are ready again.
- **User mode:** First-time and returning adults aged 60-75; standing and
  seated play.
- **Frequency/risk:** Repeated short sessions; physical-safety, camera-trust,
  tracking-error, and health-adjacent interpretation risks.
- **Pattern:** Guided setup followed by a stable instrument-panel playfield.
- **Primary action:** Perform the cue at the action line.
- **Secondary actions:** Pause, stop, make cues gentler.
- **Core path:** calibrate -> learn home -> countdown -> cue -> recognition ->
  reset -> ready -> next cue -> phase completion.
- **Recovery path:** unclear tracking -> unscored state -> one physical recovery
  instruction -> stable reacquisition -> explicit scoring resumed.
- **Required states:** preparing, framed, home-ready, movement seen,
  reset-needed, tracking unclear, multiple people, paused, phase change,
  reduced dynamics, silent practice, synthetic, completed.
- **Handoff constraints:** raw frames remain transient; one primary player;
  seated is a separate interaction model; no clinical language; Stop remains
  persistent; uncertain input is never a miss.

## UI decision brief

- **Surface type:** repeated-use immersive web game.
- **Platform idiom:** laptop-first web at 1280 x 720 or larger.
- **Product thesis:** make `Now`, `You`, and `Next` understandable at one glance.
- **Visual direction:** hand-painted editorial community square at dusk, using
  a darker playfield for contrast without a separate KTV material system.
- **Density:** sparse and stable during play.
- **Hierarchy:** current cue and player state co-primary; upcoming cues
  secondary; phase/progress and safety persistent; settings deferred.
- **Component grammar:** player-state rail, four-lane runway, fixed action line,
  segmented phase bar, short judgment label, pause sheet.
- **Typography:** existing Noto Serif SC display and Noto Sans SC body; gameplay
  labels remain at viewing-distance sizes.
- **Colour/material:** warm near-black dusk field, paper/ink surfaces, oxblood
  action accent, festive gold timing accent, semantic cue colours with shape
  and text redundancy.
- **Motion budget:** functional; audio-clock cue timing, brief recognition,
  phase transition, and explicit reduced-dynamics alternative.
- **Responsive containment:** target the approved 1280 x 720 gameplay viewport;
  require a separately designed compact composition or a clear block below the
  measured support boundary.
- **Assets:** provider-neutral home map, standing/hand framing diagrams,
  paper-cut cue shapes, one rights/provenance-approved lantern icon.
- **State visuals:** home, movement, reset, unclear, paused, phase change,
  synthetic, silent, and completed.
- **Tasteful risk:** the player-state rail resembles a hand-painted floor map,
  restrained by fixed placement, one action accent, and no decorative motion.
- **Bans:** visually hidden state for sighted players, cropped-as-truth camera
  previews, colour-only status, emoji as the final hold asset, full-screen
  error interruption for brief uncertainty, and duplicated current-cue labels.

## Acceptance status

Criteria 1-10 are implemented and covered by unit/component or production-
browser checks in the current worktree. Criteria 11-12 remain open human/device
gates:

1. At 1280 x 720, the current cue, action line, player home/tracking state,
   phase progress, Pause, and Stop are simultaneously visible without page
   scrolling.
2. A sighted player can distinguish `In frame` from `At start position`.
3. Standing and seated modes show separate ready, recognition, and reset copy.
4. The player-state element has a browser assertion for actual visibility, a
   main label of at least 24 CSS px, and a stable width of at least 200 CSS px,
   not only DOM text.
5. Live preview geometry preserves the full detector input aspect or is clearly
   presented as a status diagram rather than the model’s view.
6. Tracking uncertainty visibly says the cue is unscored and never appears as
   an incorrect movement.
7. Reduced dynamics preserves cue timing through a tested static/stepped
   alternative.
8. Phase progress replaces the route-level `08 / 11` counter during play.
9. No state relies on colour alone; Chinese and English labels fit at the
   target viewport.
10. No gameplay surface claims support below its measured layout boundary.
11. Real-camera runs measure motion-to-feedback against the existing p95
    budget and separately validate standing and seated comprehension.
12. Older-adult observation asks players to identify where they are, what to do
    now, whether the game saw it, and how to recover without facilitator hints.

## Remaining validation sequence

1. Run representative standing and seated real-camera sessions on the demo
   laptop, including the existing timing and recovery evidence capture.
2. Observe adults aged 60-75 identifying `Now`, `You`, `Next`, home/reset, and
   tracking recovery without facilitator hints.
3. Complete manual VoiceOver, forced-colour, target-device performance, and
   authenticated-production smoke before release claims.

## Open release gates

This audit does not close:

- KI-002 real-camera front/back discrimination evidence;
- KI-009 older-adult usability sessions;
- KI-011 demo-laptop camera, lighting, tracking-loss, timing, and recovery
  evidence;
- final rights/provenance approval for generated visual assets;
- authenticated production smoke.
