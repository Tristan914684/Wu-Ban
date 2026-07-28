# Dependency policy

**Status:** Binding  
**Owner:** Engineering lead  
**Reference when:** Adding, replacing, upgrading, or removing a package or SDK.  
**Agent obligation:** Use `governance/dependency-approval.md`; never install
first and justify later.

## Acceptance test

A dependency must:

- solve a current accepted requirement;
- be materially better than platform/existing code;
- support the target browser/device;
- have compatible licence and distribution terms;
- have maintained releases and a credible security posture;
- be tree-shakeable or justify its shipped cost;
- expose a testable boundary;
- have an exit strategy.

## Categories

- **Core runtime:** highest review; affects bundle, reliability, and long-term
  architecture.
- **Build/test:** review maintenance, install scripts, and lockfile impact.
- **SDK/provider:** isolate behind an adapter and verify licence, browser support,
  data behavior, and failure modes.
- **Development convenience:** reject if it duplicates a small, stable script or
  formatter capability.

## Versioning

- Commit one lockfile.
- Pin the package-manager version.
- Prefer exact versions for high-risk SDKs where semver compatibility is weak.
- Upgrade in focused changes with release notes and full relevant checks.
- Do not mix dependency upgrades with feature logic.

## Supply chain

- Review transitive size and install scripts.
- Use automated vulnerability scanning after scaffold.
- A vulnerability suppression needs owner, reasoning, compensating control, and
  expiry.
- No package may load remote code at runtime without a security decision.

Provider choice is an ADR when it shapes domain contracts or the critical path.
