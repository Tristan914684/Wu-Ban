# Component architecture

**Status:** Binding after UI stack selection  
**Owner:** Frontend engineering  
**Reference when:** Creating or refactoring UI components.  
**Agent obligation:** Keep components task-focused and move domain decisions out
of rendering code.

## Component levels

- **Primitives:** Button, Text, Stack, Dialog, Progress, VisuallyHidden. No
  domain language.
- **Patterns:** PermissionPanel, CalibrationFrame, StatusBanner,
  ConsentSummary, MetricTrend. Compose primitives around one UX pattern.
- **Feature components:** CalibrationFlow, GameplayHUD, SessionResult,
  SupporterCheckIn. Own feature presentation and invoke use cases.
- **Routes/screens:** Assemble feature components and route-level recovery.

## Rules

- Components receive serializable, provider-neutral view models where possible.
- A component does not parse pose SDK output, calculate a trend, persist a
  session, or select a caregiver.
- Keep state at the lowest common owner.
- Prefer composition and explicit variants to boolean prop combinations.
- Expose semantic events such as `onRetryCamera`, not internal setter callbacks.
- One component owns focus restoration for a dialog/step transition.
- Feature components may import UI; UI cannot import features.

## Hooks/controllers

Hooks may coordinate browser lifecycle or translate application state for UI.
They do not become miscellaneous business-logic containers. A hook that
calculates scoring belongs in the domain instead.

## Props

- Required inputs are required.
- Use discriminated unions for mutually exclusive states.
- Avoid passing a whole store or service locator.
- Children slots represent real composition points.

## Test contract

Primitives: accessibility and variants.  
Patterns: state rendering and interaction.  
Features: user journeys with fake ports.  
Routes: error boundary, navigation, and integration.
