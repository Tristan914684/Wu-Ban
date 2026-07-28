# Documentation freshness and ownership

**Status:** Binding  
**Owner:** Documentation owner  
**Reference when:** Merging material changes, preparing a milestone, or finding
stale guidance.  
**Agent obligation:** Update the authoritative document in the same change or
record a blocking known issue.

## Ownership

- Product owner: PRD, personas, principles, roadmap, KPIs, decision log.
- Engineering owner: architecture, code standards, ADRs, enforcement.
- Product design: frontend, accessibility, content.
- Security/privacy owner: security, consent/data business rules, WeChat review.
- Release owner: workflow, deployment, current deployed state.
- Documentation owner: index, standards, freshness, changelog.

One person may hold multiple roles. Ownership identifies the review concern.

## Update triggers

Update immediately when:

- user-visible scope or wording changes;
- an architecture decision is accepted/superseded;
- a package/runtime/provider is selected;
- a command becomes executable or obsolete;
- a schema/API/environment contract changes;
- a quality gate is added/removed;
- a known issue is resolved;
- deployment state changes.

## Review cadence

- Current project state and known issues: every active work session/milestone.
- Roadmap: at least every two days before hackathon submission.
- Security, rights, release checklist: before every release.
- All active standards: monthly after the hackathon or before a major phase.
- External API/legal/SDK claims: re-verify at implementation and release.

## Staleness policy

If a document is suspected stale:

1. mark the uncertain claim;
2. verify code, tests, runtime, or primary source;
3. update the authoritative file;
4. update consumers/links;
5. record material change in the changelog.

Do not leave a stale file in place with a newer contradicting note elsewhere.

## Archival

Superseded ADRs remain. Obsolete operational docs move to an archive only when
no active link depends on them and the reason/removal date is recorded.
