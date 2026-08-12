# AI creation provenance

**Status:** Binding evidence contract  
**Owner:** AI/creative lead  
**Reference when:** Using Miora, CodeBuddy, a pose model, or another generative
tool.  
**Agent obligation:** Record actual contribution, inputs, human review, rights,
and final use; do not manufacture an AI story after the build.

## Miora record

For each final asset:

- asset ID and in-product path;
- prompt and negative constraints;
- reference assets and their rights;
- tool/model/version if displayed;
- generation date;
- candidate variants;
- selection rationale;
- human edits and editing tool;
- output licence/terms snapshot;
- accessibility review;
- checksum.

Keep a contact sheet that shows prompt -> variants -> chosen asset -> live game.

## CodeBuddy record

For material contributions:

- task and date;
- input context/spec;
- generated approach or code area;
- human corrections;
- tests added/run;
- rejected suggestions and why;
- commit/change reference.

Do not claim CodeBuddy authored code it did not influence. Credentials, private
data, and participant media must not appear in prompts or evidence.

## Runtime AI record

- provider/model/version;
- inputs and outputs;
- device execution or network behavior;
- confidence semantics;
- supported body/hand count;
- limitations;
- licence;
- performance evidence;
- fallback.

### MediaPipe M1 selection - 2026-07-26

- Provider/model/version: MediaPipe Tasks Vision `0.10.35`; Pose Landmarker
  Lite version 1 and Hand Landmarker float16 version 1.
- Inputs and outputs: transient browser video frames in; normalized/world body
  or hand landmarks and confidence metadata out.
- Execution: on-device WebAssembly; models and runtime will be self-hosted.
- Confidence: provider presence, visibility, detection, and tracking
  confidences are translated at the adapter and never treated as health
  certainty.
- Count: one scored primary pose; up to two hands for seated gestures.
- Limitations: preview API, single-person pose model, lighting/occlusion jitter,
  synthetic depth, no metric-accurate depth, and no life-critical use.
- Licence: package and official model cards declare Apache-2.0.
- Performance: blank-frame p95 9.30 ms pose and 15.50 ms hand in headless Chrome
  150 on the development Mac.
- Fallback: visibly labelled synthetic landmark stream; no hidden substitution.
- Evidence: [`m1-technical-proof.md`](../engineering/m1-technical-proof.md).

## Deterministic boundary

Movement rules, scoring, adaptive thresholds, and the prototype trend rule are
documented as deterministic/statistical unless a learned model truly performs
them.

### Codex-assisted music implementation - 2026-07-26

- Task: translate the public-domain `茉莉花` score reference into a stable
  four-minute browser arrangement without using a third-party recording,
  sample, or soundfont.
- Input context: binding music-rights policy, 90 BPM authored chart, Wikimedia
  Commons LilyPond transcription, Web Audio clock adapter.
- Contribution: 56-beat MIDI-note/duration transcription, triangle-oscillator
  melody scheduling, and separate cue tones.
- Human corrections/review: project-owner listening and comfort review remains
  open; the arrangement must not be described as approved before that pass.
- Tests: source URL and 56-beat form are asserted; full verification and
  four-minute real-output drift remain device gates.
- Rejected approach: downloading a modern performance or relying on an
  unverified “royalty-free” recording.

### Codex-assisted Mo Li Hua visual - 2026-08-13

- Asset: `DB-MV-001`, used as the song-library cover and muted gameplay MV.
- Tool: built-in image generation; no model version was exposed in the result.
- Inputs: project-only prompt with no reference image, performer likeness,
  commercial footage, logo, or private/player data.
- Contribution: one original ink-and-gouache jasmine scene with a quiet centre
  for cue contrast.
- Human/local edits: `cwebp` poster conversion and FFmpeg slow pan/zoom into a
  24-second silent H.264 loop.
- Review: source, poster, and a mid-loop frame inspected; project-owner terms,
  cultural, comfort, and device review remain open.
- Evidence: [`mo-li-hua-mv-provenance.md`](mo-li-hua-mv-provenance.md).

## Hackathon evidence pack

Use short, verifiable examples tied to the running product. The evidence pack is
not a dump of private prompts or raw camera data.
