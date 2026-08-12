# Personal trend and supporter check-in

**Status:** Building  
**Owner:** Product and application engineering  
**Target milestone:** M3 longitudinal and supporter proof  
**PRD requirements:** FR-11 through FR-14  
**Business rules:** BR-005 through BR-013  
**Related ADRs:** ADR-0001, ADR-0003, ADR-0004

## Outcome

A player can review a transparent personal movement-and-attention pattern,
read a structured report that flags sustained changes worth checking in about,
switch to an unmistakably simulated trend demonstration, separately grant or
revoke one supporter scope, and preview a calm non-diagnostic check-in.

## User and job

- User: returning adult player and a player-approved supporter.
- Mode/frequency: after a session or during occasional progress review.
- Job: understand whether enough clear sessions exist and, when desired, start
  a friendly conversation without turning gameplay into a health verdict.
- Risk: false alarm, simulated data presented as personal, bundled consent,
  recipient mismatch, duplicate delivery, or medical interpretation.

## Problem evidence

The PRD requires a demonstrable baseline, visibly simulated trend history,
supporter consent state, and non-alarming message. The prototype rule is a
product hypothesis, not clinically validated. No owner-controlled WeChat
channel or credentials have yet been selected.

## In scope

- Real local-history states: none, fewer than five valid sessions, provisional
  baseline, and recent pattern.
- Separate deterministic simulated history with a persistent `SIMULATED DATA`
  badge and reset action.
- Median and median absolute deviation over the first five comparable valid
  sessions.
- A versioned prototype shift rule over Beat, Shape, Flow, and Memory.
- A structured longitudinal report with the analysed period, recent-versus-
  usual evidence, repeated-change flags, uncertainty, and a neutral next step.
- Sharing off by default.
- A separate purpose-specific local supporter grant and revocation.
- Exact disclosure of supporter-visible fields.
- A generated, editable check-in preview with uncertainty and non-diagnostic
  wording.
- A notification port and fail-closed unavailable transport until the owner
  selects and configures a current WeChat test channel.

## Out of scope

- Clinical screening, diagnosis, urgency, MCI probability, brain-health score,
  or population comparison.
- Production alerting, clinician messaging, cloud history, supporter
  authentication, or inferred family relationships.
- A claim that previewing a message proves WeChat delivery.
- Combining standing and seated baselines.

## UX flow

Home -> My rhythm -> insufficient/baseline/recent pattern -> optional simulated
demo -> Privacy and sharing -> explain scope -> explicit grant -> check-in
preview -> revoke.

Recovery: unavailable transport keeps the editable preview and clearly states
that no message was sent. Revocation immediately disables future send actions
without deleting the player's history.

Required states: no history, partial history, baseline, usual range, sustained
prototype shift, simulated, sharing off, confirmation, active, revoked,
preview-only, transport unavailable, and duplicate command.

## Functional requirements

| ID | Requirement | Acceptance |
|---|---|---|
| TS-001 | Only completed trend-valid sessions contribute. | Invalid, interrupted, and excluded records never enter the baseline or recent window. |
| TS-002 | Sources remain separate. | Captured and simulated sessions are never combined in one baseline or trend. |
| TS-003 | Modes remain separate. | Standing and seated records are never combined in one baseline. |
| TS-004 | Five sessions form the provisional baseline. | Fewer than five comparable valid sessions returns `insufficient-history` and the exact remaining count. |
| TS-005 | The rule is transparent and versioned. | Rule version 1 records baseline window, recent window, shifted families, and per-family evidence. |
| TS-006 | Simulated data is unmistakable. | Every simulated trend consumer shows a persistent label and never describes it as the player's performance. |
| TS-007 | Sharing is off by default. | No grant exists and no check-in action is enabled before a separate confirmation. |
| TS-008 | Grant scope is narrow and revocable. | The stored versioned grant covers trend-summary/check-in only; revoke blocks future sends but retains player history. |
| TS-009 | Copy preserves the claim boundary. | Preview states the observed gameplay change, plausible uncertainty, friendly action, and “not a diagnosis.” |
| TS-010 | Transport fails closed. | Missing WeChat test configuration yields `unavailable` and makes no network call. |
| TS-011 | Commands are idempotent. | The same event and grant produce the same command ID and cannot be sent twice. |
| TS-012 | Audit data is minimal. | Grant/revoke and send outcomes contain IDs, versions, times, and result codes, never message bodies or raw provider identifiers. |
| TS-013 | A trend result is explained as a report, not a verdict. | The progress surface names the analysed period and valid-session count, shows usual and recent values per metric family, flags only repeated prototype changes, explains possible everyday influences, and suggests a check-in without identifying a condition or cause. |

## Prototype trend rule version 1

For one mode and one source:

1. Sort comparable, trend-valid summaries by completion time.
2. Use the first five as the provisional baseline.
3. Compute each metric-family median and median absolute deviation (MAD).
4. For each later session and family, mark an unfavourable shift when the value
   is below `median - max(0.12, 2 * MAD)`.
5. Report a sustained prototype shift only when at least two metric families
   shift in at least two of the last three valid later sessions.
6. With fewer than three later sessions, report a baseline but no sustained
   conclusion.

The 0.12 floor and two-MAD threshold are fixed engineering assumptions for the
demo. They must not be tuned to create a desired conclusion or described as a
clinical cutoff.

## Data and contracts

- Inputs: versioned completed session summaries, selected mode/source, grant,
  optional editable preview text, and stable trend event ID.
- Outputs: `TrendReport`, `SupporterGrant`, `CheckInPreview`, and
  `CheckInResult`.
- Stored data: existing session summaries, versioned grant/revoke timestamps,
  and privacy-safe send outcome metadata.
- Retention/deletion: local until local deletion; revocation retains session
  history; simulated seed data is generated, not added to personal history.
- Simulated/test behavior: deterministic dates and values; persistent badge;
  external send disabled until separately configured.
- Versioning: trend rule 1, consent purpose/version 1, message template 1, and
  IndexedDB schema 2.

## Safety, privacy, and accessibility

- Consent: camera processing and supporter sharing are separate actions.
- Threats: accidental source mixing, revoked-grant race, recipient
  substitution, duplicate send, sensitive logging, and misleading preview.
- Claim boundary: movement-and-attention pattern only; causes are uncertain;
  no diagnosis or urgency.
- Physical safety: no new movement behavior.
- WCAG/older-adult requirements: one primary action, plain-language scope,
  large targets, keyboard operation, visible status, and no color-only trend
  state.

## Architecture

- Owning modules: `trend`, `sharing`, application check-in service, local
  grant/audit repositories, and progress/sharing feature UI.
- Ports/adapters: session repository, sharing repository, notification port,
  and unavailable WeChat adapter.
- Dependency or ADR needs: no new runtime dependency; exact WeChat channel
  remains KI-005.
- Failure and cancellation: active grant is re-read immediately before send;
  missing or revoked grant fails closed; UI preserves an unsent preview.

## Metrics

- Outcome metric: player can explain baseline state and sharing state.
- Guardrail metric: excluded/simulated-source mixing count must remain zero.
- Diagnostic metric: trend input count and transport result code.
- Prohibited inference: MCI probability, health risk, urgency, brain age, or
  diagnosis.

## Test plan

- Unit: median/MAD, insufficient history, invalid exclusion, source/mode
  separation, repeated-family rule, deterministic simulation, grant/revoke,
  copy boundary, and idempotency.
- Contract: IndexedDB schema migration, grant persistence, revoke behavior,
  audit shape, and unavailable transport with zero network calls.
- Component: empty/partial/simulated labels, sharing off, grant confirmation,
  preview, unavailable, and revoke.
- Browser/device: real local history, deterministic simulated trend, full
  grant-preview-revoke journey, keyboard, zoom, and accessibility.
- Non-happy: corrupted record, revoked-grant race, duplicate command, missing
  config, and storage failure.

## Rollout and rollback

- Feature flag/config: WeChat transport remains unavailable unless server-side
  test configuration is explicitly introduced.
- Migration: IndexedDB v1 session store expands to schema v2; session records
  remain unchanged.
- Rollback: hide progress/sharing entry while retaining existing local session
  history; do not delete player data implicitly.
- Observability: local result codes only; no message body, landmarks, contact
  identifiers, or provider token.

## Documentation updates

- Current project state, known issues, integration guide, database schema,
  M3 evidence, and changelog.

## Open decisions

- Owner-selected current WeChat test channel and account capability.
- Supporter binding/authentication for an external sandbox send.
- Whether simulated check-in remains preview-only or is permitted to reach a
  labelled owner test recipient after channel selection.

