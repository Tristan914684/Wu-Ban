# API design

**Status:** Binding for ports and future HTTP APIs  
**Owner:** Engineering lead  
**Reference when:** Adding an adapter contract, backend endpoint, or external
integration.  
**Agent obligation:** Design from the domain contract, validate boundaries, and
preserve idempotency and versioning.

## First choice

Use an in-process port for the local-first MVP. Add HTTP only when a separately
deployed capability or owner-controlled integration requires it.

## Contract rules

- Name operations by user intent.
- Request and response schemas are explicit and runtime-validated.
- Use stable error codes with human-safe messages.
- Include contract and algorithm versions in persisted or exchanged trend data.
- Never expose provider payloads directly.
- Do not return raw media or full landmark streams.

## HTTP conventions if introduced

- Resource-oriented URLs and standard methods.
- Version breaking contracts at the boundary.
- Pagination for unbounded collections.
- ISO 8601 UTC timestamps plus explicit display timezone.
- Correlation ID on requests.
- Authentication and authorisation are separate.
- `4xx` for caller-correctable input/auth/scope; `5xx` for server failure.
- Rate-limit externally callable send operations.

## Idempotency

Caregiver send and sync operations require an idempotency key based on the
stable command/event ID, not a timestamp. Store or reconcile results so retries
cannot duplicate a message.

## Compatibility

Additive fields are optional to older consumers. A rename, semantic change,
unit change, or required field is breaking. Maintain adapters during migration
and document removal dates.

## Error example

```json
{
  "error": {
    "code": "sharing_consent_inactive",
    "message": "Sharing permission is no longer active.",
    "correlation_id": "opaque-id"
  }
}
```

Do not include personal metrics or contact details in errors.
