# 舞伴 Wǔbàn — DanceBros

**A camera-based rhythm and memory game designed for older adults, built for the Tencent Cloud "AI Can Do It" Hackathon 2026 (Age Well track).**

🔗 **Live demo:** [wu-ban.tristanlyn44.workers.dev](https://wu-ban.tristanlyn44.workers.dev/)

---

## Overview

Wǔbàn turns familiar social dancing into a short, joyful rhythm game. Players follow large on-screen movement cues while an on-device pose model reads their movement through the webcam — entirely locally, with no video ever leaving the browser. As players return for repeated sessions, the app quietly builds a personal baseline of movement and attention measures, and can flag a sustained change worth a friendly check-in with a trusted family member — without ever framing itself as a clinical or diagnostic tool.

The product exists to explore a simple idea: most cognitive and physical wellness checks only happen after someone decides to seek them out. Wǔbàn adds a voluntary, play-based signal between checkups — something a person does anyway, for fun.

## Key Features

- **On-device pose tracking** — Uses MediaPipe Tasks Vision to estimate hand and body landmarks locally in the browser; no frames are uploaded anywhere.
- **Standing and seated modes** — Players choose a safe way to play based on their own mobility.
- **Progressive difficulty** — Sessions start with simple movement cues, layer in beat timing, then introduce a short memory/inhibition challenge (remember a sequence, freeze on cue).
- **Personal trend tracking** — Compares each session's quality-checked results against a player's own historical baseline, stored entirely on-device.
- **Consent-first sharing** — Players explicitly opt in before any trend summary is shared with a chosen supporter; sharing can be revoked at any time.
- **Privacy by design** — All session history lives in the browser's IndexedDB, on that specific device only. Nothing is synced to a server or cloud database, and history can be cleared at any time from the app.
- **Offline-capable** — A generated service worker precaches core assets and models for a resilient experience on lower-end devices.
- **Bilingual UI** — Fully localized in Simplified Chinese and English.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build tool | Vite |
| Pose estimation | MediaPipe Tasks Vision (on-device inference) |
| Local storage | IndexedDB |
| Testing | Vitest (unit/integration), Playwright (E2E, with `@axe-core` accessibility checks) |
| Hosting | Cloudflare Workers (static assets + SPA routing) |
