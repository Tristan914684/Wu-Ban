# Documentation operating system

**Status:** Active  
**Owner:** Project lead  
**Purpose:** Route humans and AI agents to the minimum authoritative context
needed for safe, consistent work.

This folder is the repository's operating system. It is intentionally more
structured than a wiki and less permissive than a collection of notes. Every
document has one job. New rules belong in the narrowest authoritative file and
should be linked rather than copied.

## Authority and conflict order

Apply documents in this order:

1. Applicable law, hackathon rules, and explicit current user direction.
2. [`PRODUCT_REQUIREMENTS.md`](PRODUCT_REQUIREMENTS.md) for product scope,
   safety, and acceptance.
3. [`product/decision-log.md`](product/decision-log.md) for later approved
   product clarifications.
4. Accepted [`adr/`](adr/) records for architecture.
5. [`context/current-project-state.md`](context/current-project-state.md) for
   verified implementation state.
6. Engineering, frontend, workflow, and governance standards.
7. Templates and examples.

If two same-level documents conflict, do not implement through the conflict.
Record it in `context/known-issues.md` and use
`governance/decision-framework.md`.

## Minimum context by task

| Task | Read first | Then read |
|---|---|---|
| Any change | This file, current project state, agent rules | Task-specific row below |
| Product or scope | PRD, decision log | Product principles, roadmap |
| New feature | Feature spec, business rules | Architecture, testing, relevant frontend rules |
| Gameplay/scoring | Domain knowledge, business rules | Architecture, performance, testing |
| Pose/camera | Security, performance | ADR-0001, architecture, testing |
| Trend or caregiver | Business rules, claim boundary ADR | Security, API/data, WeChat integration |
| UI/UX | UI principles, accessibility | Design system, component architecture, content |
| Dependency | Dependency policy | Tech-stack policy, dependency approval |
| Refactor | Refactoring guidelines | Architecture, tests, refactor template |
| Bug | Debugging guide | Bug template, relevant standard |
| Release/demo | Release process | Deployment checklist, current state |
| Incident | Incident response | Incident template, logging/monitoring |

## Directory tree

```text
docs/
├── README.md
├── PRODUCT_REQUIREMENTS.md
├── adr/
│   ├── README.md
│   ├── 0001-local-first-browser-boundary.md
│   ├── 0002-single-primary-player.md
│   ├── 0003-wellness-claim-boundary.md
│   ├── 0004-consented-caregiver-check-in.md
│   └── 0005-browser-application-stack.md
├── ai/
│   ├── agent-rules.md
│   ├── anti-patterns.md
│   ├── coding-contract.md
│   ├── definition-of-done.md
│   ├── ide-integration.md
│   ├── pr-review-checklist.md
│   └── task-execution-protocol.md
├── context/
│   ├── business-rules.md
│   ├── current-project-state.md
│   ├── domain-knowledge.md
│   ├── glossary.md
│   ├── known-issues.md
│   └── technical-debt.md
├── documentation/
│   ├── changelog.md
│   ├── freshness-and-ownership.md
│   └── standards.md
├── enforcement/
│   ├── architecture-fitness.md
│   ├── ci-policy.md
│   └── quality-gates.md
├── engineering/
│   ├── api-design.md
│   ├── architecture.md
│   ├── code-style.md
│   ├── database-guidelines.md
│   ├── dependency-policy.md
│   ├── error-handling.md
│   ├── logging-monitoring.md
│   ├── m1-technical-proof.md
│   ├── m2-vertical-slice-evidence.md
│   ├── m3-longitudinal-supporter-evidence.md
│   ├── naming-conventions.md
│   ├── performance-guidelines.md
│   ├── prd-acceptance-audit.md
│   ├── principles.md
│   ├── project-structure.md
│   ├── refactoring-guidelines.md
│   ├── security-guidelines.md
│   ├── state-management.md
│   └── testing-strategy.md
├── frontend/
│   ├── accessibility.md
│   ├── animation-guidelines.md
│   ├── component-architecture.md
│   ├── content-design.md
│   ├── design-system.md
│   ├── forms-and-validation.md
│   ├── frontend-performance.md
│   ├── interaction-guidelines.md
│   ├── responsive-design.md
│   ├── ui-decision-brief.md
│   └── ui-principles.md
├── governance/
│   ├── change-management.md
│   ├── contribution-guidelines.md
│   ├── decision-framework.md
│   ├── dependency-decisions.md
│   ├── dependency-approval.md
│   └── tech-stack-policy.md
├── integrations/
│   ├── ai-creation-provenance.md
│   └── wechat-caregiver-notifications.md
├── product/
│   ├── decision-log.md
│   ├── feature-prioritization.md
│   ├── feature-spec-template.md
│   ├── kpi-framework.md
│   ├── music-and-asset-rights.md
│   ├── product-principles.md
│   ├── roadmap.md
│   ├── trend-and-supporter-spec.md
│   ├── vertical-slice-spec.md
│   └── user-personas.md
├── templates/
│   ├── api-addition.md
│   ├── architecture-rfc.md
│   ├── bug-fix.md
│   ├── feature-implementation.md
│   ├── incident-remediation.md
│   ├── migration.md
│   ├── performance-optimization.md
│   ├── postmortem.md
│   ├── refactoring.md
│   ├── retrospective.md
│   └── ui-change.md
└── workflow/
    ├── branching-strategy.md
    ├── code-review-process.md
    ├── debugging-guide.md
    ├── deployment-checklists.md
    ├── development-lifecycle.md
    ├── local-development.md
    ├── release-process.md
    └── incident-response.md
```

## File catalogue

### AI

- `agent-rules.md` - repository-level agent behaviour; read for every task;
  obey scope, evidence, safety, and documentation rules.
- `coding-contract.md` - implementation invariants; read before code; preserve
  boundaries, explicit contracts, and testability.
- `task-execution-protocol.md` - inspect-plan-change-verify sequence; read
  before multi-file work; do not skip discovery or validation.
- `definition-of-done.md` - completion gates; read before claiming completion;
  distinguish local, simulated, sandbox, and live.
- `pr-review-checklist.md` - self-review and peer-review gates; read before
  handoff; surface defects rather than narrating changes.
- `anti-patterns.md` - prohibited failure modes; consult during design and
  review; remove accidental complexity and unsafe product shortcuts.
- `ide-integration.md` - thin configuration patterns for Codex, Cursor, Claude,
  Copilot, and CodeBuddy; point tools to canonical docs instead of duplicating
  rules.

### Engineering

- `principles.md` - KISS/YAGNI/DRY/SOLID application; use for all design.
- `architecture.md` - module and dependency boundaries; use for every
  cross-layer change.
- `project-structure.md` - canonical folders and ownership; use when creating
  or moving files.
- `code-style.md` - TypeScript and general code rules; use while implementing.
- `naming-conventions.md` - domain and file naming; use before introducing a
  public name.
- `error-handling.md` - typed failures and recovery; use for every I/O path.
- `logging-monitoring.md` - privacy-safe observability; use for diagnostics.
- `m1-technical-proof.md` - measured provider, camera, audio, licence, and
  remaining real-device evidence; use for gameplay critical-path changes.
- `m2-vertical-slice-evidence.md` - implemented player journey plus automated,
  local-browser, and open device evidence; use when reporting M2 progress.
- `m3-longitudinal-supporter-evidence.md` - trend, simulated-data, grant,
  revocation, migration, and preview evidence plus the open WeChat gate.
- `prd-acceptance-audit.md` - requirement-by-requirement implementation,
  automated evidence, device gates, owner gates, and research gates.
- `testing-strategy.md` - test pyramid and required evidence; use when planning
  or reviewing changes.
- `performance-guidelines.md` - camera/audio/game budgets; use on the live
  gameplay path.
- `security-guidelines.md` - camera, consent, secrets, storage, and sharing;
  use for any data-bearing feature.
- `api-design.md` - ports, HTTP contracts, idempotency, and versioning; use
  when adding an integration or backend.
- `database-guidelines.md` - local persistence and future schema evolution;
  use for stored data.
- `state-management.md` - ownership of durable, server, and ephemeral state;
  use for UI and session flow.
- `dependency-policy.md` - dependency decision and pinning rules; use before
  package changes.
- `refactoring-guidelines.md` - safe structural change; use when behaviour
  should remain unchanged.

### Frontend

- `ui-principles.md` - player/supporter experience law; use for any screen.
- `design-system.md` - tokens and visual consistency; use for styling.
- `component-architecture.md` - component boundaries; use for React/UI design.
- `accessibility.md` - older-adult, keyboard, sensory, and motion standards;
  use for every user-facing change.
- `responsive-design.md` - laptop-first and future TV behaviour; use for layout.
- `frontend-performance.md` - rendering and inference isolation; use on the
  gameplay route.
- `interaction-guidelines.md` - states, feedback, and recovery; use for flows.
- `animation-guidelines.md` - purposeful and reduced motion; use for Miora and
  runtime motion.
- `content-design.md` - Simplified Chinese, English, consent, and claim copy;
  use for visible language.
- `forms-and-validation.md` - consent/settings form behaviour; use where input
  is collected.
- `ui-decision-brief.md` - selected product surface, editorial direction,
  motion budget, typography, assets, and state visuals; use before UI code.

### Product

- `product-principles.md` - product quality bar; read for product decisions.
- `feature-spec-template.md` - required feature contract; use before non-trivial
  feature implementation.
- `roadmap.md` - ordered milestones and scope freeze; use when selecting work.
- `user-personas.md` - intended users and exclusions; use in UX decisions.
- `decision-log.md` - accepted product decisions; read after the PRD.
- `kpi-framework.md` - metric definitions and prohibited vanity/clinical KPIs;
  use for analytics.
- `feature-prioritization.md` - must/should/stretch gate; use for scope changes.
- `music-and-asset-rights.md` - song and asset rights; use before adding media.
- `trend-and-supporter-spec.md` - M3 baseline, simulation, consent, revocation,
  check-in, idempotency, and transport-failure contract.
- `vertical-slice-spec.md` - consent-to-result acceptance, data, state,
  safety, architecture, and test contract for the first playable path.

### Context

- `current-project-state.md` - verified present state; read for every task and
  update after material changes.
- `domain-knowledge.md` - pose, rhythm, session, and trend concepts; use for
  domain work.
- `business-rules.md` - invariant product rules; use for domain logic and tests.
- `glossary.md` - canonical terms; use for naming and copy.
- `known-issues.md` - unresolved blockers and ambiguities; read before planning.
- `technical-debt.md` - accepted shortcuts with exit criteria; use before
  adding another shortcut.

### Workflow and governance

- `workflow/*` defines development, review, debugging, release, and deployment
  procedures, including incident response. Agents must use the applicable
  checklist and report actual evidence.
- `governance/*` defines decision authority, stack and dependency changes,
  contributions, and change control. Agents may not make a material
  architecture or scope change without the required record.
- `governance/dependency-decisions.md` records approved, rejected, and
  time-boxed dependency evaluations before manifest changes.

### Templates, documentation, and enforcement

- `templates/*` are fill-in contracts for features, bugs, refactors, migrations,
  APIs, UI, performance, incidents, RFCs, postmortems, and retrospectives. Use
  the smallest template that covers the work.
- `documentation/*` governs writing, ownership, freshness, and the docs
  changelog.
- `enforcement/*` defines measurable checks, future CI wiring, and architecture
  fitness functions. A proposed check is not a passing check until it exists
  and runs.
- `adr/*` contains immutable architectural decisions. Supersede; do not rewrite
  history.
- `integrations/*` contains project-specific external integration contracts.

## Maintenance rule

Every material change must answer:

1. Did product scope or language change? Update the PRD or decision log.
2. Did architecture change? Add or supersede an ADR.
3. Did implementation state change? Update current project state.
4. Did a standard prove wrong? Update the owning standard and changelog.
5. Did a shortcut enter? Record its owner, risk, and exit criterion as debt.

Docs that are merely aspirational must say **Proposed**. Docs describing
verified behaviour must cite a command, test, artifact, or implementation path.
