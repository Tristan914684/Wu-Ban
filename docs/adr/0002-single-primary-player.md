# ADR-0002: One primary player owns a trend-valid session

**Status:** Accepted  
**Date:** 26 July 2026  
**Decision owner:** Product and engineering

## Context

Social co-dancing is desirable, but multi-person occlusion and identity swaps
can corrupt personal longitudinal data.

## Decision

Each scored session has exactly one calibrated primary player. Companions may
dance outside the scoring boundary. When identity confidence is lost, affected
frames are unscoreable and may invalidate the session for trend use.

## Consequences

- The MVP can remain social without claiming multi-person profiling.
- Session storage does not accept multiple trend owners.
- True party scoring requires a new RFC and cannot update personal trends until
  identity persistence and fairness are validated.
