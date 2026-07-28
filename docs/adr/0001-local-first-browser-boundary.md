# ADR-0001: Local-first browser and camera boundary

**Status:** Accepted  
**Date:** 26 July 2026  
**Decision owner:** Product and engineering

## Context

The hackathon requires a web link and a reliable laptop demo. Camera frames are
sensitive and are unnecessary after pose inference.

## Decision

The MVP is a laptop-first browser application. Camera frames enter only the
camera/pose adapter, are processed in memory, and are discarded. Domain code
receives timestamped landmarks or movement events, never media objects.
Derived session summaries may be persisted locally. A backend is an optional
adapter and cannot become necessary for the core play loop.

## Consequences

- Venue play can work without a signed-in cloud session.
- Raw-frame storage or upload is an architecture violation.
- Pose providers remain replaceable.
- Browser performance is a release gate.
- Any later research recording requires a separate product, consent, security,
  and regulatory decision.
