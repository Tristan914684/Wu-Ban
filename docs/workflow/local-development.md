# Local development

**Status:** Active command and device-evidence runbook
**Owner:** Engineering lead  
**Reference when:** Setting up or running the project locally.  
**Agent obligation:** Run only the commands defined by the current manifest,
keep synthetic and camera evidence distinct, and never save raw media or
landmark frames.

## Prerequisites

- Node.js `24.18.0` from `.nvmrc`.
- npm `11.16.0` from `packageManager`.
- Latest Chrome on the development or demo laptop.
- Webcam for real-camera checks and local audio output for soundtrack checks.
- No environment variables or WeChat credentials are required for core play.

## Setup and command contract

From a fresh clone:

```sh
node --version
npm --version
npm ci
npm run dev
```

The first two commands must print `v24.18.0` and `11.16.0`. Activate `.nvmrc`
with an installed version manager or install the pinned runtime before
continuing; this repository does not assume a particular version-manager
command.

The repository exposes:

| Command | Purpose |
|---|---|
| `npm run docs:validate` | Validate the documentation inventory and links. |
| `npm run lint` | Run the zero-warning lint gate. |
| `npm run typecheck` | Run strict TypeScript checking. |
| `npm test` | Run deterministic unit and component tests. |
| `npm run test:integration` | Run IndexedDB adapter and migration tests. |
| `npm run build` | Create the production bundle. |
| `npm run build:budget` | Enforce bundle and offline-asset budgets. |
| `npm run test:e2e` | Run production Chrome journeys. |
| `npm run verify` | Run documentation through build/budget gates. |
| `npm run verify:full` | Run `verify` plus all production Chrome journeys. |
| `npm run preview` | Serve the production build locally. |

`npm run verify:full` is the complete automated local gate. It does not replace
real-camera, real-output audio, screen-reader, target-device, owner-account,
research, or submission evidence.

The E2E runner owns dedicated port 4174 and refuses to reuse an existing
preview. This ensures `npm run test:e2e` exercises the production bundle built
from the current source rather than a long-running server from another
worktree. Local development and ad hoc preview commands keep their normal
ports.

## Environment

- The core game has no required environment configuration.
- Future local secrets must go in an ignored file or OS/provider secret
  mechanism; never place them in `.openai/hosting.json`.
- A missing notification config disables send UI or marks it test-unavailable;
  it does not break play.

## Local data

- Provide a clear command/UI action to reset local derived history.
- Simulated demo history uses a separate store/namespace.
- Never seed realistic personal data.
- Synthetic pose traces are versioned test assets.

## Synthetic browser route

Open `http://localhost:5173/?fast=1` after `npm run dev`. The simulation label
must remain visible after choosing the camera-free demonstration. This route
uses authored landmark frames and accelerated timing; it is not real-camera
evidence.

For the deterministic recovery regression, open
`http://localhost:5173/?fast=1&scenario=tracking-loss`. The test route sends a
bounded low-confidence landmark window through the production classifier and
gameplay tracking state machine. Verify that the `暂时看不清动作` guidance
appears and clears, then that the result is quality-invalid. This remains
visibly simulated and must never be cited as real-camera or device evidence.

## Real-camera device evidence

1. Run `npm run dev`.
2. Open `http://localhost:5173/?debug=1` in Chrome on the target laptop.
3. Complete disclosure and choose the real camera; do not use the simulated
   fallback.
4. Record the date, commit, device, Chrome version, room/light condition,
   clothing condition, mode, and anonymous tester count outside the app.
5. Complete the full authored session at demo speed.
6. On the result screen, expand the already-open
   `DEV-ONLY CAMERA EVIDENCE — NOT YET HUMAN-VALIDATED` section.
7. Use `Download aggregate evidence JSON` and attach the file to the dated M1
   evidence record. Review each expected-versus-observed row, especially
   `step-forward` and `step-back`. Also compare the active-session
   render/inference rates, inference duration p95, unclear-frame episodes, and
   audio-clock drift with the documented budgets.
8. Repeat across the representative conditions and people required by the
   validation plan before changing KI-002 or KI-011.

The report contains aggregate cue counts, scoreable/match rates, matched timing
p95, active-session render/inference rates, inference duration median/p95,
mean confidence, unclear-frame reasons/episodes, pause count, and end/p95
audio-clock drift. It explicitly records that the debug overlay was enabled.
It is neither saved to IndexedDB nor included for synthetic or production
sessions, and it contains no cue IDs, attempts, media,
landmarks, per-frame timestamps, or trace. A generated report is tooling
output, not proof of human accuracy until the external context and
representative repetitions are recorded. Inference duration does not prove
motion-to-feedback latency; capture that measure separately with an external
ground-truth method.
