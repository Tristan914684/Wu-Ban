# Technical debt register

**Status:** Active  
**Owner:** Engineering lead  
**Reference when:** Accepting shortcuts, planning refactors, or reviewing
release risk.  
**Agent obligation:** A shortcut without owner, risk, and exit criterion is not
accepted debt; it is an unresolved defect.

No accepted application technical debt is currently recorded. Open hardware,
owner-account, research, and integration evidence gates remain tracked in
`known-issues.md`; they are not accepted implementation shortcuts.

## Required record

| Field | Meaning |
|---|---|
| ID | Stable `TD-NNN` identifier |
| Introduced | Date and change/PR |
| Shortcut | What was intentionally compromised |
| Reason | Time, dependency, or evidence constraint |
| Risk | User, security, reliability, or maintenance impact |
| Containment | What prevents spread |
| Owner | Responsible person |
| Exit criterion | Observable condition for removal |
| Target | Milestone, not a vague "later" |

## Prohibited "debt"

Do not record these as acceptable shortcuts:

- Persisting raw camera frames.
- Removing consent or simulated-data labels.
- Shipping medical claims.
- Committing secrets.
- Mixing simulated and real histories.
- Allowing invalid sessions into trends.
- Using unverified music or asset rights.
