# Dependency approval

**Status:** Binding  
**Owner:** Engineering lead  
**Reference when:** Proposing a new package, SDK, hosted service, font,
soundfont, or model.  
**Agent obligation:** Complete this review before changing manifests or vendor
configuration.

## Approval record

```md
### Dependency: [name/version]

- Requirement:
- Category: runtime | dev | SDK | model | asset
- Alternatives considered:
- Why platform/existing code is insufficient:
- Licence and redistribution:
- Security/maintenance evidence:
- Browser/device support:
- Bundle/install/transitive impact:
- Data sent/received:
- Failure and offline behavior:
- Adapter/containment:
- Test strategy:
- Exit/replacement path:
- Owner:
- Decision: approved | rejected | time-boxed spike
- Review/expiry date:
```

## Automatic rejection

- Unknown or incompatible licence.
- Requires raw camera upload for the MVP.
- Unmaintained critical package with no containment.
- Duplicates a small platform function.
- Adds a second framework/store/test runner without migration approval.
- Executes remote code unexpectedly.
- Needs a client-side secret.
- Cannot be tested or replaced at a boundary.

## Upgrades

Focused change, release-note review, lockfile diff, vulnerability check, target
tests, and rollback. Major versions require compatibility evidence and may need
an ADR.

## Removal

Delete configuration, adapters, transitive dead code, docs, and secrets. Confirm
the shipped bundle and lockfile no longer contain it.
