# Contribution guidelines

**Status:** Binding  
**Owner:** Engineering lead  
**Reference when:** A human or AI contributor begins work.  
**Agent obligation:** Announce scope, avoid overlapping ownership, and leave the
repository easier to understand.

## Before work

- Read `AGENTS.md` and the task route.
- Check current state, known issues, and working tree.
- Link an accepted requirement/defect.
- Claim the narrow files/module when multiple agents work concurrently.
- Coordinate before touching another contributor's active area.

## Change expectations

- One outcome per branch/change.
- Preserve existing structure unless a refactor is part of the task.
- Use domain vocabulary.
- Add tests and recovery states.
- No secrets, personal data, raw media, or unlicensed assets.
- No generated code or asset without provenance.
- Update the owning documentation.

## Multiple agents

- Parallelise only independent bounded work.
- One agent owns a shared contract at a time.
- Communicate contract changes before downstream implementation.
- Do not resolve conflicts by choosing the newest file blindly.
- Integration owner runs the full gate on the combined state.

## Handoff

Provide:

- result;
- decisions made;
- files/contracts changed;
- commands and outcomes;
- proposed/simulated/sandbox boundaries;
- unresolved risks.

## Conduct and user respect

Use adult, non-stereotyping language. Research participation is voluntary.
Safety, privacy, and honest claims take precedence over hackathon theatrics.
