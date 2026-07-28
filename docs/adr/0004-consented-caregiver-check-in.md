# ADR-0004: Consented caregiver check-in, not a health alert

**Status:** Accepted  
**Date:** 26 July 2026  
**Decision owner:** Product

## Context

The edited PRD includes a real caregiver alert and asks for WeChat support, but
also excludes real health alerts and clinical conclusions.

## Decision

The MVP may send a real message through an owner-configured WeChat test or
sandbox channel. It is a **check-in**:

- the player has separately approved the recipient and scope;
- the trigger is a transparent prototype rule over valid sessions;
- the message identifies uncertainty and says it is not a diagnosis;
- the player can revoke future sharing;
- delivery, consent, and rule versions are auditable;
- the demo never implies clinical urgency.

Production rollout, automated medical escalation, and clinician messaging are
not approved.

## Consequences

- Notification transport is behind a port.
- Tests must cover consent, revocation, idempotency, duplicate suppression, and
  simulated-data separation.
- The exact WeChat surface remains a decision gate.
