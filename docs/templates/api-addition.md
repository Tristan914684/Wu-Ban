# API or integration addition

**Use when:** Adding a port, HTTP endpoint, webhook, or external service call.  
**Obey:** Validate boundaries, minimise data, version semantics, and make writes
idempotent.

```md
# Add [operation]

## User outcome and authority
- Requirement:
- Caller/consumer:
- Why in-process is insufficient:

## Contract
- Method/operation:
- Request schema:
- Response schema:
- Error codes:
- Authentication:
- Authorisation/scope:
- Version:

## Data
- Classification:
- Fields sent:
- Retention:
- Logging exclusions:

## Reliability
- Timeout:
- Cancellation:
- Retry classification:
- Idempotency key:
- Duplicate suppression:
- Rate limit:

## Security
- Threats:
- Secret location:
- Validation:

## Tests
- Contract:
- Auth/scope:
- Retry/duplicate:
- Provider failure:

## Rollback/provider exit
- Disable:
- Replacement boundary:
```
