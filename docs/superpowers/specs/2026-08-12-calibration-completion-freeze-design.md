# Calibration Completion Freeze Design

**Status:** Approved

**Date:** 12 August 2026

**Scope:** Standing and seated camera calibration

## Problem

The calibration screen renders active progress with
`Math.round(progress * 100)`. A value just below the required three seconds,
such as `2999 / 3000`, is therefore displayed as `100%` even though the
tracking-stability state is still not ready. A player who trusts that display
and releases the calibration position can reset the attempt or allow a later
standing sample to influence the baseline.

Both standing and seated calibration use this shared progress and completion
loop, so the misleading completion state affects both modes.

## Accepted Behaviour

- While calibration is active, displayed progress remains between 0% and 99%.
- Reaching the full three-second stability requirement immediately freezes the
  accepted result and stops requesting further detector frames.
- The ready state explicitly reports that calibration is complete at 100%.
- The player may release the standing position or lower their hands as soon as
  the ready state appears, before selecting the existing confirmation button.
- Standing uses the averaged calibration captured only through the accepted
  completion frame. Later body movement cannot change it.
- Seated mode does not introduce a standing-style positional baseline; it
  simply shares the same truthful completion and detector-stop contract.

## Design

`CalibrationScreen` remains the owner of this ephemeral UI state. The existing
domain function `updateTrackingStability` continues to enforce three
uninterrupted seconds and remains independent of React, browser APIs, and the
pose provider.

The framing view will format incomplete progress so it cannot claim 100%. When
`stability.ready` becomes true, the screen stores the final standing average
or the seated completion result, transitions to `ready`, and does not schedule
another animation frame. The ready view will distinguish completion from
active scanning with explicit 100% locked copy while retaining the existing
confirmation action.

This is a local presentation and lifecycle correction. It does not change
MediaPipe thresholds, landmark geometry, movement classification, the
three-second duration, camera privacy boundaries, or session state-machine
transitions.

## Data Flow

1. The detector produces one in-memory landmark frame.
2. The selected mode determines whether that frame is scoreable.
3. `updateTrackingStability` advances or resets uninterrupted progress.
4. Incomplete progress is displayed with a maximum of 99% and scanning
   continues.
5. Ready progress freezes the accepted result, renders the completed 100%
   state, and ends the calibration frame loop.
6. The existing confirmation button passes the frozen result to `App`.

Raw camera frames and landmark traces remain transient and are neither stored
nor transmitted.

## Error and Recovery Behaviour

Missing landmarks, low confidence, or multiple people continue to reset active
stability and show the existing positioning guidance. Model preparation errors
and the labelled synthetic fallback remain unchanged. Leaving the screen still
cancels any outstanding animation-frame request.

## Regression Tests

Component tests will exercise the real calibration state boundary with
controlled timestamps and detector frames:

- an incomplete value that previously rounded to 100% remains active at 99%;
- standing reaches true completion, shows the completed 100% state, stops
  detector calls, and returns the frozen averaged baseline;
- seated reaches true completion, shows the same completed state, and stops
  detector calls;
- frames offered after completion cannot alter the accepted result;
- existing provider-error fallback behaviour remains passing.

Focused component and tracking-stability tests will run during iteration. The
applicable repository verification gates will run before completion, while a
representative real-camera pass remains separate device evidence.

## Risk and Rollback

The principal risk is accidentally stopping one frame too early or preventing
the ready transition. Controlled boundary timestamps cover both cases. The
change is reversible by restoring the prior calibration presentation and frame
completion logic; no schema, dependency, or persisted data migration is
involved.
