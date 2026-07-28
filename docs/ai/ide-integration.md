# IDE and coding-agent integration

**Status:** Active recommendation  
**Owner:** Engineering lead  
**Reference when:** Configuring Cursor, Claude Code, Copilot, CodeBuddy, Codex,
or another coding agent.  
**Agent obligation:** Point tools to canonical docs; do not fork rules into
tool-specific copies that drift.

## Canonical entrypoint

`AGENTS.md` is the repository-level pointer. It routes to `docs/README.md`,
which routes by task. Tool-specific files should be short adapters.

## Codex and compatible agents

Use `AGENTS.md` directly. Require agents to load:

1. docs index;
2. current project state;
3. agent rules;
4. task route.

## Cursor

Suggested `.cursor/rules/project-docs.mdc`:

```md
---
description: DanceBros repository operating rules
alwaysApply: true
---
Read AGENTS.md and docs/README.md. Follow their authority order. Load the
task-specific documents before editing. Do not duplicate those rules here.
```

## Claude Code

Suggested `CLAUDE.md`:

```md
Follow AGENTS.md. Read docs/README.md and current project state before work.
Treat the PRD, accepted decisions, and ADRs as binding in their documented
authority order.
```

## GitHub Copilot

Suggested `.github/copilot-instructions.md` uses the same pointer. Add
path-specific instruction files only for stable differences, such as domain
modules or tests.

## CodeBuddy

Configure the project context to include `AGENTS.md`, `docs/README.md`, the
current task route, and the approved feature spec. Record material contributions
under `integrations/ai-creation-provenance.md`.

## Context hygiene

- Do not paste the entire docs tree into every prompt.
- Do not put secrets, recipients, personal metrics, or raw media into prompts.
- Cite requirement/business-rule/ADR IDs in implementation prompts.
- Ask tools to report commands and outcomes, not hidden chain-of-thought.
- Review generated changes with the same gates as human changes.

## Drift prevention

CI should verify these adapter files contain a pointer to `AGENTS.md` and do not
become independent rulebooks. When the canonical docs change, tool adapters
normally require no update.
