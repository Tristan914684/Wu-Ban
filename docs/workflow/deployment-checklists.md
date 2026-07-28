# Deployment checklists

**Status:** Binding checklist once hosting exists  
**Owner:** Release owner  
**Reference when:** Deploying preview or production.  
**Agent obligation:** Mark only checks actually performed against the exact
artifact.

## Pre-deploy

- [ ] Approved release commit/version.
- [ ] Clean locked install.
- [ ] Lint, typecheck, tests, and build pass.
- [ ] Environment values validated.
- [ ] No client-bundled secrets.
- [ ] Music/assets and attribution approved.
- [ ] Simulated data segregated and labelled.
- [ ] Source maps/logging follow privacy policy.
- [ ] Rollback target identified.

## Preview

- [ ] HTTPS and camera work.
- [ ] Core synthetic journey passes.
- [ ] Standing and seated routes render.
- [ ] Notification transport is sandbox/test-labelled.
- [ ] Accessibility smoke passes.
- [ ] Performance measured.

## Production

- [ ] Immutable release deployed.
- [ ] Signed-out new browser loads.
- [ ] Consent precedes camera prompt.
- [ ] Raw media does not appear in network/storage inspection.
- [ ] Real-history empty state is clean.
- [ ] Demo history remains labelled.
- [ ] Revoked supporter cannot send or view.
- [ ] Error monitoring receives a synthetic safe test.
- [ ] Previous version can be restored.

## Post-deploy

- [ ] URL and version recorded.
- [ ] Smoke evidence retained.
- [ ] Current project state updated.
- [ ] Submission artifacts reference the deployed version.
- [ ] Rollback performed if a safety, consent, raw-media, or claim boundary
  fails.
