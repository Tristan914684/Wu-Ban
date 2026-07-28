# Product decision log

**Status:** Binding clarifications after the PRD  
**Owner:** Product lead  
**Reference when:** Interpreting scope or resolving older PRD alternatives.  
**Agent obligation:** Apply the newest accepted decision; add entries rather
than silently rewriting history.

| ID | Date | Decision | Consequence |
|---|---|---|---|
| PD-001 | 2026-07-26 | Player-facing name is 舞伴 (Wǔbàn); DanceBros remains internal. | UI, deck, and copy lead with 舞伴. |
| PD-002 | 2026-07-26 | Initial audience is adults aged 60-75, without an activity-level prerequisite. | Do not describe all target users as active seniors. |
| PD-003 | 2026-07-26 | Demo is laptop-first; TV mirroring is future-compatible. | Optimise and test the laptop viewport first. |
| PD-004 | 2026-07-26 | Standing is the primary selling path; an MVP seated hand/finger gesture route is also required. | Share the game engine, but give seated calibration and scoring explicit acceptance. |
| PD-005 | 2026-07-26 | Use an old Chinese tune with defensible reuse rights. Preferred direction: `茉莉花`. | Create or acquire a reusable recording; never assume a recording inherits the folk melody's status. |
| PD-006 | 2026-07-26 | CodeBuddy and Miora access is available. | Their real contribution and provenance must be captured. |
| PD-007 | 2026-07-26 | Tencent runtime technology may be used when it helps, but the pose provider follows the feasibility result. | Keep the provider replaceable; do not block the browser demo on brand preference. |
| PD-008 | 2026-07-26 | Include a real caregiver check-in path and a WeChat owner-testing guide. | It remains consented, non-diagnostic, sandbox/test-scoped, and revocable. |
| PD-009 | 2026-07-26 | Older-adult and supporter formative testing is available. | Schedule usability evidence before the final demo freeze. |
| PD-010 | 2026-07-26 | Drop "detect months earlier" and public "cognitive profile" claims to improve credibility. | Use movement-and-attention trend and earlier conversation language. |
| PD-011 | 2026-07-26 | One primary player contributes to personal trends; companions may dance socially. | True multi-person profiling remains out of scope. |
| PD-012 | 2026-07-28 | Language and motion preferences belong in a compact Display and comfort disclosure rather than the primary header navigation. | Persist the language choice, expose an explicit Chinese/English selection, and use a true switch for reduced dynamics. |
| PD-013 | 2026-07-28 | The UI should feel adult and hand-painted rather than digitally pristine or template-generated. | Keep the warm editorial hierarchy while using paper fibre, rough ink edges, painted dusk forms, and restrained imperfect geometry. |

## Adding a decision

Record the context, considered options, chosen option, owner, and affected
documents. Architecture choices belong in ADRs instead. A decision is accepted
only when the product owner approves it or explicitly edits the source PRD.
