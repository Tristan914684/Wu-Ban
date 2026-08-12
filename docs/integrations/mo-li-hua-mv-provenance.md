# Mo Li Hua MV provenance

**Status:** Implemented locally; owner visual, comfort, and release-rights review open  
**Asset ID:** `DB-MV-001`  
**Generated:** 13 August 2026  
**Use:** Song-library cover and muted scored-gameplay background

## Final assets

| Asset | In-product path | Format | SHA-256 |
|---|---|---|---|
| Poster | `public/media/mo-li-hua-poster.webp` | 1280 x 720 WebP | `b4a9479909664417d3cfafa20d69e7aaf3def034d3b365cd9d7ed7dd9c082321` |
| Motion visual | `public/media/mo-li-hua-mv.mp4` | 1280 x 720, H.264, 25 FPS, 24 seconds, no audio | `e5a75fb73710d42f4c6136baa889464564eebde7c3bc03385c388712e618c003` |

## Creation record

- Tool: Codex built-in image generation; the product did not expose a model
  version in the result.
- Source references: none. No external image, performer likeness, footage,
  brand asset, or commercial MV was supplied.
- Candidate count: one.
- Selection rationale: the selected image depicts recognisable white jasmine,
  uses the approved ink-and-gouache dusk direction, contains no text or people,
  and preserves a dark, quiet centre for high-contrast movement cues.
- Accessibility review: the poster and a frame at 12 seconds were inspected at
  full resolution. The centre remains low-detail; the animation uses one slow
  continuous pan/zoom and no flashes, cuts, shake, lyric text, or embedded
  audio. Older-adult comfort and target-device decoding review remain open.

## Generation prompt

> Create a serene, project-original visual interpretation of the traditional
> Chinese folk melody Mo Li Hua for a 16:9 older-adult rhythm-game MV and
> poster. Show white jasmine blossoms and buds on deep-green branches around
> the edges of a quiet golden-dusk Chinese community square. Use refined adult
> Chinese ink wash and opaque gouache on fibrous rice paper. Leave generous,
> darker, uncluttered space through the centre and lower middle for movement
> cues. Use jasmine white, botanical green, warm amber, muted oxblood, and warm
> charcoal. Include no people, faces, performers, readable text, characters,
> lyrics, logos, brand marks, watermark, photorealism, commercial-MV
> resemblance, harsh neon, strobe, or busy central detail.

## Local transformations

1. `cwebp` resized the selected source to the 1280 x 720 poster at quality 84.
2. FFmpeg `8.1.2` authored a 24-second H.264 loop from the same source using a
   continuous sinusoidal 1.3% zoom and small horizontal/vertical drift.
3. The MP4 uses `yuv420p` and `faststart`; `ffprobe` confirmed one H.264 video
   stream, 1280 x 720 dimensions, 24-second duration, and no audio stream.

The video is decorative and muted. The procedural Web Audio arrangement and
existing session clock remain the timing and scoring authority.

## Rights and release gate

This is a project-directed AI-assisted original visual made without external
source assets. The project owner must still confirm the image-service output
terms applicable to the hackathon/public demo and complete visual, cultural,
motion-comfort, and target-device review. Until then, the files are implemented
local demo assets, not owner-approved public-release evidence.

Suggested attribution: `Mo Li Hua visual — project-directed AI-assisted ink
and gouache artwork; local motion edit by the DanceBros team.`
