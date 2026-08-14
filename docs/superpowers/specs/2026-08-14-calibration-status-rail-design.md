# Calibration Status Rail Design

**Status:** Approved layout design  
**Date:** 14 August 2026  
**Scope:** Calibration screen presentation only

## Problem

The calibration completion message and the on-device pose or hand AI status
are absolutely positioned over the live camera preview. At their current size,
they hide the player and make it harder to confirm full-body or hand placement.

## Approved Outcome

Keep the 4:3 camera preview as the dominant, unobstructed calibration surface.
Move the calibration status and on-device model status into a responsive rail
directly below the preview:

- calibration status appears on the left;
- on-device pose or hand AI status appears on the right;
- the two panels stack when the available width cannot hold them comfortably;
- current paper-and-ink styling, bilingual copy, live-region semantics, and
  accepted/refused model states remain unchanged.

The framing target and transient landmark drawing remain inside the camera
viewport because they align directly with the player. Existing framing
guidance and detected-parts copy are outside this request and remain unchanged.

## Component and Layout Changes

`CalibrationScreen` will distinguish the camera viewport from the status rail.
The video, synthetic figure, framing target, and landmark overlay remain inside
a clipped 4:3 viewport. The calibration status and `PerceptionStatus` become
siblings in the rail below that viewport.

The shared `PerceptionStatus` component keeps its existing rendering contract.
Calibration-scoped CSS will opt it into normal document flow, so its absolute
positioning in rehearsal and gameplay is not changed.

No pose inference, confidence threshold, calibration timing, camera lifecycle,
state-machine, persistence, or privacy behavior changes.

## Responsive and Accessibility Behaviour

At ordinary laptop widths, the rail uses two columns. At narrower widths it
uses one column so neither panel overlaps or becomes unreadably compressed.
The camera keeps its 4:3 aspect ratio and never uses the status panels as an
overlay.

The live model status retains `aria-live="polite"` and `aria-atomic="true"`.
Visual order and DOM order match: calibration status first, model status
second. Forced-colour borders and readable text contrast remain supported.

## Regression Tests and Verification

Component coverage will assert that both status panels are rendered in a
dedicated status rail outside the camera viewport. Existing standing and
seated calibration lifecycle tests must remain passing.

Verification will include the focused calibration and tracking overlay tests,
lint, typecheck, production build, document validation, and browser inspection
at the reported laptop layout plus a narrower responsive viewport. A real
camera check remains separate device evidence.

## Alternatives Considered

- A right-side status rail would reduce the camera width in the existing aside
  column and become cramped at common laptop widths.
- Moving the panels into the instruction column would separate live feedback
  from the preview and compete with the confirmation action.

The below-camera rail best preserves camera size, status proximity, and the
existing visual direction.

## Risk and Rollback

The main risk is increasing the calibration surface height on short screens.
Compact spacing and responsive stacking will contain the rail without reducing
the preview below its current short-screen sizing rule. The change is
reversible by restoring the prior calibration markup and scoped CSS; it has no
data migration or dependency impact.
