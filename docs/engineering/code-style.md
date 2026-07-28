# Code style

**Status:** Binding after a TypeScript stack is approved  
**Owner:** Engineering lead  
**Reference when:** Writing or reviewing code.  
**Agent obligation:** Prefer explicit, readable code; automated formatter and
linter output take precedence over personal style.

## Baseline

- TypeScript strict mode.
- No implicit `any`; explicit `unknown` at untrusted boundaries.
- Prefer immutable values and readonly domain records.
- Prefer `const`; use mutation only inside a small, performance-justified scope.
- Use early returns to keep the main path visible.
- Exhaustively handle discriminated unions.
- Avoid non-null assertions outside a validated boundary.
- Avoid type assertions that skip parsing.
- No floating promises.

## Complexity budgets

Budgets trigger refactoring discussion, not mechanical splitting:

- Function: target <= 40 logical lines and cyclomatic complexity <= 10.
- UI component: target <= 200 logical lines.
- Production file: target <= 300 logical lines; review required above 400.
- Parameter count: target <= 4; use a named object when values form a concept.
- Nesting: target <= 3 levels.

Generated, declarative chart, localization, and test-fixture files may exceed
line budgets when splitting reduces readability.

## Async and concurrency

- Use `async`/`await` with explicit cancellation where work can outlive a
  screen or session.
- Tag asynchronous pose results with session and frame identity.
- Ignore stale results after session transition.
- Bound queues and drop obsolete frames rather than increasing latency.
- Retry only classified transient failures, with backoff and a fixed limit.
- Make every retried side effect idempotent.

## Comments

Comments explain why, risk, external constraints, or surprising invariants.
They do not restate syntax. `TODO` requires an issue/debt ID and exit criterion.

## Imports

- Use configured aliases only at module boundaries.
- Use relative imports within a small module.
- No deep imports into another module's internals.
- Order: platform, third-party, internal modules, relative, type-only.
- Enforce cycles automatically once the scaffold exists.
