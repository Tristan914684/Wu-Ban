# Domain knowledge

**Status:** Active  
**Owner:** Product and engineering  
**Reference when:** Working on gameplay, pose processing, metrics, trends, or
caregiver sharing.  
**Agent obligation:** Preserve the distinctions below in code, tests, data, and
copy.

## Core loop

A session is a four-minute flow: calibration, warm-up quality gate, follow
moves, move to the beat, lantern memory/no-go round, cool-down, and result.

## Three separate outputs

1. **Fun score** - immediate Beat, Shape, Flow, and Memory feedback. It exists
   to make play rewarding.
2. **Session measures** - derived timing, direction, range consistency, hold
   stability proxy, sequence, inhibition, and recovery values.
3. **Personal trend** - a comparison of valid sessions with the same player's
   provisional baseline.

Never collapse these into one "brain score."

## Time model

Audio time is authoritative for cue scheduling. Pose frames are timestamped and
mapped to that clock. Render arrival time is not a valid beat timestamp.

## Quality model

An uncertain frame is not a miss. It is unscoreable. A session becomes
trend-valid only after calibration, sufficient visible landmarks, completion,
audio-clock integrity, and absence of an exclusion context.

## Pose model

The AI pose provider emits landmarks and confidence. Transparent domain rules
convert accepted landmarks into movement events. Provider-specific objects must
not leak into scoring or trend code.

## Trend model

The prototype uses a personal median and median absolute deviation over five
valid sessions. A simulated trend flag requires repeated shifts across multiple
metric families. This is an explainable demo rule, not a validated clinical
threshold.

## Social model

Companions can dance, but one calibrated primary player owns the session.
Supporters receive only the scope the player granted. A check-in is a social
prompt, not a health conclusion.
