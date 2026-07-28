# Security and privacy guidelines

**Status:** Binding  
**Owner:** Security and product lead  
**Reference when:** Handling camera, storage, identifiers, consent, external
services, analytics, or deployment.  
**Agent obligation:** Default to data minimisation and fail closed on consent or
identity uncertainty.

## Data classification

- **Restricted:** raw media, contact identifiers, tokens, credentials.
- **Sensitive:** derived movement measures, trend events, consent and supporter
  relationships.
- **Internal:** debug metrics without personal identifiers, AI provenance.
- **Public:** approved marketing assets and aggregate claims.

Raw media is transient restricted data and must not be persisted.

## Camera

- Explain purpose before requesting permission.
- Acquire the minimum resolution/frame rate needed.
- Stop tracks when leaving the session.
- Do not capture stills for debugging.
- Keep media objects inside the camera/pose adapter.
- Provide a visible camera-active indicator and stop control.

## Consent and sharing

- Version each consent purpose.
- Keep camera processing and supporter sharing separate.
- Verify active grant immediately before a send.
- Make revocation effective for future access and sends.
- Do not infer a recipient from contacts or family relationship.
- Audit grant, revoke, send attempt, and send result without message body.

## Secrets and configuration

- Client bundles contain no secret.
- `.env.example` contains names and safe descriptions only.
- Validate required configuration at startup.
- Use provider consoles/secret stores for deploy-time secrets.
- Rotate exposed secrets and invalidate them; deleting from git is insufficient.

## Web baseline

- HTTPS outside localhost.
- Restrictive Content Security Policy after stack selection.
- Explicit camera Permissions Policy.
- No inline untrusted HTML.
- Validate and encode all external content.
- Pin dependencies and review install scripts.
- Set secure, same-site cookies if server auth is later added.

## Threat modelling

Any new data flow records actor, asset, trust boundary, abuse case, mitigation,
and residual risk. Caregiver notifications require spoofing, duplicate,
revocation-race, and recipient-mismatch tests.
