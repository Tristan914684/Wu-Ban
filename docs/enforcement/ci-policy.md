# CI policy

**Status:** Active  
**Owner:** Engineering lead  
**Reference when:** Creating or changing CI/CD.  
**Agent obligation:** Keep CI reproducible, least-privileged, and aligned with
local commands; never put provider secrets in untrusted change jobs.

## Pull-request pipeline

1. Documentation validation.
2. Locked install with dependency cache.
3. Format/lint/typecheck.
4. Unit tests.
5. Contract/component tests.
6. Production build and bundle budget.
7. Synthetic browser tests.
8. Security, secret, and licence checks.

Cancel superseded runs. Required jobs fail closed.

The implemented GitHub Actions workflow uses read-only repository permissions,
locked npm installation, dependency audit, `npm run verify`, and a separate
production Chrome job. It receives no hosting or WeChat secrets.

## Main pipeline

Repeat required checks on the merged commit. Produce an immutable build artifact
with version metadata. Deployment is a separate authorised job.

## Deployment

- Protected environment.
- Least-privileged short-lived credentials where supported.
- Exact saved artifact, not a rebuild with different inputs.
- Manual approval for production until repeatability is proven.
- Smoke and rollback step.

## Secret separation

Untrusted pull requests receive no WeChat, hosting, or other external secrets.
Sandbox integration tests run only from trusted branches/environments with
redacted logs.

## Ownership/enforcement

Path-based review can be added for:

- `domain/trend`, consent, notifications: product/security/engineering.
- camera/pose: security/performance.
- music/assets: rights/creative.
- workflows/deployment: release owner.
- docs authority/ADRs: documentation/engineering owner.

CI config changes require the same review as the gate they can weaken.
