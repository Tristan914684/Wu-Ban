# Release process

**Status:** Binding once a deployable app exists  
**Owner:** Release owner  
**Reference when:** Creating a demo candidate, public deployment, or submission
artifact.  
**Agent obligation:** Release an immutable verified version; distinguish local,
preview, production, and submitted states.

## Release candidate

- Freeze scope and dependencies.
- Confirm clean install from lockfile.
- Run `verify`, production build, and browser tests.
- Run security/licence/secret checks.
- Test camera, audio, standing, seated, invalid-session, simulated-label,
  consent, revoke, and check-in paths.
- Measure performance on the demo laptop.
- Complete five consecutive live runs.

## Version

Record:

- semantic version or immutable commit;
- build time;
- dependency lockfile;
- model/chart/algorithm/content versions;
- Miora/CodeBuddy provenance bundle;
- release notes;
- known limitations.

## Deploy

- Deploy the exact release candidate.
- Keep previous known-good version available for rollback.
- Run signed-out smoke test on production URL.
- Test HTTPS/camera policy.
- Verify no test credentials or personal data.
- Verify fallback works without hidden network assumptions.

## Submission

- Web link.
- Demo video.
- Project deck.
- AI creation evidence.
- Rights/attribution.
- team information.
- Submission receipt and timestamp.

A deployed URL is not a submitted project; a submitted project is not accepted
or judged until externally confirmed.

## Post-release

Monitor technical health, freeze evidence, update current state, and record
incidents. Do not hot-edit production without a versioned change.
