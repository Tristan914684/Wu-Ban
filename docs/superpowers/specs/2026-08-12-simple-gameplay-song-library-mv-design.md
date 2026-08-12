# Simple Gameplay, Song Library, and Mo Li Hua MV Design

**Status:** Approved and implemented locally; manual release evidence open

**Date:** 12 August 2026

**Scope:** Player song selection and the scored-gameplay surface

## Problem

The current scored-play screen explains too much at once. The player sees a
position panel, `Now` heading, timing scale, numbered cue markers, feedback,
four named phases, mode/input details, and several helper sentences. Although
the information is useful, the combined density makes the game harder to scan
from laptop distance, especially for adults aged 60–75.

The MVP also has one rights-traced procedural `茉莉花 (Mo Li Hua)` track but no
visible song-library concept and no matching music video. The hackathon should
demonstrate a scalable library without pretending that unavailable songs or
unlicensed media are playable.

## Accepted Experience

- The product exposes a real song-library surface.
- `茉莉花` is the only enabled and playable song for the hackathon.
- Future-song cards are visible, subdued, disabled, and labelled `Coming
  soon`; they do not imply that audio or video assets are already licensed.
- Selecting `茉莉花` leads into the existing camera, safety, calibration,
  tutorial, countdown, gameplay, and result flow.
- Scored play becomes a full-stage Mo Li Hua video with large falling movement
  icons and only essential visible words.
- The current cue, player location, Pause, Stop, and tracking recovery remain
  immediately understandable.
- Reduced dynamics simplifies cue travel only. The MV continues playing
  normally, as explicitly approved by the product owner.

## UX Decision Brief

- **Job:** Choose familiar music and follow one safe movement at a time.
- **User mode:** First-time or returning older adult using a laptop at viewing
  distance.
- **Frequency/risk:** Repeated short play; movement, camera, visual-motion, and
  media-rights risk.
- **Pattern:** Simple catalog selection followed by an immersive rhythm stage.
- **Primary actions:** `Play Mo Li Hua` in the library and `Pause` during play.
- **Secondary actions:** Back, Stop, and comfort controls while paused.
- **Core path:** Home -> song library -> existing setup -> dance -> result.
- **Recovery:** Disabled songs explain availability; MV failure uses its poster;
  tracking loss gives one short positioning action and pauses scoring.
- **Handoff constraints:** One primary action per surface, no raw media storage,
  no commercial MV, no fake playable songs, standing and seated parity.

## Song Library

The library uses a catalog model rather than hard-coded card markup. Each song
definition has a stable ID, bilingual title, duration, availability, cover,
chart/audio identity, and optional MV metadata. Availability determines both
visual state and actionability.

The first catalog contains:

1. `茉莉花 / Mo Li Hua` — available and selected.
2. Three future-classic candidates — visible as `Coming soon`, disabled,
   excluded from keyboard focus, and explicitly marked as pending rights
   review. No audio, chart, or MV is bundled for them.

The library gives `茉莉花` one large cover, a clear selected state, approximate
four-minute duration, standing/seated support, and one 64 px-or-larger play
button. Future cards are smaller and visually quiet. The screen must not use
fine-print licence explanations; a short `More songs after rights review`
message is sufficient.

The selection lives outside the active session state. Opening the library does
not request the camera or prepare audio. Starting the enabled song enters the
existing session flow, preserving the local-first and safety gates.

## Minimal Gameplay Stage

The MV fills the gameplay stage behind the movement lanes. A warm dark scrim
and subtle edge vignette protect cue contrast without hiding the video. The
existing audio-clock chart remains the source of cue timing and scoring.

Visible during ordinary play:

- one current action: a 128–160 px symbol with a 56–72 px one- or two-word
  label;
- four large upcoming cue symbols, at least 112 px at 1280 x 720;
- one compact `You` location widget with a large centre/direction symbol and
  one short state label;
- one 64 px-or-larger Pause control and the existing large Stop action;
- one four-dot phase indicator and a simple remaining-time value;
- one-word feedback such as `Good`, `Nearly`, `Next`, or `Not scored`.

Removed from ordinary visible play:

- `Now`, `Up next`, and the four written timing-stage labels;
- cue order numbers;
- written lane names;
- mode and input definition lists;
- the full named phase rail;
- framing and cue-support helper paragraphs;
- the always-visible `Make cues gentler` control.

The pause surface owns cue support, narration, and volume. Detailed privacy and
tracking explanations remain available in setup, pause, error, and assistive
text rather than competing with live cues.

## MV Art Direction and Asset Contract

The Mo Li Hua MV is a project-authored, locally bundled visual rather than an
official or commercial recording. It uses slow hand-painted scenes of jasmine
buds, white blossoms, ink-wash branches, warm dusk, and a quiet community
square. It contains no performer likeness, brand mark, borrowed footage, lyric
text, or embedded audio.

The video:

- is muted, inline, and started only after the player's existing session
  action;
- loops across the four-minute procedural arrangement;
- pauses and resumes with gameplay;
- re-aligns to the session clock after start or resume when needed;
- never becomes the scoring clock;
- keeps playing under reduced dynamics;
- uses a locally bundled poster if decoding or playback fails;
- has no flashing cuts, camera shakes, rapid zooms, or high-frequency motion.

Generated source imagery, prompts, tool/model information, dates, edits,
checksums, final media paths, and attribution are recorded under the existing
asset-rights and AI-provenance gates before the MV is treated as releasable.

## States and Recovery

- **Unavailable song:** disabled card plus `Coming soon`; no click, keyboard,
  audio, or camera side effect.
- **Selected song:** shape, border, check mark, and text communicate selection.
- **MV preparing:** poster remains visible behind the cues.
- **MV playback failure:** poster remains; music, cues, scoring, Pause, and Stop
  continue. The session is not invalidated because the audio clock is intact.
- **Tracking lost:** a large body/hand icon, one short recovery instruction,
  and `Not scored`; verbose explanation is assistive or paused content.
- **Paused:** MV, audio, timer, and cues stop together. Resume restores them.
- **Reduced dynamics:** MV behavior is unchanged; continuous falling cues use
  the existing stable timing steps.

## Accessibility and Elderly-First Floors

- Gameplay text never falls below 28 px; the current cue is at least 56 px.
- Gameplay controls are at least 64 x 64 CSS px.
- Cue icons are separated, high contrast, and distinguishable by symbol, shape,
  position, and accessible name.
- Essential text sits on opaque or strongly scrimmed surfaces, never directly
  over a detailed bright frame.
- Focus order follows library selection, play, Pause/Resume, and Stop.
- The 1280 x 720 and 1024 x 720 gameplay layouts fit without page scrolling.
- The song library remains readable at 200% equivalent text zoom.
- Seated gameplay uses hand-specific symbols and the same size floors.
- MV content is slow and non-flashing even though it remains active under the
  reduced-dynamics preference.

## Architecture

- A domain-level song catalog owns identifiers and availability metadata.
- The library UI consumes the catalog and emits a selected song ID.
- `App` owns the selected song for the current session and resolves the
  existing chart/audio implementation from that ID.
- A focused gameplay-background component owns MV element lifecycle and poster
  fallback. It receives playback and elapsed time but cannot alter scoring.
- `GameplayScreen` composes the background, minimal cue layer, player-location
  widget, progress dots, and recovery overlays.
- The current `SessionClock`, chart, classifiers, movement capture, scoring,
  storage, privacy, and trend contracts remain unchanged.

No dependency, backend, schema migration, external video service, or network
media request is introduced.

## Verification

- Catalog tests prove that only `茉莉花` is playable and future songs cannot
  trigger selection.
- Library component tests cover bilingual labels, large controls, selected,
  disabled, and keyboard behavior.
- MV component tests cover start, pause, resume, clock re-alignment, reduced
  dynamics, decode failure, and poster fallback.
- Gameplay component/browser tests assert the removed explanatory copy stays
  absent, essential controls and icons meet size floors, and the player
  location remains visible.
- Production-browser tests cover the library-to-game path, standing and seated
  cues, tracking loss, pause/resume, reduced dynamics with the MV still
  playing, axe, 1280 x 720, 1024 x 720, and 200% library reading.
- Bundle/media budgets and documentation validation run with the complete
  repository gate.

Manual older-adult comprehension, real-camera, real-device video decoding,
music/video comfort, and final asset-rights review remain release evidence,
not automated proof.

## Risk and Rollback

The main risks are cue contrast over moving imagery, video decode performance,
motion discomfort, and a fake-looking future catalog. The design limits these
with a strong scrim, slow footage, one active song, honest disabled states,
poster fallback, no external streaming, and unchanged scoring/audio timing.

The feature can be rolled back by removing the catalog route and MV background
while retaining the existing chart, audio clock, scoring, and session records.
No persisted-data migration is required.
