# M3 longitudinal and supporter evidence

**Status:** Locally verified; external WeChat owner-test gate open  
**Owner:** Product and application engineering  
**Last verified:** 26 July 2026  
**Reference when:** Reporting or changing personal trends, supporter consent,
check-in preview, local sharing persistence, or notification transport.  
**Agent obligation:** Never equate a local preview or unavailable adapter with
an externally delivered message.

## Implemented behavior

- Captured and simulated sessions are filtered into separate trend reports.
- Standing and seated sessions are evaluated separately.
- Credited captured sessions in the current local week are shown on returning
  home and on the progress surface without placing a trend warning on home.
  Visibly simulated sessions never increase this count.
- Only completed `validForTrend` summaries contribute.
- Fewer than five comparable sessions returns an exact remaining count.
- Rule version 1 computes a median and median absolute deviation from the first
  five valid sessions.
- A sustained prototype shift requires at least two metric families in at
  least two of the last three later valid sessions.
- Deterministic simulated history contains eight records, is generated outside
  personal history, and remains visibly labelled at every trend and sharing
  consumer.
- Supporter sharing is off by default and requires a separate, purpose-specific
  local confirmation.
- Revocation blocks future authorisation without deleting session history.
- Check-in copy states the observed gameplay change, plausible uncertainty,
  friendly action, and non-diagnostic boundary.
- An idempotent send service checks duplicate command IDs, then re-reads the
  grant immediately before transport. Revocation or supporter-binding changes
  during that window fail closed without a provider call or send audit.
- The current notification adapter returns `unavailable` without a network
  call because no current WeChat owner-test channel is configured.

## Persistence and migration

IndexedDB schema version 2 expands the version 1 database with:

- `session-summaries`, keyed by `sessionId`;
- `supporter-grants`, keyed by `grantId`; and
- `check-in-send-audits`, keyed by `commandId`.

The migration test creates a version 1 session record, opens schema version 2,
verifies both new stores, and confirms that the existing session record
remains. Connections close on `versionchange` so another tab can complete an
upgrade.

## Automated evidence

| Check | Result |
|---|---|
| `npm run typecheck` | Passed |
| `npm run lint` | Passed with zero warnings |
| `npm test` | 26 files, 82 tests passed |
| `npm run test:integration` | 3 files, 6 tests passed |
| `npm run test:e2e` | 4 files, 15 Chrome tests passed |

Named tests cover BR-005, BR-008 through BR-013, the PRD 80% scoreable-input
threshold, source/mode separation, insufficient history, repeated-family
logic, deterministic simulation, separate grant, revocation, message
boundaries, trigger blocking, idempotency, privacy-safe audit records, and
schema migration. A production-browser test also seeds a captured,
quality-invalid record and verifies that it earns weekly participation credit
while the comparable trend-valid count remains zero. Named application tests
force both revocation and recipient-binding substitution between initial
authorisation and the immediate pre-send check; both make zero provider calls
and write zero send audits. The session repository integration suite also
proves malformed nested records are ignored and unexpected stored fields are
removed before history or trend evaluation.

## Local browser evidence

At 1440 x 900 in the Codex in-app browser, with production E2E regression at
1280 x 720 in Chrome:

1. Real local history showed zero trend-valid captured sessions and explicitly
   excluded three simulated gameplay sessions.
2. The real state requested five more comparable clear sessions rather than
   making a conclusion.
3. The deterministic demonstration showed eight `SIMULATED DATA` sessions and
   repeated Beat/Memory changes.
4. The global simulation badge remained visible on progress and sharing.
5. Sharing opened as `默认关闭`.
6. The scope excluded video, photos, landmarks, fun score, disease risk, and
   urgency.
7. Grant required a second explicit confirmation and described itself as a
   local preview grant, not a bound WeChat recipient.
8. The simulated send control remained disabled.
9. Revocation returned sharing to off while leaving history intact.
10. The journey produced no browser console warning or error.
11. Axe found no detectable violations on home, progress, simulated progress,
    or sharing.
12. Reading surfaces remained visible without horizontal overflow at a
    640-CSS-pixel viewport, equivalent to 200% zoom from the 1280 baseline.

## Open gates

- Owner selection of a current WeChat test channel, account capability, and
  private credentials.
- One-time opaque supporter binding and server-held credential adapter.
- Sandbox send, provider-side duplicate retry, server-side revoke-race, and
  recipient receipt evidence. The local application-side consent/binding race
  is covered; this does not prove a future external adapter is atomic.
- Manual screen-reader smoke for progress and sharing.
- Supporter and older-adult formative comprehension testing.
