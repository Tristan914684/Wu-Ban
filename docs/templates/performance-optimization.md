# Performance optimization plan

**Use when:** A measured budget is missed.  
**Obey:** Same-device baseline, one hypothesis at a time, no semantic or privacy
regression.

```md
# Improve [metric]

## Budget and baseline
- Metric/budget:
- Actual median/p95:
- Device/browser/build:
- Trace/chart:

## Profile
- Dominant cost:
- Evidence:
- Hypothesis:

## Proposed change
- Mechanism:
- Expected effect:
- New complexity:
- Failure risk:

## Experiment
- Controlled variables:
- Before:
- After:

## Guardrails
- Correctness:
- Latency:
- Memory/bundle:
- Accessibility:
- Privacy:

## Regression enforcement
- Benchmark/test:
- CI/manual gate:

## Rollback
- Trigger:
- Action:
```
