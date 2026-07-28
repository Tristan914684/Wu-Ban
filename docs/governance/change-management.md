# Change management

**Status:** Binding  
**Owner:** Project lead  
**Reference when:** Changing public behavior, contracts, schema, configuration,
feature flags, or standards.  
**Agent obligation:** Classify compatibility, provide migration/rollback, and
update downstream consumers.

## Change classes

- **Patch:** defect correction without intended contract change.
- **Additive:** new optional behavior/field behind compatible defaults.
- **Breaking:** removes, renames, changes meaning/unit, or alters required flow.
- **Emergency containment:** temporary disable/rollback during incident.

## Public contracts

Public includes:

- persisted schema;
- chart format;
- pose-provider port;
- session/metric definitions;
- consent scope;
- notification command;
- localization message IDs;
- documented environment variables.

Breaking changes need migration, compatibility window where applicable,
release note, and owner approval.

## Feature flags

A flag has:

- owner and purpose;
- safe default;
- affected data semantics;
- expiry/removal date;
- test coverage for both states;
- rollback behavior.

Do not use flags to hide incomplete safety or consent work. Simulated mode is a
data source, not a silent flag.

## Schema/API evolution

Use expand -> migrate -> verify -> contract. Version algorithm-dependent trend
outputs. Do not reinterpret old stored values under a new algorithm version.

## Standard changes

Update the authoritative standard, docs changelog, affected templates/checks,
and current-state evidence. Old examples must not contradict the new rule.

## Deprecation

Name replacement, warning start, removal milestone, migration guide, and owner.
Indefinite deprecation is technical debt.
