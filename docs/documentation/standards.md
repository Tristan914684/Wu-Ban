# Documentation standards

**Status:** Binding  
**Owner:** Documentation owner  
**Reference when:** Creating, editing, reviewing, or generating documentation.  
**Agent obligation:** Write one authoritative rule once, link it, and distinguish
fact from proposal.

## Required header

Standards and context files include:

- `Status`: Proposed, Active, Binding, Superseded, or factual snapshot.
- `Owner`.
- `Reference when`.
- `Agent obligation`.

Templates may use `Use when` and `Obey`. ADRs use their defined record format.

## Writing

- Lead with the rule or outcome.
- Use plain, concrete language.
- Prefer short sections and tables for exact mappings.
- Define acronyms once.
- Use glossary terms.
- Dates use `YYYY-MM-DD` in records.
- Commands and identifiers use code formatting.
- Avoid "obvious", "simple", "just", and unsupported absolutes.
- Separate current behavior, target behavior, and future options.

## Rules

Use **must** for binding requirements, **should** for strong defaults with a
reviewable exception, and **may** for allowed options. Do not use all-caps
normative language everywhere.

## Examples

Examples are:

- minimal;
- valid against the current contract;
- free of secrets/personal data;
- labelled illustrative when not executable.

Remove stale examples rather than appending a contradictory new one.

## Links and diagrams

- Use relative links inside the repository.
- Link primary/official external evidence where material.
- Describe why a link matters.
- Mermaid diagrams show relationships that prose cannot communicate as clearly.
- Quote Mermaid labels containing punctuation.
- Update diagrams with the owning architecture/flow.

## Changelogs and ADRs

- The docs changelog records material operating-rule changes, not typo fixes.
- Accepted ADRs are immutable; supersede them.
- Product decisions use the decision log, not ADRs.

## Prohibited

- Duplicate copies of PRD requirements in multiple standards.
- Describing a proposed CI check as running.
- Anonymous rules with no owner.
- Undated "temporary" exceptions.
- Tool-generated citation tokens or inaccessible local attachment references in
  durable docs.
