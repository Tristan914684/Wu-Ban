# Music and asset rights

**Status:** Binding gate  
**Owner:** Product lead  
**Reference when:** Selecting, generating, editing, bundling, or publishing
music and visual assets.  
**Agent obligation:** No asset enters the product or public demo without
traceable reuse rights and attribution.

## Music decision

Preferred composition: **茉莉花 (Mo Li Hua / Jasmine Flower)**, a traditional
Chinese folk melody familiar to the intended cultural context.

Use the [public-domain score/transcription on Wikimedia
Commons](https://commons.wikimedia.org/wiki/File:Jasmine_barrow.svg) as a
reference. Do not assume that a modern performance, arrangement, soundfont, or
downloaded recording is public domain merely because the folk melody is.

## Safest production route

1. Create a project-owned instrumental arrangement from the public-domain
   melody.
2. Use instruments/soundfonts whose licences allow redistribution and public
   demo use.
3. Export a version with a stable tempo and sections suitable for the authored
   chart.
4. Record the creator, tools, source melody, arrangement date, component
   licences, file checksum, and required attribution.
5. Retain source/MIDI or project files so the rights chain is reproducible.

A short [CC0 synthesized Mo Li Hua demonstration on Wikimedia
Commons](https://commons.wikimedia.org/wiki/File:%E8%8C%89%E8%8E%89%E8%8A%B1-KS%E6%BC%94%E7%A4%BA.opus)
is evidence that reusable recordings can exist, but its 26-second,
parameter-demonstration structure is not the selected game track.

## Implemented music record

**Asset ID:** `DB-MUSIC-001`  
**In-product path:** `src/adapters/audio/browser-session-clock.ts`  
**Type:** Project-authored procedural Web Audio arrangement; no downloaded
recording, sample, soundfont, or performance is bundled.

- Melody reference: Wikimedia Commons `File:Jasmine barrow.svg`.
- Reference author/transcriber: Asoer, 21 March 2011.
- Reference status: Public Domain Mark 1.0; the file page identifies the
  traditional melody as regulated to C major and publishes the LilyPond
  transcription.
- Modifications: transcribed into a 56-quarter-beat monophonic sequence,
  repeated over the four-minute chart at 90 BPM; triangle-oscillator timbre and
  separate sine cue tones were authored for the project.
- Instrument rights: Web Audio oscillators generate the sound; no external
  instrument asset requires redistribution permission.
- Creator/process: Codex-assisted implementation under project-owner direction,
  26 July 2026.
- Attribution: “茉莉花 traditional melody; score reference by Asoer,
  Wikimedia Commons, Public Domain Mark 1.0.”
- Code SHA-256:
  `5884400fe9fbeb2c2a61f2bd2647aa7f8c441b5a7c002b347cf288d7a76025bd`.
- Review: source, duration, and scheduling code reviewed; project-owner
  listening/comfort review on the demo laptop remains required.

## Asset record

For every music, image, animation, font, icon, model, or sound:

- internal asset ID;
- source URL/file;
- creator;
- licence and version;
- allowed commercial/public/demo uses;
- attribution text;
- modifications;
- tool/model version for AI generation;
- reviewer and review date;
- final file checksum and in-product path.

## Reject

- "Royalty free" without licence text.
- Search-result downloads.
- Commercial recordings of traditional songs.
- references whose licence forbids derivatives when editing is required.
- Miora outputs based on unlicensed copyrighted source material.
- fonts or soundfonts without redistribution permission.
