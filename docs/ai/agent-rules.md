# AI agent operating rules

**Status:** Binding  
**Owner:** Engineering lead  
**Reference when:** Before every task.  
**Agent obligation:** Follow these rules even when a shortcut would make the
current task faster.

## 1. Load context deliberately

1. Read `docs/README.md`.
2. Read `docs/context/current-project-state.md`.
3. Read the minimum task route from the index.
4. Inspect affected code, tests, configuration, and working-tree changes.
5. State assumptions that materially affect scope.

Do not bulk-load every document and then ignore its distinctions.

## 2. Respect authority and scope

- The PRD defines product requirements; do not redesign them incidentally.
- Accepted ADRs define architecture; do not bypass them with a local shortcut.
- Existing user changes belong to the user.
- A request to plan, explain, audit, or document does not authorise product
  implementation.
- A feature request authorises normal in-scope implementation and verification,
  not unrelated cleanup or deployment.

## 3. Work in vertical, reviewable increments

Each increment should connect one user behaviour through its required layers
and tests. Prefer a complete small path over many disconnected foundations.
Keep the repository runnable between increments.

## 4. Maintain truthfulness

- Proposed is not implemented.
- Implemented is not tested.
- Tested locally is not deployed.
- Sent to a sandbox is not received by a real caregiver.
- Simulated history is not user history.
- A gameplay measure is not a clinical biomarker.

Report the highest verified state and the unresolved gate.

## 5. Protect product invariants

Read `context/business-rules.md` before work involving camera, scoring, trends,
sharing, music, or fallback data. Add tests that name the affected rule IDs.

## 6. Make architecture boring

- Domain logic is framework-independent.
- Browser, pose, storage, audio, and WeChat code are adapters.
- Dependencies point inward.
- Side effects occur at explicit boundaries.
- One module has one coherent reason to change.
- Duplicate business logic is extracted only after duplication is real.

## 7. Verify proportionally

Run the smallest relevant checks during iteration and the full applicable gate
before handoff. Record commands and outcomes. Do not weaken or delete a test to
make a change pass without explaining why the test was wrong.

## DO NOT

- Do not invent APIs, SDK support, credentials, environment variables, or live
  service state.
- Do not store or log raw camera frames.
- Do not introduce a global store for local component state.
- Do not add a backend merely to make the architecture look scalable.
- Do not add a dependency for a function the platform or existing stack
  already provides.
- Do not mix simulated and real data.
- Do not send a caregiver message without explicit consent and an owner-approved
  test channel.
- Do not introduce clinical language or thresholds.
- Do not silently change a public contract, schema, architecture pattern, or
  product decision.
- Do not create `utils.ts`, `helpers.ts`, or `common.ts` as miscellaneous bins.
- Do not claim completion while required docs or tests are stale.
