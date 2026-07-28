# Database and persistence guidelines

**Status:** Binding for local storage; backend database remains unapproved  
**Owner:** Engineering lead  
**Reference when:** Persisting or changing a schema.  
**Agent obligation:** Store only necessary derived records, version schemas, and
provide migration and deletion behavior.

## MVP persistence

Use a repository port backed by browser storage selected during the stack
decision. Do not let IndexedDB APIs or schema objects leak into domain code.

Persist only:

- player preferences needed for play;
- versioned consent records;
- completed session summaries;
- session metrics;
- trend events;
- supporter grants;
- privacy-safe send audit outcomes.

Do not persist raw media, face data, or full pose-frame streams.

## Schema rules

- Stable IDs; no mutable natural key.
- `created_at` plus domain-relevant event time where different.
- Explicit `schema_version`, `chart_version`, `model_version`, and
  `algorithm_version`.
- Explicit `source` for captured versus simulated.
- Units in field names or schema documentation.
- Enums are validated and unknown values fail safely.

## Migration

Every schema change includes:

1. forward migration;
2. rollback or restore strategy;
3. old-data fixture;
4. migration test;
5. failure behavior without partial corruption;
6. documentation update.

Use expand/migrate/contract for a future shared database. Never destructively
reuse a field with new meaning.

## Deletion and retention

Player deletion removes their local history and grants. Supporter revocation
blocks access but does not imply player-history deletion. Retention policy for a
cloud pilot requires separate approval.

## Transactions

Commit a completed session and its metrics atomically. A trend event can be
derived only from committed, trend-valid sessions.

## Implemented local schema

IndexedDB database `wuban-local-v1` is at schema version 2:

- `session-summaries` / `sessionId`;
- `supporter-grants` / `grantId`; and
- `check-in-send-audits` / `commandId`.

Schema version 2 expands version 1 without rewriting session records. A
migration integration test protects the old-data fixture. Send audits contain
IDs, timestamps, versions, and result codes only; the editable message body is
not stored in the audit record. Session reads validate every version, mode,
metric, outcome, and validity field, then reconstruct the exact approved
summary shape. Malformed records are ignored and unexpected fields are
dropped before application use. A failed database-opening promise is discarded
so a later user retry can open a fresh connection; a version-change close also
invalidates the cached connection. The UI preserves loading and unavailable
states rather than treating a failed read as an empty history or inactive
grant.
