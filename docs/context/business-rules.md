# Business rules

**Status:** Binding  
**Owner:** Product lead  
**Reference when:** Designing domain logic, persistence, sharing, copy, or
acceptance tests.  
**Agent obligation:** Encode these rules explicitly; do not weaken them for demo
convenience.

| ID | Rule |
|---|---|
| BR-001 | A camera permission prompt must follow, never precede, plain-language disclosure. |
| BR-002 | Raw image, video, face crop, and audio capture are not persisted or transmitted. |
| BR-003 | One calibrated primary player owns a scored session. |
| BR-004 | Low-confidence or occluded frames are unscoreable, not incorrect. |
| BR-005 | An invalid, interrupted, or excluded session cannot update the personal trend. |
| BR-006 | A player keeps participation credit even when a session is excluded from trends. |
| BR-007 | Fun score, session measures, and personal trend are separate concepts and data. |
| BR-008 | Simulated history carries `simulated=true` and a visible label at every consumer. |
| BR-009 | Supporter sharing is off by default, purpose-specific, and revocable. |
| BR-010 | Revocation blocks future access without deleting the player's own history unless separately requested. |
| BR-011 | A caregiver check-in can be sent only to a player-approved recipient and through an explicitly configured test/sandbox channel until production review. |
| BR-012 | Check-in copy states the observed change, plausible uncertainty, and the non-diagnostic boundary. |
| BR-013 | No interface or API emits MCI probability, diagnosis, clinical urgency, or a composite brain-health score. |
| BR-014 | Difficulty can increase only one dimension at a time and always retains a gentler option. |
| BR-015 | Standing play contains no jumps, fast spins, full backward travel, or required one-leg balance. |
| BR-016 | The seated route is a real hand/finger gesture variant with its own calibration and scoring expectations. |
| BR-017 | Music or visual assets cannot ship without a recorded source, licence, and required attribution. |
| BR-018 | Demo fallback data and controls are visibly identified; they may not masquerade as live camera inference. |

Each rule requires at least one automated test once the affected module exists.
