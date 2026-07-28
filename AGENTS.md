# Repository instructions for humans and AI agents

Read `docs/README.md` before planning or changing the repository. Then load the
task-specific documents listed there.

## Binding rules

1. `docs/PRODUCT_REQUIREMENTS.md` governs product scope and safety.
2. `docs/product/decision-log.md` records the latest accepted product
   clarifications.
3. Accepted files under `docs/adr/` govern architecture.
4. `docs/context/current-project-state.md` reports what is actually implemented.
5. Standards under `docs/engineering/`, `docs/frontend/`, and `docs/workflow/`
   govern implementation.
6. Templates are aids, never higher-authority specifications.

When documents conflict, stop and resolve the conflict using
`docs/governance/decision-framework.md`. Do not silently choose a convenient
interpretation.

## Non-negotiable product boundaries

- Webcam frames are processed in memory and are not persisted or transmitted.
- Gameplay measures are not represented as diagnosis, screening, or validated
  medical biomarkers.
- Simulated history is visibly identified everywhere it appears.
- Caregiver sharing requires separate, revocable player consent.
- A real caregiver notification may only be a non-diagnostic check-in through
  an explicitly configured test or sandbox channel.
- Standing movement must be bounded and pausable. The seated path uses
  hand/finger gestures and must not be treated as a cosmetic variant.
- Only one calibrated primary player contributes to a personal trend.
- Music and generated assets must pass the rights and provenance gate.

## Working rules

- Inspect before editing.
- Keep changes small, vertical, and reversible.
- Do not scaffold a framework or add a dependency before the applicable
  decision gate is met.
- Keep the domain independent from browser, UI, pose-provider, storage, and
  notification adapters.
- Add or update tests with behavior changes.
- Update `docs/context/current-project-state.md` when capabilities change.
- Record material architecture choices in an ADR and product choices in the
  decision log.
- Never claim a check passed unless it was run in the current worktree.

Implementation is not authorised by documentation-only requests.
