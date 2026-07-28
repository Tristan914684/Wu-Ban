# Incident response

**Status:** Binding once external users or services exist  
**Owner:** Incident commander  
**Reference when:** A production, privacy, safety, rights, or messaging failure
occurs.  
**Agent obligation:** Contain user harm first, preserve privacy-safe evidence,
and never minimise an incident to protect the demo.

## Severity

- **SEV-1:** Raw media/secret exposure, unauthorised supporter access/message,
  dangerous movement behavior, or false clinical/urgent claim.
- **SEV-2:** Core play unavailable, widespread session corruption, duplicate
  check-ins, or simulated data shown as real.
- **SEV-3:** Degraded feature with safe recovery.

## Response

1. Declare owner, severity, and timestamp.
2. Contain: disable send, rollback, remove deployment, or disable affected
   feature.
3. Preserve logs/config/version without copying personal data.
4. Assess affected users/data and legal/organiser notification duties.
5. Communicate known facts and uncertainty.
6. Fix through the normal reviewed release path.
7. Verify containment and recovery.
8. Complete postmortem with actions and owners.

## Special cases

- **Raw media:** stop processing/storage path, revoke access, preserve metadata
  only, involve privacy owner.
- **Wrong recipient/duplicate message:** disable transport, invalidate
  credentials if needed, inspect idempotency and consent.
- **Unsafe choreography:** remove chart/route immediately; do not wait for a
  software fix.
- **Unlicensed asset:** remove public artifact and replace only after rights
  review.

No blame in incident review. Repeated unowned actions are a governance failure.
