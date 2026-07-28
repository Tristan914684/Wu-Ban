# Code review process

**Status:** Binding  
**Owner:** Engineering lead  
**Reference when:** Preparing or reviewing a change.  
**Agent obligation:** Optimise for defect discovery and decision clarity, not
approval speed or prose volume.

## Author responsibilities

- Keep scope coherent.
- Explain outcome, not file-by-file activity.
- Link requirement, business rules, ADRs, and test evidence.
- Call out simulated, sandbox, and unverified parts.
- Provide screenshots/video for material UI.
- Provide performance evidence for critical-path changes.
- Self-review with `ai/pr-review-checklist.md`.

## Review order

1. Product correctness and safety.
2. Data/privacy/security.
3. Architecture and contracts.
4. Failure and concurrency behavior.
5. Tests and evidence.
6. UX/accessibility/content.
7. Maintainability/style.

## Review comments

State:

- severity: blocker, high, medium, low;
- affected behavior;
- evidence or scenario;
- specific remediation.

Avoid preference comments when the code follows an accepted standard.

## Required reviewers

- Product owner: scope, claims, caregiver copy.
- Engineering owner: architecture/dependencies.
- Accessibility/product design: core flow changes.
- Security/privacy: camera, consent, contacts, cloud.
- Rights owner: bundled music/assets.

One person may hold multiple roles, but the concerns must be reviewed.

## Merge

All blocking/high findings resolved, required checks green, docs current, and
review approval recorded. Deferred findings become known issues or technical
debt with owner and exit criterion.
