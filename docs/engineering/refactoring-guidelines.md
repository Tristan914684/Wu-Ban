# Refactoring guidelines

**Status:** Binding  
**Owner:** Engineering lead  
**Reference when:** Changing structure without intending product behavior
changes.  
**Agent obligation:** Prove behavior preservation and keep refactors separable
from feature work.

## Before

- Name the smell and user/engineering risk.
- Identify characterization tests.
- Define the desired boundary, not just smaller files.
- Check for active overlapping work.
- Choose a rollback point.

## During

- Move one boundary at a time.
- Preserve public contracts unless the task explicitly changes them.
- Use adapters when replacing a provider.
- Avoid formatting unrelated files.
- Do not create abstractions until at least two real callers reveal the stable
  common concept.
- Delete the superseded path after migration; do not keep "v2" indefinitely.

## After

- Run original characterization tests.
- Add focused tests for the new boundary.
- Inspect imports for cycles and forbidden directions.
- Compare bundle/performance when touching the critical path.
- Update architecture/project structure and add an ADR if a material pattern
  changed.

## Refactor triggers

- Duplicated business rule.
- SDK type leaking into domain.
- Component owning unrelated state and decisions.
- Function mixing pure calculation and I/O.
- File repeatedly changed for unrelated features.
- Error behavior that cannot be tested.

Line count alone is not a trigger. A cohesive 350-line chart parser can be safer
than five vague helpers.
