# Bug fix plan

**Use when:** Observed behavior violates an existing contract.  
**Obey:** Reproduce before editing; add a regression test that fails without the
fix.

```md
# Fix [observable symptom]

## Report
- Environment/version:
- Expected:
- Actual:
- Frequency:
- User/safety impact:

## Reproduction
1. ...
- Minimal chart/trace/state:

## Boundary
- First incorrect value/state:
- Business rule violated:

## Root cause
- Evidence:
- Why existing tests missed it:

## Fix
- Smallest change:
- Unchanged behavior:

## Regression tests
- Fails before:
- Passes after:
- Nearby cases:

## Risk and rollback
- Possible regression:
- Rollback:

## Verification
- Commands:
- Browser/device:
```
