# Quality gates

**Status:** Binding gate definitions; automated Gates 0-2 are active  
**Owner:** Engineering lead  
**Reference when:** Planning CI, reviewing, releasing, or claiming completion.  
**Agent obligation:** Report only gates that ran; an intended future check is
not evidence.

## Gate 0 - Documentation

Executable now:

```sh
node scripts/validate-docs.mjs
```

Checks inventory, headings, internal links, and required route files.

## Gate 1 - Fast deterministic

Activate after scaffold:

- format/check;
- lint;
- strict typecheck;
- unit tests;
- dependency/secret scan;
- docs validation.

Target: routine local feedback in under two minutes.

## Gate 2 - Integration

- adapter contract tests;
- local persistence/migrations;
- component accessibility tests;
- production build;
- bundle budget;
- synthetic-trace browser journeys.

## Gate 3 - Critical manual/device

- real camera standing route;
- seated hand/finger route;
- permission denial and recovery;
- tracking loss/low light/multi-body;
- audio drift/latency/FPS;
- raw-media network/storage inspection;
- WeChat owner-test grant/send/revoke;
- reduced motion and keyboard/screen-reader smoke.

## Gate 4 - Release

- clean locked install;
- all prior gates;
- five consecutive live demos;
- signed-out production smoke;
- rights/provenance;
- rollback;
- release/version/submission evidence.

## Failure policy

Safety, consent, raw-media, simulated-data, rights, and build failures block
release. Flaky required checks block until fixed or explicitly quarantined with
owner, risk, and near-term expiry.
