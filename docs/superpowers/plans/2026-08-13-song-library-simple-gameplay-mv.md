# Song Library, Simple Gameplay, and Mo Li Hua MV Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an honest multi-song library with only Mo Li Hua playable, then simplify scored play into a large-icon, video-led stage for older adults.

**Status:** Completed locally on 13 August 2026; manual release evidence remains open.

**Architecture:** A pure song catalog describes playable and pending-rights entries. `App` owns the selected song and routes idle users through a focused library before the existing session flow. A decorative `GameplayMusicVideo` owns muted local-video lifecycle and fallback while the existing audio clock remains authoritative; gameplay retains scoring and tracking but replaces the two side rails with compact overlays.

**Tech Stack:** React 19, TypeScript 6, Vite 8, Vitest, Testing Library, Playwright, vanilla CSS, local MP4/WebP assets, built-in image generation, and FFmpeg 8.

## Global Constraints

- `茉莉花 / Mo Li Hua` is the only playable hackathon song.
- Three future candidates remain disabled, outside keyboard focus, and labelled `Coming soon` plus pending rights review.
- No external streaming, backend, new dependency, schema migration, or network media request.
- The MV is muted, locally bundled, project-authored, non-flashing, and decorative; the existing `SessionClock` remains the scoring clock.
- Pause stops MV, audio clock, timer, and cues; Resume restores and re-aligns them.
- Reduced dynamics simplifies cue travel but never freezes or replaces the MV.
- Gameplay body text is at least 28 CSS px; current cue is at least 56 CSS px; cue icons are at least 112 CSS px at 1280 x 720; gameplay controls are at least 64 x 64 CSS px.
- Preserve standing/seated parity, camera frames in memory only, quality-aware scoring, local summaries, and non-diagnostic trend semantics.
- Keep 1280 x 720 and 1024 x 720 scored play free of page scrolling and keep the song library readable at 200% equivalent zoom.

---

### Task 1: Song Catalog Contract

**Files:**
- Create: `src/domain/music/song-catalog.ts`
- Create: `src/domain/music/song-catalog.test.ts`

**Interfaces:**
- Produces: `SongId`, `SongAvailability`, `SongDefinition`, `SONG_CATALOG`, `DEFAULT_SONG_ID`, and `playableSong(id: SongId): SongDefinition | null`.
- A `SongDefinition` contains bilingual title, duration, mode support, availability, artwork, and optional MV metadata. Pending entries contain no audio, chart, or MV resolver.

- [x] **Step 1: Write the failing catalog tests**

```ts
expect(SONG_CATALOG.filter((song) => song.availability === "available")).toHaveLength(1);
expect(playableSong("mo-li-hua")?.mv?.src).toBe("/media/mo-li-hua-mv.mp4");
expect(playableSong("kangding-love-song")).toBeNull();
expect(SONG_CATALOG.filter((song) => song.availability === "coming-soon")).toHaveLength(3);
```

- [x] **Step 2: Run the focused test and verify RED**

Run: `npx vitest run src/domain/music/song-catalog.test.ts`

Expected: FAIL because the catalog module does not exist.

- [x] **Step 3: Implement the pure catalog**

Use `mo-li-hua`, `kangding-love-song`, `flowing-stream`, and `fengyang-flower-drum` as stable IDs. Only Mo Li Hua receives `audioId: "procedural-mo-li-hua"`, `chartId: "mvp-authored-v1"`, `/media/mo-li-hua-mv.mp4`, and `/media/mo-li-hua-poster.webp`. Each pending song explicitly uses `availability: "coming-soon"` and `rightsStatus: "pending-review"`.

- [x] **Step 4: Run the catalog test and verify GREEN**

Run: `npx vitest run src/domain/music/song-catalog.test.ts`

Expected: PASS.

---

### Task 2: Elderly-First Song Library and App Routing

**Files:**
- Create: `src/features/music/SongLibraryScreen.tsx`
- Create: `src/features/music/SongLibraryScreen.test.tsx`
- Modify: `src/features/onboarding/WelcomeScreen.tsx`
- Modify: `src/app/App.tsx`
- Modify: `src/app/styles.css`
- Modify: `tests/e2e/player-flow.spec.ts`
- Modify: `tests/e2e/accessibility.spec.ts`
- Modify: `tests/e2e/offline.spec.ts`
- Modify: `tests/e2e/progress-sharing.spec.ts`

**Interfaces:**
- Consumes: `SONG_CATALOG`, `DEFAULT_SONG_ID`, `SongId`, and `playableSong` from Task 1.
- Produces: `SongLibraryScreen({ language, selectedSongId, onBack, onSelect, onPlay })`.
- `App` expands `IdleView` with `songs`, stores `selectedSongId`, opens the library from Welcome, and dispatches the existing `BEGIN` or `BEGIN_RETURNING` only after `onPlay` receives an available song.

- [x] **Step 1: Write failing component tests**

Assert that the screen exposes `Choose your song`, one enabled `Play Mo Li Hua` button with a CSS size-floor contract, one selected card, three disabled coming-soon entries, and bilingual pending-rights text. Assert disabled entries cannot call `onSelect` or `onPlay` and are absent from Tab order.

- [x] **Step 2: Run the library test and verify RED**

Run: `npx vitest run src/features/music/SongLibraryScreen.test.tsx`

Expected: FAIL because the component does not exist.

- [x] **Step 3: Implement the library and route**

Use one large Mo Li Hua feature cover with title, four-minute duration, standing/seated support, visible selected state, and one 64 px primary action. Render future candidates as quiet disabled `<article>` surfaces with a lock mark, `Coming soon`, and `Pending rights review`; do not render fake Play buttons. Welcome's primary action opens the library without requesting camera or preparing audio.

- [x] **Step 4: Update browser helpers through the library**

After each existing home start-button click, wait for the song-library heading and click `播放《茉莉花》`. Keep all later disclosure, permission, mode, calibration, tutorial, and gameplay assertions unchanged until Task 5.

- [x] **Step 5: Run focused component and browser tests**

Run: `npx vitest run src/features/music/SongLibraryScreen.test.tsx src/application/session/session-machine.test.ts`

Run: `npx playwright test tests/e2e/player-flow.spec.ts --grep "standing simulated journey"`

Expected: PASS with the library step and no camera side effect before Play.

---

### Task 3: Project-Owned Mo Li Hua Motion Visual

**Files:**
- Create: `public/media/mo-li-hua-poster.webp`
- Create: `public/media/mo-li-hua-mv.mp4`
- Create: `docs/integrations/mo-li-hua-mv-provenance.md`
- Modify: `docs/integrations/ai-creation-provenance.md`
- Modify: `docs/product/music-and-asset-rights.md`

**Interfaces:**
- Produces a silent H.264 MP4 and matching WebP poster at the exact public paths consumed by the catalog.
- The video has no audio stream, uses `yuv420p`, is 1280 x 720, and forms a short seamless-enough loop for the four-minute session.

- [x] **Step 1: Generate the source visual with the built-in image tool**

Prompt a 16:9 hand-painted Chinese ink-and-gouache jasmine scene: white jasmine blossoms and buds in the foreground, quiet golden-dusk community square and soft paper texture behind, adult and calm, broad low-frequency movement-friendly forms, no people, text, logos, lyrics, watermark, harsh strobe contrast, or copied commercial imagery.

- [x] **Step 2: Inspect and copy the selected image into the workspace**

Confirm jasmine subject, calm composition, safe negative space for central cues, and absence of text/brand artifacts. Save the selected source as the poster WebP in `public/media/`.

- [x] **Step 3: Author the local motion visual with FFmpeg**

Create a 24-second 1280 x 720 H.264 loop with slow pan/zoom, restrained luminance drift, no cuts faster than eight seconds, no camera shake, `yuv420p`, `faststart`, and no audio stream. Verify width, height, codec, duration, and audio-stream count with `ffprobe`.

- [x] **Step 4: Record provenance and rights evidence**

Record prompt, built-in tool path, generation date, source and final paths, FFmpeg transformation, SHA-256 checksums, no-audio result, project-owner review gate, and in-product use. Add asset ID `DB-MV-001` to the binding rights record and AI provenance index.

- [x] **Step 5: Run asset validation**

Run: `ffprobe -v error -show_entries stream=codec_name,width,height,codec_type -show_entries format=duration -of json public/media/mo-li-hua-mv.mp4`

Run: `shasum -a 256 public/media/mo-li-hua-poster.webp public/media/mo-li-hua-mv.mp4`

Expected: H.264 video, 1280 x 720, approximately 24 seconds, zero audio streams, and recorded checksums.

---

### Task 4: MV Playback Component

**Files:**
- Create: `src/features/gameplay/GameplayMusicVideo.tsx`
- Create: `src/features/gameplay/GameplayMusicVideo.test.tsx`

**Interfaces:**
- Consumes: `src`, `poster`, `playback: "running" | "paused" | "tracking-lost"`, `elapsedMs`, and `reducedMotion`.
- Produces: a decorative muted `<video>` layer with poster fallback and `data-mv-state` for deterministic tests.
- The component does not receive the session clock object and cannot alter scoring.

- [x] **Step 1: Write failing playback lifecycle tests**

Mock `HTMLMediaElement.play` and `pause`. Assert running and tracking-lost call `play`, paused calls `pause`, Resume sets `currentTime` from `elapsedMs % duration`, error leaves the poster state visible, and both reduced-dynamics values keep the `<video>` present and playing.

- [x] **Step 2: Run the component test and verify RED**

Run: `npx vitest run src/features/gameplay/GameplayMusicVideo.test.tsx`

Expected: FAIL because the component does not exist.

- [x] **Step 3: Implement minimal video lifecycle**

Render `autoPlay`, `loop`, `muted`, and `playsInline`. On paused playback call `pause`; otherwise re-align only when metadata is available and drift exceeds 750 ms, then call `play`. Treat a rejected Play promise or media error as fallback without affecting the session. Keep `reducedMotion` as an asserted data attribute only; never branch to a still frame.

- [x] **Step 4: Run the component test and verify GREEN**

Run: `npx vitest run src/features/gameplay/GameplayMusicVideo.test.tsx`

Expected: PASS.

---

### Task 5: Minimal Large-Icon Gameplay HUD

**Files:**
- Modify: `src/features/gameplay/GameplayScreen.tsx`
- Modify: `src/features/gameplay/GameplayPlayerStatePanel.tsx`
- Modify: `src/features/gameplay/GameplayPlayerStatePanel.test.tsx`
- Modify: `src/features/gameplay/GameplayPhaseRail.tsx`
- Modify: `src/features/gameplay/GameplayPhaseRail.test.tsx`
- Modify: `src/features/gameplay/gameplay.css`
- Modify: `src/ui/components/AppChrome.tsx`
- Modify: `src/ui/components/AppChrome.test.tsx`
- Modify: `tests/e2e/player-flow.spec.ts`
- Modify: `tests/e2e/accessibility.spec.ts`

**Interfaces:**
- Consumes selected Mo Li Hua MV metadata and `GameplayMusicVideo` from Task 4.
- Preserves current chart, cue support, scoring, narrator, camera video ref, tracking loss, pause/resume, and debug evidence.
- Produces a full-stage MV, compact You widget, large current/upcoming cues, four phase dots, short remaining time, and one-word feedback.

- [x] **Step 1: Update tests to the minimal contract and verify RED**

Assert ordinary gameplay does not visibly contain `NOW`, `UP NEXT`, `Later`, `Ready`, cue-order numbers, `MODE`, `INPUT`, full named phases, framing helper paragraphs, or the always-visible gentler control. Assert it exposes the Mo Li Hua MV, compact player location, at least four cue icons, Pause and Stop, four phase dots, and short time. Computed styles meet 112 px icon, 56 px current label, 28 px gameplay text, and 64 px control floors.

- [x] **Step 2: Refactor the player panel into the compact You widget**

Keep the live camera `<video>` as a visually hidden inference input. Show one large centre/direction or seated-hand symbol, one short player-state label, and concise `Not scored` when tracking is unclear. Remove camera preview, privacy sentence, framing helper, support label, and active gentler button from ordinary play.

- [x] **Step 3: Refactor the phase rail into four dots**

Keep semantic `aria-current="step"`, progress semantics, and remaining time accessible. Visually render only four large dots and `M:SS`; remove phase names and side-rail geometry.

- [x] **Step 4: Compose the video-led stage**

Place `GameplayMusicVideo` below the runway. Move the player widget to top-left, Pause to top-right, phase dots/time to the lower edge, and short feedback near the action line. Remove written timing scale, order numbers, lane labels, mode/input context, and helper headings. Retain visually hidden ordered cue text for assistive technology.

- [x] **Step 5: Move cue support into Pause**

Add one large `Gentler cues` control beside fixed-caption narration and volume settings. Preserve `makeCueSupportGentler`. Raise Resume to 64 px and keep Stop at least 64 px during play.

- [x] **Step 6: Implement scoped responsive and contrast styling**

Use a full-width stage at both target viewports, warm dark video scrim, high-contrast opaque cue tokens, large separated icons, no page scroll, and forced-colour fallbacks. Add no motion library. Keep reduced-dynamics timing steps while leaving video unchanged.

- [x] **Step 7: Run focused tests and browser journeys**

Run: `npx vitest run src/features/gameplay/GameplayMusicVideo.test.tsx src/features/gameplay/GameplayPlayerStatePanel.test.tsx src/features/gameplay/GameplayPhaseRail.test.tsx src/ui/components/AppChrome.test.tsx`

Run: `npx playwright test tests/e2e/player-flow.spec.ts tests/e2e/accessibility.spec.ts`

Expected: PASS for standing, seated, tracking loss, pause/resume, reduced dynamics with active MV, axe, target viewport containment, and zoomed library.

---

### Task 6: Product Records, Full Verification, and Visual QA

**Files:**
- Modify: `docs/product/decision-log.md`
- Modify: `docs/frontend/ui-decision-brief.md`
- Modify: `docs/context/current-project-state.md`
- Modify: `docs/documentation/changelog.md`
- Modify: `docs/README.md`
- Modify: `docs/superpowers/specs/2026-08-12-simple-gameplay-song-library-mv-design.md`
- Modify: `docs/superpowers/plans/2026-08-13-song-library-simple-gameplay-mv.md`
- Create: `output/playwright/song-library-1280x720.png`
- Create: `output/playwright/mo-li-hua-gameplay-1280x720.png`
- Create: `output/playwright/mo-li-hua-gameplay-1024x720.png`
- Create: `output/playwright/mo-li-hua-gameplay-paused-1280x720.png`

**Interfaces:**
- Records product decision PD-020: scalable library, one rights-cleared playable song, minimal elderly-first MV stage, and unchanged MV under reduced dynamics.
- Reports only evidence run in this worktree.

- [x] **Step 1: Update authoritative product and UI records**

Record accepted library and MV behavior, size floors, removed gameplay copy, fallback behavior, media rights/provenance, and the explicit reduced-dynamics exception for the MV.

- [x] **Step 2: Run the full verification gate**

Run: `npm run verify:full`

Expected: docs validation, lint, typecheck, all unit/component tests, all integration tests, production build, bundle budget, and all production Chrome journeys pass.

- [x] **Step 3: Capture and inspect target screenshots**

Use the production app and synthetic route to capture library and active/paused gameplay at 1280 x 720 plus active gameplay at 1024 x 720. Inspect cue contrast, cropping, disabled-song honesty, current-action prominence, player position, phase dots, controls, text sizes, and absence of overflow.

- [x] **Step 4: Run final hygiene**

Run: `git diff --check`

Run: `git status --short`

Expected: no whitespace errors; generated build caches are excluded from authored changes; pre-existing user changes remain preserved.

- [x] **Step 5: Mark this plan complete and hand off**

Convert every completed checkbox to `[x]`. Report local automated/browser evidence separately from open older-adult usability, real-camera/device, manual screen-reader/forced-colour, authenticated production, and owner asset-approval gates.
