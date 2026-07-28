# Forms and validation

**Status:** Binding  
**Owner:** Product design and frontend engineering  
**Reference when:** Collecting consent, settings, recipient details, context, or
configuration.  
**Agent obligation:** Minimise fields, validate near the input, and never use a
form to obscure consent.

## Form principles

- Ask only for data needed now.
- One column on player-facing forms.
- Labels remain visible; placeholders are examples, not labels.
- Group by user task, not database model.
- Preserve safe input after recoverable failure.
- Use sensible defaults and expose their meaning.
- Submit has a unique, concrete label.

## Validation

- Validate format on blur or submit, not on every keystroke with noisy errors.
- Show field errors adjacent to the field and a summary when needed.
- Server/adapter validation remains authoritative.
- Do not clear the form on send failure.
- Normalise only when meaning is unambiguous.

## Consent

- No pre-checked sharing.
- Separate purpose, recipient, visible data, and revocation explanation.
- The primary action states the effect: "Share my weekly pattern."
- Consent version and timestamp are recorded.
- Reject consent when the displayed scope and stored scope do not match.

## Caregiver recipient

- Confirm identity through the selected WeChat test workflow.
- Show the exact recipient before send.
- Never autocomplete from unrelated contacts.
- Prevent duplicate submission while a send is pending.

## Context question

"Anything different today?" is optional, quick, and non-judgmental. Choices can
exclude a trend update but never remove the fun result.
