# Error handling

**Status:** Binding  
**Owner:** Engineering lead  
**Reference when:** Designing failure, recovery, retry, or fallback behavior.  
**Agent obligation:** Classify expected failures and give the user or operator a
specific next action.

## Failure taxonomy

- **User-recoverable:** permission denied, body not visible, low light, audio
  unavailable. Return a typed state with recovery.
- **Session-invalidating:** clock corruption, identity loss, insufficient valid
  frames. Preserve participation; exclude trend.
- **Transient adapter:** temporary storage or notification failure. Retry only
  when idempotent.
- **Configuration:** missing environment value or unsupported provider. Fail
  fast before play or sending.
- **Programmer defect:** impossible invariant, exhaustive branch failure.
  Capture diagnostics and stop the affected operation.

## Rules

- Domain functions return a discriminated result for expected outcomes.
- Adapters translate vendor exceptions into stable application errors.
- UI maps errors to concrete copy and one primary recovery.
- Never swallow an error.
- Never use a fallback that changes data meaning without a visible label.
- Preserve the original cause for diagnostics without exposing sensitive
  content to users.

## Retry

Retry only if:

1. the error is classified transient;
2. the operation is idempotent or has an idempotency key;
3. attempts and total duration are bounded;
4. the user can cancel;
5. final failure remains visible.

Camera/pose frames are not retried; obsolete work is dropped. Check-in sends use
a stable event/idempotency key and duplicate suppression.

## Error boundaries

Use route/feature error boundaries to keep settings or progress accessible when
gameplay fails. Do not continue a corrupted scored session after a fatal
game-clock or identity failure.
