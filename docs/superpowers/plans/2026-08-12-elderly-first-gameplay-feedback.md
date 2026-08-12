# Elderly-First Gameplay Feedback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the approved `Now / You / Next` gameplay composition so an
older adult can read the cue, understand what the camera recognized, return to
the calibrated home position, recover from uncertainty, and track session
progress without leaving the main playfield.

**Architecture:** Keep the audio clock, classifiers, scoring, capture latch,
and session state machine unchanged. Extract low-frequency gameplay view
models and focused presentational components from `GameplayScreen`, then place
them around the existing four-lane runway. Keep the live video truthful and
uncropped, move comfort controls into the paused state, and provide a stepped
reduced-dynamics timing representation.

**Tech Stack:** React 19, TypeScript 6, Vite 8, Vitest, Testing Library,
Playwright, semantic HTML, and scoped CSS. No new runtime dependency.

## Global Constraints

- The primary target is Chrome at 1280 x 720 or larger on the demo laptop.
- Gameplay text is at least 24 CSS px where the player must read at distance.
- Interactive targets are at least 44 x 44 CSS px; Pause, Resume, Stop, and the
  main comfort action prefer 56 px or larger.
- Raw camera frames stay transient and are never persisted or transmitted.
- One calibrated primary player owns scoring; uncertainty is unscoreable, not
  incorrect.
- Standing and seated modes retain separate home, recognition, and reset copy.
- The visual direction remains adult hand-painted editorial: warm dusk,
  fibrous paper, ink edges, oxblood, gold, and restrained imperfect geometry.
- Essential timing uses text, shape, position, and optional sound. Reduced
  dynamics removes continuous travel but preserves `Next / Ready / Move now`.
- Pause and Stop remain visible and keyboard reachable throughout scored play.
- No gameplay implementation claim may replace real-camera, older-adult, or
  authenticated-production evidence.

---

## File Structure

- Create `src/features/gameplay/gameplay-cue-view.ts`: pure cue timing-stage,
  runway-position, and phase-view helpers.
- Create `src/features/gameplay/gameplay-cue-view.test.ts`: literal timing and
  reduced-dynamics expectations.
- Create `src/features/gameplay/GameplayPlayerStatePanel.tsx`: semantic standing
  and seated `You` rail, truthful camera/synthetic proof surface, and support
  state.
- Create `src/features/gameplay/GameplayPlayerStatePanel.test.tsx`: real
  component coverage for home, movement, seated, unclear, and camera preview.
- Create `src/features/gameplay/GameplayPhaseRail.tsx`: four named gameplay
  phases, current phase, progress, and remaining time.
- Create `src/features/gameplay/GameplayPhaseRail.test.tsx`: phase semantics and
  accessible progress coverage.
- Create `src/features/gameplay/gameplay.css`: final paper-theatre gameplay
  composition, responsive containment, pause/recovery layers, focus, forced
  colours, and reduced-dynamics styles.
- Modify `src/features/gameplay/live-player-state.ts`: distinguish framing from
  calibrated home and use exact standing/seated reset copy.
- Modify `src/features/gameplay/live-player-state.test.ts`: protect the revised
  player-facing language.
- Modify `src/features/gameplay/GameplayScreen.tsx`: assemble the extracted
  view components, remove streak/guide duplication, expose pause comfort, and
  pass reduced-dynamics cue positions.
- Modify `src/app/App.tsx`: pass the persisted reduced-dynamics state into
  `GameplayScreen`.
- Modify `src/ui/components/AppChrome.tsx`: hide route-level `08 / 11` during
  scored play while preserving the local-camera/simulation and Stop states.
- Create `src/ui/components/AppChrome.test.tsx`: protect the gameplay chrome
  contract.
- Modify `src/app/styles.css`: remove the superseded KTV-stage override and
  leave shared/non-gameplay rules intact.
- Modify `tests/e2e/player-flow.spec.ts`: assert real visibility, phase
  progress, pause comfort, and 1280 x 720 containment.
- Modify `tests/e2e/accessibility.spec.ts`: cover the elderly-first gameplay
  reading order and reduced-dynamics timing labels.
- Modify `docs/frontend/ui-decision-brief.md`,
  `docs/frontend/gameplay-ui-ux-audit.md`,
  `docs/product/decision-log.md`,
  `docs/context/current-project-state.md`, and
  `docs/documentation/changelog.md`: record approved and verified behavior
  without closing device or usability gates.

---

### Task 1: Protect the gameplay chrome and player language

**Files:**
- Modify: `src/features/gameplay/live-player-state.test.ts`
- Modify: `src/features/gameplay/live-player-state.ts`
- Create: `src/ui/components/AppChrome.test.tsx`
- Modify: `src/ui/components/AppChrome.tsx`

**Interfaces:**
- Consumes: `livePlayerState(language, mode, observation)` and
  `AppChromeProps.phase`.
- Produces: exact `At start position`, `Hands ready`, reset, and unclear copy;
  route progress hidden only while `phase === "playing"`.

- [x] **Step 1: Write the failing player-state tests**

```ts
expect(livePlayerState("en", "standing", { kind: "neutral" })).toMatchObject({
  key: "center",
  label: "At start position",
  helper: "Ready for the next gentle step",
});

expect(livePlayerState("en", "seated", { kind: "neutral" })).toMatchObject({
  label: "Hands ready",
  helper: "Make the next hand gesture",
});
```

- [x] **Step 2: Run the focused test and verify RED**

Run: `npm test -- src/features/gameplay/live-player-state.test.ts`

Expected: FAIL because the implementation still returns `Centered` and
`Hands reset and ready`.

- [x] **Step 3: Implement the exact home/framing/reset language**

Change only the view-model strings. Keep the existing state keys so movement
capture and CSS selectors do not change.

- [x] **Step 4: Run the focused test and verify GREEN**

Run: `npm test -- src/features/gameplay/live-player-state.test.ts`

Expected: PASS.

- [x] **Step 5: Write the failing chrome component test**

Render `AppChrome` with `phase="playing"` and assert that `Step 8` / `08 / 11`
is absent while the Stop button and simulation/local-camera status remain.
Render again with `phase="calibrating"` and assert that `05 / 11` remains.

- [x] **Step 6: Run the chrome test and verify RED**

Run: `npm test -- src/ui/components/AppChrome.test.tsx`

Expected: FAIL because `08 / 11` is still rendered during play.

- [x] **Step 7: Hide only the route counter during scored play**

Keep disclosure-through-countdown and cooldown-through-result numbering
unchanged. Do not move Stop or Settings.

- [x] **Step 8: Run both Task 1 tests and verify GREEN**

Run:
`npm test -- src/features/gameplay/live-player-state.test.ts src/ui/components/AppChrome.test.tsx`

Expected: PASS.

### Task 2: Add pure cue and phase view models

**Files:**
- Create: `src/features/gameplay/gameplay-cue-view.test.ts`
- Create: `src/features/gameplay/gameplay-cue-view.ts`

**Interfaces:**
- Produces:

```ts
export type CueTimingStage = "later" | "next" | "ready" | "now";

export interface CueRunwayView {
  readonly progress: number;
  readonly timingStage: CueTimingStage;
}

export function cueRunwayView(
  cueAtMs: number,
  elapsedMs: number,
  lookaheadMs: number,
  reducedMotion: boolean,
): CueRunwayView;

export const GAMEPLAY_PHASES: readonly [
  "warmup",
  "follow",
  "rhythm",
  "memory",
];
```

- [x] **Step 1: Write literal failing tests for normal and reduced timing**

Use hand-derived expectations:

```ts
expect(cueRunwayView(10_000, 5_000, 10_000, false)).toEqual({
  progress: 0.5,
  timingStage: "next",
});

expect(cueRunwayView(10_000, 5_000, 10_000, true)).toEqual({
  progress: 0.34,
  timingStage: "next",
});

expect(cueRunwayView(10_000, 9_800, 10_000, true)).toEqual({
  progress: 0.8,
  timingStage: "now",
});
```

- [x] **Step 2: Run the new test and verify RED**

Run: `npm test -- src/features/gameplay/gameplay-cue-view.test.ts`

Expected: FAIL because the module does not exist.

- [x] **Step 3: Implement clamped continuous progress and four reduced steps**

Map reduced timing stages to stable positions:

```ts
const REDUCED_PROGRESS = {
  later: 0.08,
  next: 0.34,
  ready: 0.62,
  now: 0.8,
} as const;
```

Use remaining-time fractions to assign stages without changing audio-clock cue
times.

- [x] **Step 4: Run the cue-view test and verify GREEN**

Run: `npm test -- src/features/gameplay/gameplay-cue-view.test.ts`

Expected: PASS.

### Task 3: Build the elderly-first `You` rail

**Files:**
- Create: `src/features/gameplay/GameplayPlayerStatePanel.test.tsx`
- Create: `src/features/gameplay/GameplayPlayerStatePanel.tsx`

**Interfaces:**
- Consumes:

```ts
interface GameplayPlayerStatePanelProps {
  readonly language: Language;
  readonly mode: SessionMode;
  readonly source: InputSource;
  readonly playerState: LivePlayerState;
  readonly trackingIssue: TrackingIssue | null;
  readonly cueSupport: CueSupportLevel;
  readonly videoRef: RefObject<HTMLVideoElement | null>;
  readonly onMakeGentler: () => void;
}
```

- Produces: a visible `<aside aria-label="Your position and tracking">` with a
  truthful 4:3 camera preview or synthetic home diagram, separate framing and
  home labels, large compass/gesture state, reset guidance, and cue-support
  confirmation.

- [x] **Step 1: Write the failing standing/seated component tests**

Assert real visible content for:

- standing neutral: `In frame`, `At start position`, and five-position compass;
- standing movement: `Step seen` plus `Return both feet to the start marks`;
- seated neutral: `Hands visible` and `Hands ready`;
- unclear/multiple people: unscored framing guidance;
- camera source: a `Current camera view` video with the component-owned ref;
- synthetic source: no video and a visibly labelled home diagram.

- [x] **Step 2: Run the component test and verify RED**

Run: `npm test -- src/features/gameplay/GameplayPlayerStatePanel.test.tsx`

Expected: FAIL because the component does not exist.

- [x] **Step 3: Implement the semantic component**

Keep it provider-neutral. Do not pass landmarks or perform classification in
the component. Use `aria-live="polite"` only on the concise semantic state, not
on the camera or decorative diagram.

- [x] **Step 4: Run the component test and verify GREEN**

Run: `npm test -- src/features/gameplay/GameplayPlayerStatePanel.test.tsx`

Expected: PASS.

### Task 4: Build the four-phase progress rail

**Files:**
- Create: `src/features/gameplay/GameplayPhaseRail.test.tsx`
- Create: `src/features/gameplay/GameplayPhaseRail.tsx`

**Interfaces:**
- Consumes:

```ts
interface GameplayPhaseRailProps {
  readonly language: Language;
  readonly currentSection: CueSection;
  readonly progress: number;
  readonly remainingSeconds: number;
}
```

- Produces: one labelled progress region with four phase names, current phase,
  total session progress, and remaining time.

- [x] **Step 1: Write the failing phase-rail test**

Render `currentSection="rhythm"`, `progress={0.5}`, and
`remainingSeconds={120}`. Assert four phase labels, `Move to the beat` as the
current step, a `Session progress` progressbar at 0.5, and `2 min remaining`.

- [x] **Step 2: Run the phase test and verify RED**

Run: `npm test -- src/features/gameplay/GameplayPhaseRail.test.tsx`

Expected: FAIL because the component does not exist.

- [x] **Step 3: Implement the phase rail**

Use semantic list and progress elements. Keep English and Simplified Chinese
as complete phrases; do not concatenate translated fragments.

- [x] **Step 4: Run the phase test and verify GREEN**

Run: `npm test -- src/features/gameplay/GameplayPhaseRail.test.tsx`

Expected: PASS.

### Task 5: Assemble the `Now / You / Next` gameplay screen

**Files:**
- Modify: `src/features/gameplay/GameplayScreen.tsx`
- Modify: `src/app/App.tsx`
- Modify: `tests/e2e/player-flow.spec.ts`

**Interfaces:**
- Consumes: `cueRunwayView`, `GameplayPlayerStatePanel`,
  `GameplayPhaseRail`, and `reducedMotion` from `App`.
- Produces: a stable composition with visible state, runway, phase progress,
  Pause, Stop, gentler support, and pause-only narration/volume controls.

- [x] **Step 1: Strengthen the existing browser test before production edits**

Add assertions that:

- `[data-player-state]` is visible and at least 200 CSS px wide;
- `At start position` and `In frame` are visible;
- `Move now` is visible at the action line;
- `08 / 11` is absent during play;
- the four-phase progress region and Pause are visible;
- page height does not exceed viewport height at 1280 x 720.

- [x] **Step 2: Run the focused E2E test and verify RED**

Run:
`npx playwright test tests/e2e/player-flow.spec.ts -g "scored gameplay fills"`

Expected: FAIL because the player-state panel is clipped and the route counter
and old HUD remain.

- [x] **Step 3: Assemble the new components and remove competing UI**

In `GameplayScreen`:

- accept `reducedMotion`;
- use `cueRunwayView` for note position and `data-timing-stage`;
- replace the visually hidden legacy state markup with
  `GameplayPlayerStatePanel`;
- add `GameplayPhaseRail`;
- restore the visible action-line label;
- remove streak and the collapsible guide;
- keep one short judgment and one persistent recovery/reset message;
- keep Pause visible while running;
- render Resume, narration, volumes, and comfort copy inside the paused layer;
- keep tracking-loss recovery separate and non-blaming;
- use a CSS lantern mark rather than an emoji.

In `App`, pass `reducedMotion={reducedMotion}`.

- [x] **Step 4: Run focused unit/component tests and verify GREEN**

Run:
`npm test -- src/features/gameplay src/ui/components/AppChrome.test.tsx`

Expected: PASS.

- [x] **Step 5: Run the focused E2E test and verify behavior before styling**

Run:
`npx playwright test tests/e2e/player-flow.spec.ts -g "scored gameplay fills"`

Expected: assertions pass semantically; visual styling follows in Task 6.

### Task 6: Build the hand-painted dusk visual system

**Files:**
- Create: `src/features/gameplay/gameplay.css`
- Modify: `src/app/styles.css`
- Modify: `src/features/gameplay/GameplayScreen.tsx`

**Interfaces:**
- Consumes: the semantic class and data-attribute structure from Task 5.
- Produces: the approved paper-theatre composition at 1280 x 720 with readable
  focus, forced-colour, short-viewport, and reduced-dynamics behavior.

- [x] **Step 1: Remove the superseded KTV override**

Delete only the block beginning `KTV stage — gameplay visual direction` and
its short-viewport correction. Keep shared setup, rehearsal, result, and
forced-colour styles.

- [x] **Step 2: Add the focused gameplay stylesheet**

Import `./gameplay.css` from `GameplayScreen.tsx`. Implement:

- a warm dusk/near-black stage with fibrous paper and inked lane rules;
- a warm-paper `You` rail at least 220 px wide;
- a dominant runway with 4-5 cues and one explicit action line;
- minimum 24 px player-state and action text;
- 56 px Pause/Resume and comfort actions;
- 4:3 `object-fit: contain` video;
- quiet far cues and high-contrast current cue;
- a stable phase bar and remaining time;
- no page scrolling at 1280 x 720;
- a blocked or separately composed state below the measured gameplay width;
- forced-colours focus/border support;
- stepped reduced-dynamics notes without decorative motion.

- [x] **Step 3: Run component and focused E2E checks**

Run:

```bash
npm test -- src/features/gameplay src/ui/components/AppChrome.test.tsx
npx playwright test tests/e2e/player-flow.spec.ts -g "scored gameplay fills"
```

Expected: PASS.

- [x] **Step 4: Inspect browser screenshots**

Capture and review normal and reduced-dynamics play at 1280 x 720, plus the
approved compact boundary. Check text size, action prominence, cue overlap,
player-state visibility, pause layer, tracking-loss layer, and page overflow.

### Task 7: Complete non-happy and accessibility coverage

**Files:**
- Modify: `tests/e2e/player-flow.spec.ts`
- Modify: `tests/e2e/accessibility.spec.ts`

**Interfaces:**
- Consumes: final gameplay UI and existing synthetic tracking-loss scenario.
- Produces: production-browser regression coverage for visible state,
  recovery, pause comfort, reduced dynamics, standing/seated parity, and
  containment.

- [x] **Step 1: Write failing tests for the remaining contracts**

Add focused assertions for:

- Pause opens a readable comfort layer and Resume returns to the identical
  playfield position.
- Tracking loss shows `Not scored`, retains Pause/Stop, and announces recovery.
- Seated play shows `Hands ready` rather than standing compass copy.
- Reduced dynamics exposes `Next / Ready / Move now` timing stages without
  depending on smooth animation.
- Axe reports no violations on the active and paused states.
- Keyboard focus reaches Pause, Resume, gentler support, narration, volume, and
  Stop in task order.

- [x] **Step 2: Run the new tests and verify RED where coverage is missing**

Run:

```bash
npx playwright test tests/e2e/player-flow.spec.ts -g "pause|tracking|seated"
npx playwright test tests/e2e/accessibility.spec.ts -g "gameplay"
```

Expected: any missing final semantics fail for the asserted reason.

- [x] **Step 3: Make the minimum semantic/style corrections**

Fix only the failing public behavior. Do not change classifier, scoring, audio
clock, storage, or session validity.

- [x] **Step 4: Re-run the focused browser tests and verify GREEN**

Use the same commands. Expected: PASS with a clean browser console.

### Task 8: Reconcile documentation and run the full gate

**Files:**
- Modify: `docs/frontend/ui-decision-brief.md`
- Modify: `docs/frontend/gameplay-ui-ux-audit.md`
- Modify: `docs/product/decision-log.md`
- Modify: `docs/context/current-project-state.md`
- Modify: `docs/documentation/changelog.md`

**Interfaces:**
- Consumes: final verified implementation and screenshots.
- Produces: factual current-state and accepted-decision records that preserve
  open device/usability gates.

- [x] **Step 1: Update product and UI records**

Add an accepted product decision for the `Now / You / Next` hierarchy,
separate framing/home language, visible player-state rail, phase progress, and
elderly-first readability floor. Update the UI brief and audit status to match
the implemented design.

- [x] **Step 2: Update factual project state and changelog**

Describe only behavior verified in the current worktree. Keep real-camera,
older-adult, target-device performance, authenticated production, and asset
provenance gates open.

- [x] **Step 3: Run the full verification gate**

Run: `npm run verify:full`

Expected: documentation, lint, typecheck, all unit/component tests, integration
tests, production build/budget, and all production-browser journeys pass.

- [x] **Step 4: Run final hygiene checks**

Run:

```bash
git diff --check
git status --short
```

Expected: no whitespace errors; only the approved audit, screenshots, plan,
implementation, tests, and documentation changes are present.

- [x] **Step 5: Hand off without overstating evidence**

Report local automated and browser evidence separately from open real-camera,
older-adult usability, device-performance, production, and external-owner
gates. Do not deploy or merge without a separate request.
