# Logging and monitoring

**Status:** Binding design; tooling is proposed until scaffolded  
**Owner:** Engineering lead  
**Reference when:** Adding logs, diagnostics, telemetry, or alerts.  
**Agent obligation:** Make failures diagnosable without recording raw or
identifying media.

## Structured event shape

Every diagnostic event should include:

- event name;
- severity;
- timestamp;
- app/build version;
- session correlation ID;
- component/adapter;
- stable error code;
- privacy-safe numeric context;
- simulated/test mode.

## Never log

- Camera frames, screenshots, face crops, pose images, or audio.
- Names, contact addresses, WeChat identifiers, consent content, or message
  bodies.
- Full landmark arrays in production logs.
- Secrets, tokens, cookies, or environment dumps.
- Raw health-adjacent session histories.

Use aggregates such as inference FPS, valid-frame ratio, dropped-frame count,
audio drift, and error code.

## Levels

- `debug`: local opt-in diagnostics, stripped or disabled in production.
- `info`: lifecycle facts such as calibration result and session completion.
- `warn`: degraded but recovered state.
- `error`: operation failed or data could not be safely committed.

## Metrics

Track locally or with consented minimal telemetry:

- calibration duration/success;
- inference and render rates;
- motion-to-feedback latency;
- audio drift;
- quality-gate exclusions;
- session completion;
- notification attempt/result by anonymous code.

Operational monitoring must not become wellness surveillance. Product analytics
requires the KPI and privacy review.

## Alerts

Engineering alerts are for service health, not player health. Thresholds must
have an owner, runbook, and false-positive review.
