# Engineering principles

**Status:** Binding  
**Owner:** Engineering lead  
**Reference when:** Making any design or implementation trade-off.  
**Agent obligation:** Apply the principles in this order; do not cite a slogan
to justify complexity.

## Priority order

1. User safety and consent.
2. Correctness and truthful state.
3. Simplicity and readability.
4. Testability and reversibility.
5. Performance on the measured critical path.
6. Extensibility supported by an actual next use.

## How principles apply

- **KISS:** Prefer the smallest model that explains the behavior.
- **YAGNI:** Do not build cloud sync, true multiplayer, generic workflow
  engines, or plug-in systems before their decision gates.
- **DRY:** Eliminate repeated business knowledge, not similar-looking code with
  different reasons to change.
- **SOLID:** Use responsibility and dependency inversion to protect domain
  logic. Do not create interface ceremony for its own sake.
- **Composition over inheritance:** Assemble game phases, scoring policies, and
  adapters from explicit parts.
- **Functional core / imperative shell:** Calculate movement events, scores,
  quality, chart validity, and trends with pure functions; keep camera, audio,
  storage, and messaging at the edge.
- **Domain-driven thinking:** Use the glossary and business-rule IDs. A rich
  vocabulary matters more than entity/repository pattern cosplay.
- **Hexagonal architecture:** Ports exist at real I/O or provider boundaries.
  They do not wrap every local function.
- **Event-driven design:** Use named domain events only when multiple independent
  consumers genuinely need the same completed fact. Prefer a direct call for a
  single synchronous consumer.

## Trade-off test

Before choosing a more complex design, answer:

1. Which current requirement cannot the simple design meet?
2. What measurable risk does the complexity reduce?
3. What new failure mode does it add?
4. How is it tested and observed?
5. How can it be removed?

If the answers are vague, choose the simpler design.
