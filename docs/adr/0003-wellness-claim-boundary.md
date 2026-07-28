# ADR-0003: Wellness trend, not clinical screening

**Status:** Accepted  
**Date:** 26 July 2026  
**Decision owner:** Product

## Context

Pose-derived gameplay measures may be useful for repeated personal comparison,
but the project has no clinical validation for MCI screening, diagnosis, risk,
or urgency.

## Decision

The product reports fun scores, session measures, and a
movement-and-attention trend. It may suggest an earlier conversation. It does
not emit a cognitive profile, MCI probability, diagnosis, clinical threshold,
fall risk, or "months earlier" detection claim.

## Consequences

- Product copy and data contracts must preserve this boundary.
- Simulated longitudinal data remains visibly labelled.
- Any clinical claim requires a new evidence programme, regulatory review, and
  superseding product decision.
