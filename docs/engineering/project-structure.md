# Project structure

**Status:** Active
**Owner:** Engineering lead  
**Reference when:** Creating or moving source files.  
**Agent obligation:** Follow this implemented structure; update this document
and an ADR before adopting another pattern.

```text
src/
├── app/                    # composition root, routes, providers
├── domain/
│   ├── chart/
│   ├── consent/
│   ├── movement/
│   ├── quality/
│   ├── scoring/
│   ├── session/
│   └── trend/
├── application/            # use cases and ports
├── adapters/
│   ├── audio/
│   ├── camera/
│   ├── notifications/
│   ├── pose/
│   └── storage/
├── features/
│   ├── calibration/
│   ├── gameplay/
│   ├── progress/
│   └── sharing/
├── ui/
│   ├── components/
│   ├── primitives/
│   └── tokens/
├── content/                # localized copy, charts, safe configuration
└── test-support/           # builders, synthetic traces, clocks
```

## Placement test

- Business decision with no I/O: `domain`.
- Orchestration across decisions/I/O: `application`.
- Translation to an external API: `adapters`.
- User-facing flow assembly: `features`.
- Reusable visual primitive with no domain decision: `ui`.
- Static, reviewed product material: `content`.

## Import direction

`app -> features -> application -> domain`  
`app -> adapters -> application/domain contracts`  
`ui` may be used by `features`; `ui` imports no feature.

Cross-feature imports are prohibited. Shared behavior moves to application,
domain, or UI only when ownership is clear.

## File rules

- One primary export per module file unless small types are inseparable.
- Tests live beside pure modules or in feature-level integration folders,
  according to the selected runner.
- Generated files live under a named generated directory and are never
  hand-edited.
- Barrel files exist only at module public boundaries and do not create cycles.
