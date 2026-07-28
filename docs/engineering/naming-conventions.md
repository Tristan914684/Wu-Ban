# Naming conventions

**Status:** Binding  
**Owner:** Engineering lead  
**Reference when:** Introducing files, modules, types, events, data fields, or
visible copy.  
**Agent obligation:** Use domain terms from the glossary and names that reveal
units and state.

## Code

- Types/classes/components: `PascalCase`.
- Variables/functions: `camelCase`.
- Constants that are configuration values: `camelCase`; true fixed protocol
  constants may use `UPPER_SNAKE_CASE`.
- Files: `kebab-case` unless the selected framework requires component names.
- Tests: `<subject>.test.ts` or selected-runner equivalent.
- Boolean names: `is`, `has`, `can`, `should`, `was`.
- Events: completed facts, such as `sessionCompleted`; commands use imperatives,
  such as `sendCheckIn`.

## Domain precision

Include units:

- `timingErrorMs`, not `timingError`.
- `cueTimeSec`, not `time`.
- `validFrameRatio`, not `quality`.

Include state:

- `provisionalBaseline`, not `baseline` before it qualifies.
- `trendValidSession`, not `goodSession`.
- `simulatedHistory`, not `history` when seeded.

## Prohibited names

- `data`, `info`, `item`, `manager`, `processor`, `service`, or `handler`
  without a domain qualifier.
- `cognitiveScore`, `brainScore`, `mciRisk`, or `diagnosis`.
- `elderlyUser`; use `player`.
- `caregiverAlert` for the MVP; use `checkIn`.
- `real` as a data-mode boolean; use an explicit
  `source: "captured" | "simulated"`.

## Public contracts

Persisted and API field names use `snake_case` only if the selected storage/API
convention decides so; TypeScript maps them at the adapter. Never mix naming
styles inside one contract.
