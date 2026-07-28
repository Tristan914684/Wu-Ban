# Branching strategy

**Status:** Binding after collaboration begins  
**Owner:** Engineering lead  
**Reference when:** Creating, updating, or merging a branch.  
**Agent obligation:** Keep branches short-lived, scoped, and based on current
main; never rewrite shared history without explicit approval.

## Branch names

- Codex/AI work: `codex/<type>-<short-slug>`.
- Human feature: `feature/<short-slug>`.
- Fix: `fix/<short-slug>`.
- Documentation: `docs/<short-slug>`.
- Release repair: `hotfix/<short-slug>`.

Types may be `feature`, `fix`, `docs`, `refactor`, or `spike`.

## Rules

- `main` is releasable, not necessarily deployed.
- One coherent outcome per branch.
- Rebase or merge current main before final validation according to team
  preference; never conceal conflicts.
- Do not combine dependency upgrades with product behavior.
- Experimental spikes use `codex/spike-*` and do not merge until production
  quality is reviewed.
- Delete merged branches.

## Commits

Use imperative, outcome-oriented subjects:

`feat(gameplay): classify lantern hold cues`  
`fix(consent): block sends after revocation`  
`docs(architecture): record pose provider decision`

Commits should compile/test at meaningful checkpoints. Avoid "WIP", "misc",
and generated summaries that do not name the result.

## Protection

Once CI exists, `main` requires:

- current branch;
- passing required checks;
- no unresolved review;
- required owner approval for security/product boundary changes;
- no force push.
