# Migration plan

**Use when:** Persisted schema, stored semantics, provider data, or a shared
contract changes.  
**Obey:** No destructive change without backup/rollback and an old-data test.

```md
# Migrate [source] to [target]

## Scope
- Current version:
- Target version:
- Records/users affected:
- Breaking semantics:

## Compatibility
- Old reader/new writer:
- New reader/old data:
- Window:

## Steps
1. Expand:
2. Backfill/transform:
3. Verify:
4. Switch:
5. Contract/remove:

## Safety
- Backup/export:
- Transaction/atomicity:
- Partial failure:
- Idempotency:

## Tests
- Old fixture:
- Re-run:
- Invalid/corrupt:
- Rollback:

## Observability
- Progress:
- Success metric:
- Abort threshold:

## Documentation and versioning
- Schema/algorithm docs:
- Release note:
```
