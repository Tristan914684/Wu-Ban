# Refactoring plan

**Use when:** Structure changes while behavior should remain stable.  
**Obey:** Characterize behavior, keep the refactor separable, and do not invent
an abstraction without a stable concept.

```md
# Refactor [boundary]

## Smell and cost
- Current problem:
- Evidence/repeated change:
- Why now:

## Behavior to preserve
- Public contracts:
- Characterization tests:

## Target boundary
- Responsibilities:
- Dependency direction:
- Explicit non-goals:

## Steps
1. Add characterization.
2. Introduce/move one boundary.
3. Migrate callers.
4. Delete old path.

## Risks
- Cycles:
- Performance:
- Data/compatibility:

## Verification
- Original tests:
- New boundary tests:
- Import/fitness checks:
- Build/performance:

## Rollback
- Safe checkpoint:
```
