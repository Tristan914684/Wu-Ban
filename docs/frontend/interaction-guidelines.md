# Interaction guidelines

**Status:** Binding  
**Owner:** Product design  
**Reference when:** Designing flows, feedback, notifications, or state
transitions.  
**Agent obligation:** Make the next action and recovery clear after every
interaction.

## Feedback timing

- Input acknowledgement: immediate.
- Pose/cue feedback: within the performance budget.
- Save/send action: show in-progress, success, or specific failure.
- Long operation: show stage, cancel when safe, and retry/resume behavior.

## Optimistic UI

Allowed only for reversible, low-risk local preference changes. Do not
optimistically show:

- consent granted or revoked before persistence succeeds;
- caregiver message sent;
- session committed;
- trend updated.

## Camera permission

Explain first, request second, recover third. The denial surface stays useful
and provides browser-specific retry. Do not loop permission prompts.

## Gameplay

- Use "Good," "Nearly," and "Try the next one"; do not interrupt for each miss.
- Unscoreable tracking periods show reposition guidance without blame.
- A short grace period may preserve music flow, but invalid data is marked.
- Pause freezes scoring and clearly explains restart/resume.

## Notifications

- In-app status and caregiver transport are distinct.
- A send has Preview -> Confirm recipient -> Sending -> Sent/Failed.
- Failure does not revoke consent or duplicate on retry.
- Never use red urgency styling for a wellness check-in.

## Onboarding

Reach first successful movement within 90 seconds. Permit replay, gentler mode,
and seated mode. Do not collect profile details before first value unless
required for consent or safety.
