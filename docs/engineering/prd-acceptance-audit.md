# PRD acceptance audit

**Status:** Active requirement-by-requirement evidence map  
**Owner:** Product and engineering leads  
**Last verified:** 26 July 2026  
**Reference when:** Claiming PRD completion, demo readiness, or submission
readiness.  
**Agent obligation:** A coded path is not a passed hardware, owner-account, or
human-research gate. Keep those evidence classes separate.

## Must-have requirements

| ID | Current status | Evidence or remaining gate |
|---|---|---|
| FR-01 | Locally verified | First-time disclosure precedes the camera action in component and production-browser tests. Chrome also verifies denied-camera guidance and recovery through the labelled camera-free route. Returning players repeat the camera purpose, local-processing boundary, and permission choice before acquisition. |
| FR-02 | Locally verified; device proof open | Standing and seated modes select different calibration, four-cue tutorial, classifier, and chart paths. Both synthetic journeys pass. Captured returning players reuse their last mode and take shortened calibration without repeating the full tutorial. |
| FR-03 | Locally verified | Safety confirmation precedes calibration; Pause and Stop are keyboard and pointer reachable during timed play. |
| FR-04 | Implemented; device proof open | Calibration gives framing, light, and companion guidance and requires three uninterrupted scoreable seconds. A component test verifies that model-preparation failure exposes the clearly labelled synthetic fallback without completing calibration. Real-camera evidence remains KI-011. |
| FR-05 | Collection tooling verified; human gate open | Four standing classifiers and a dev-only aggregate expected-versus-detected report exist. The same ephemeral artifact now includes render/inference rates, inference duration, unclear-frame episodes, pauses, and audio-clock drift while excluding raw/per-frame data. Representative front/back human runs are not complete, so KI-002 remains binding. |
| FR-06 | Locally verified | The chart reserves 30 seconds for unscored warm-up, then authors 60-second Follow, 75-second Rhythm, and 75-second Memory/no-go phases. Accelerated production-browser journeys exercise all phases proportionally. |
| FR-07 | Locally verified; device proof open | Good, Nearly, Try-next, and unscoreable feedback use forgiving timing and quality gates. A bounded low-confidence landmark window passes through the production classifier in Chrome and verifies tracking-loss guidance plus recovery. The camera scheduler no longer imposes a sub-20-FPS ceiling, and the dev report can aggregate real-session rates and unclear episodes. No target-device report has been captured, so real-camera FPS, motion-to-feedback, and recovery remain KI-011. |
| FR-08 | Locally verified | Results separate Beat, Shape, Flow, and Memory from the fun score and repeat the non-diagnostic boundary. |
| FR-09 | Locally verified | Completed, quality-excluded, context-excluded, and interrupted active gameplay/cooldown outcomes persist with trend validity, participation credit, and typed reasons. Chrome verifies that a quality-invalid captured record still counts as weekly participation while contributing zero trend inputs. An untouched interruption receives neither a phantom fun score nor participation credit. |
| FR-10 | Locally verified | IndexedDB persists summary-only records across reloads; no frames or landmarks enter the schema. Reads deeply validate nested values and reconstruct only approved fields, so corrupt or unexpected stored data cannot enter history, trends, or inspection. |
| FR-11 | Locally verified | Progress distinguishes insufficient history, provisional baseline, usual range, and repeated-change states by mode. |
| FR-12 | Locally verified | Deterministic history is generated outside local history, labelled at every consumer, and removed by returning to real history. |
| FR-13 | Locally verified; external gate open | Separate consent, explanation, editable message, and fail-closed preview are demonstrable. The application revalidates consent and recipient binding immediately before transport; forced revocation and substitution races make no provider call or audit. Real WeChat transport and server-side atomicity remain KI-005. |
| FR-14 | Locally verified | The player can expand and inspect the exact stored summary JSON, delete local history, and revoke sharing independently. |
| FR-15 | Blocked on owner sign-in | Final Miora-generated assets and provenance require the project owner to sign in to Miora. Draft CSS art is not claimed as Miora output. |
| FR-16 | Partial; owner evidence open | Runtime AI, local tests, rights, and prompt/process boundaries are documented. Final Miora and CodeBuddy owner-account evidence remain open. |
| FR-17 | Locally verified | The labelled spectator fallback replays deterministic pose/hand landmark frames through the production classifiers and scoring path. |
| FR-18 | Locally verified | Core consent, safety, cues, calibration, tutorial, results, trends, and sharing copy are Simplified Chinese-first with an English judge toggle. |

## Should-have requirements

| Requirement | Current status |
|---|---|
| Voice guidance, captions, and volume | Implemented as always-visible captions, independent music/cue volume, and explicit opt-in browser/system narration of fixed cue labels. Voice availability is enhancement-only and never blocks offline play. |
| Deterministic adaptive difficulty | Implemented and unit-tested: eight successes in ten fades one preview-support step; three misses in five restore one step; manual gentler support is always available. |
| English judge toggle | Implemented and browser-verified. |
| Companion boundary | Implemented for one primary profile; overlapping extra bodies make the segment unscoreable. Real-camera multi-body proof remains KI-011. |
| Editable check-in preview | Implemented and locally verified. |
| Weekly participation | Implemented from credited captured sessions and shown on returning home and progress; simulated sessions are excluded. |
| Context prompt | Implemented; it preserves result/participation and excludes trend input. |
| Low-light and multi-body guidance | Implemented in calibration and tracking-loss recovery copy; device proof remains KI-011. |
| Synthetic landmark event replay | Implemented and unit-tested without saved video or camera frames. |

## Release and research gates

The following remain outside what local automation can honestly prove:

- representative human confusion traces and camera/device latency;
- a full four-minute real audio output/drift run and owner listening approval;
- authenticated production application smoke;
- final Miora assets and CodeBuddy/Miora provenance from owner accounts;
- an owner-selected WeChat test channel and consented receipt;
- formative older-adult and supporter comprehension sessions;
- five consecutive live demo runs, portal confirmation, and submission receipt.

The project is therefore a locally verified vertical slice, not submission
complete.
