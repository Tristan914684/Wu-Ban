# AI-Assisted Gameplay Trend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a prominent, truthful AI-assisted gameplay-history component that reports Stable, Declined, or Improving while preserving the existing local-first and supporter-safety contracts.

**Architecture:** Extend the pure `evaluatePersonalTrend` domain result with a presentation direction and symmetric improvement evidence while retaining the existing downward-only internal status used by supporter sharing. Render that direction through a focused React component inside the current personal pattern report; no browser, storage, MediaPipe, network, or LLM dependency enters the domain.

**Tech Stack:** TypeScript 6, React 19, Vitest, Testing Library, Vite CSS, existing MediaPipe-derived local session summaries

## Global Constraints

- The visible result is explicitly a gameplay-performance trend, not a health conclusion.
- Successfully loaded incomplete history defaults to `stable`; unavailable local storage remains unavailable.
- Captured/simulated and standing/seated histories remain separate.
- Invalid or interrupted sessions remain excluded from trend calculations.
- Only the existing downward internal status may authorise a supporter check-in.
- Copy may say `AI-assisted` because on-device MediaPipe AI supplies the measures, but it may not claim that an LLM or external trend API exists.
- No API key, backend, dependency, raw-frame persistence, migration, or network request is introduced.
- Preserve the user-owned unstaged change in `src/features/progress/ProgressScreen.tsx`.

---

### Task 1: Add the Three-State Domain Result

**Files:**
- Modify: `src/domain/trend/personal-trend.test.ts`
- Modify: `src/domain/trend/personal-trend.ts`

**Interfaces:**
- Consumes: `evaluatePersonalTrend(summaries, { mode, simulated }): TrendReport`
- Produces: `PerformanceTrend`, `TrendReport.performanceTrend`, `TrendReport.improvingFamilies`, `MetricBaseline.improvementThreshold`, `RecentTrendSession.improvingFamilies`, and repeated-improvement metric evidence
- Preserves: `TrendReport.status` and `TrendReport.sustainedFamilies` as the downward-only supporter gate

- [ ] **Step 1: Write failing domain tests for Stable, Declined, Improving, and mixed evidence**

Add assertions to the existing insufficient-history and sustained-shift cases, then add improving and mixed cases using a 50% first-five baseline:

```ts
expect(insufficientReport.performanceTrend).toBe("stable");
expect(declinedReport.performanceTrend).toBe("declined");

it("reports improving when two families repeatedly rise above the personal range", () => {
  const baseline = Array.from({ length: 5 }, (_, index) =>
    datedSession(index + 1, {
      measures: {
        beatAccuracy: 0.5,
        shapeAccuracy: 0.5,
        flowRecovery: 0.5,
        memoryControl: 0.5,
      },
    }),
  );
  const recent = [
    datedSession(6, { measures: { beatAccuracy: 0.75, memoryControl: 0.75 } }),
    datedSession(7, { measures: { beatAccuracy: 0.76, memoryControl: 0.77 } }),
    datedSession(8, { measures: { beatAccuracy: 0.55, memoryControl: 0.55 } }),
  ];

  const report = evaluatePersonalTrend([...baseline, ...recent], {
    mode: "standing",
    simulated: false,
  });

  expect(report.performanceTrend).toBe("improving");
  expect(report.improvingFamilies).toEqual(["beat", "memory"]);
  expect(report.status).toBe("usual-range");
});

it("reports stable when repeated improvements and declines are tied", () => {
  const baseline = Array.from({ length: 5 }, (_, index) =>
    datedSession(index + 1, {
      measures: {
        beatAccuracy: 0.5,
        shapeAccuracy: 0.5,
        flowRecovery: 0.5,
        memoryControl: 0.5,
      },
    }),
  );
  const recent = [6, 7, 8].map((index) =>
    datedSession(index, {
      measures: {
        beatAccuracy: index === 8 ? 0.55 : 0.75,
        memoryControl: index === 8 ? 0.55 : 0.75,
        shapeAccuracy: index === 8 ? 0.45 : 0.25,
        flowRecovery: index === 8 ? 0.45 : 0.25,
      },
    }),
  );

  const report = evaluatePersonalTrend([...baseline, ...recent], {
    mode: "standing",
    simulated: false,
  });

  expect(report.sustainedFamilies).toEqual(["shape", "flow"]);
  expect(report.improvingFamilies).toEqual(["beat", "memory"]);
  expect(report.performanceTrend).toBe("stable");
});
```

- [ ] **Step 2: Run the domain test and verify the new assertions fail for the missing contract**

Run: `npx vitest run src/domain/trend/personal-trend.test.ts`

Expected: FAIL because `performanceTrend`, `improvingFamilies`, and the symmetric upper threshold do not yet exist.

- [ ] **Step 3: Implement the minimal pure-domain classification**

Add these public types and fields:

```ts
export type PerformanceTrend = "stable" | "declined" | "improving";

export type MetricPatternStatus =
  | "collecting"
  | "within-usual-range"
  | "repeated-decline"
  | "repeated-improvement";

export interface MetricBaseline {
  readonly median: number;
  readonly medianAbsoluteDeviation: number;
  readonly unfavourableThreshold: number;
  readonly improvementThreshold: number;
}
```

Extend the report/session evidence:

```ts
export interface RecentTrendSession {
  readonly sessionId: string;
  readonly completedAt: string;
  readonly shiftedFamilies: readonly MetricFamily[];
  readonly improvingFamilies: readonly MetricFamily[];
}

export interface TrendReport {
  // existing fields remain
  readonly performanceTrend: PerformanceTrend;
  readonly improvingFamilies: readonly MetricFamily[];
}
```

Calculate the symmetric boundary from the same baseline spread:

```ts
const personalRange = Math.max(0.12, 2 * mad);
return {
  median: centre,
  medianAbsoluteDeviation: mad,
  unfavourableThreshold: centre - personalRange,
  improvementThreshold: centre + personalRange,
};
```

For every recent session, populate `improvingFamilies` when its value is above
`improvementThreshold`. Derive repeated improving families with the same two-
of-three rule, keep `status` based only on downward `sustainedFamilies`, and
derive the presentation result exactly as follows:

```ts
const performanceTrend: PerformanceTrend =
  recentSessions.length < 3
    ? "stable"
    : sustainedFamilies.length >= 2 &&
        sustainedFamilies.length > improvingFamilies.length
      ? "declined"
      : improvingFamilies.length >= 2 &&
          improvingFamilies.length > sustainedFamilies.length
        ? "improving"
        : "stable";
```

Set `performanceTrend: "stable"` and `improvingFamilies: []` in the empty
report.

- [ ] **Step 4: Run the focused domain test and verify it passes**

Run: `npx vitest run src/domain/trend/personal-trend.test.ts`

Expected: all personal trend rule tests PASS.

- [ ] **Step 5: Commit the domain increment**

```bash
git add src/domain/trend/personal-trend.ts src/domain/trend/personal-trend.test.ts
git commit -m "feat: classify gameplay trend direction"
```

---

### Task 2: Render the Prominent AI-Assisted Result

**Files:**
- Create: `src/features/progress/AiGameplayAnalysis.tsx`
- Modify: `src/features/progress/PersonalPatternReport.tsx`
- Modify: `src/features/progress/progress-sharing.test.tsx`
- Modify: `src/app/styles.css`

**Interfaces:**
- Consumes: `TrendReport.performanceTrend`, `TrendReport.validSessionCount`, `TrendReport.sustainedFamilies`, and `TrendReport.improvingFamilies`
- Produces: `AiGameplayAnalysis({ language, report })` and the visible Stable/Declined/Improving result
- Preserves: the existing `PersonalPatternReport` evidence, simulated label, method disclosure, interpretation, and local-data unavailable behavior

- [ ] **Step 1: Write failing component assertions for the AI label and all visible results**

Update the simulated downward-report test to expect:

```ts
expect(screen.getByText("AI-ASSISTED GAMEPLAY HISTORY")).toBeInTheDocument();
expect(
  screen.getByText("Using on-device AI to analyze your performance"),
).toBeInTheDocument();
expect(screen.getByText("Declined")).toBeInTheDocument();
expect(screen.getByText(/8 clear sessions analyzed locally/)).toBeInTheDocument();
```

Add an empty, successfully loaded report case that expects `Stable`, and add a
50%-baseline improving history case that expects `Improving`. Keep the existing
unavailable-storage test asserting that the analysis component is absent.

- [ ] **Step 2: Run the component test and verify it fails for the missing component**

Run: `npx vitest run src/features/progress/progress-sharing.test.tsx`

Expected: FAIL because the AI-assisted gameplay-history label and three-state
result are not rendered.

- [ ] **Step 3: Create the focused result component**

Implement this public contract:

```tsx
interface AiGameplayAnalysisProps {
  readonly language: Language;
  readonly report: TrendReport;
}

export function AiGameplayAnalysis({
  language,
  report,
}: AiGameplayAnalysisProps) {
  // Map stable/declined/improving to bilingual labels and evidence copy.
  // Render the process label, analysis sentence, textual result, and local
  // clear-session count. Use data-trend for styling and role="status" for the
  // result, without claiming an LLM or network analysis.
}
```

Required English copy:

```text
AI-ASSISTED GAMEPLAY HISTORY
Using on-device AI to analyze your performance
GAMEPLAY TREND
Stable | Declined | Improving
N clear sessions analyzed locally
```

Use `SIMULATED · AI-ASSISTED GAMEPLAY HISTORY` for the demo source. Describe a
decline as repeated movement below usual range, an improvement as repeated
movement above usual range, and Stable as no repeated overall change in the
available gameplay history.

- [ ] **Step 4: Compose the component and update the method disclosure**

Import and render `AiGameplayAnalysis` where `pattern-flag` currently appears.
Remove the superseded flag title/description calculations. Update the English
method copy to end with:

```text
No cloud LLM or API key is used; the history result is calculated locally by the prototype trend rule.
```

Add the equivalent Simplified Chinese sentence. Update per-family status copy
to distinguish repeated decline from repeated improvement.

- [ ] **Step 5: Style the component in the existing visual system**

Add `.ai-gameplay-analysis` styles near `.personal-pattern-report`, using the
existing ink, jade, gold, caution, paper, border, shadow, and serif tokens.
Give the result a large text label, a short nonessential scan-line animation,
and direction-specific border/background treatment through
`data-trend="stable|declined|improving"`. Include `.ai-gameplay-analysis` in
the existing forced-colours border rule. The repository-wide reduced-motion
rules must collapse the animation automatically.

- [ ] **Step 6: Run the component and domain tests and verify they pass**

Run:

```bash
npx vitest run src/features/progress/progress-sharing.test.tsx src/domain/trend/personal-trend.test.ts
```

Expected: both test files PASS with the new visible result and existing safety
copy intact.

- [ ] **Step 7: Commit the UI increment**

```bash
git add src/features/progress/AiGameplayAnalysis.tsx src/features/progress/PersonalPatternReport.tsx src/features/progress/progress-sharing.test.tsx src/app/styles.css
git commit -m "feat: show AI-assisted gameplay trend"
```

---

### Task 3: Preserve the Supporter Check-In Boundary

**Files:**
- Modify: `src/domain/sharing/supporter-grant.test.ts`

**Interfaces:**
- Consumes: an improving `TrendReport` whose legacy `status` remains `usual-range`
- Verifies: `authoriseCheckIn` returns `{ kind: "blocked", reason: "no-sustained-shift" }`
- Preserves: consent, simulated preview-only behavior, duplicate suppression, and downward-only check-in authorisation

- [ ] **Step 1: Write the focused improving-history sharing test**

Create a valid active grant, derive an improving report from eight fixed
sessions, assert `performanceTrend === "improving"`, and assert:

```ts
expect(authoriseCheckIn(report, grant, "Preview")).toEqual({
  kind: "blocked",
  reason: "no-sustained-shift",
});
```

- [ ] **Step 2: Run the sharing test and confirm the preserved gate**

Run: `npx vitest run src/domain/sharing/supporter-grant.test.ts`

Expected: PASS without production changes because `authoriseCheckIn` still
uses the legacy downward-only status.

- [ ] **Step 3: Commit the regression evidence**

```bash
git add src/domain/sharing/supporter-grant.test.ts
git commit -m "test: preserve downward-only check-in gate"
```

---

### Task 4: Record the Product Choice and Verify the Vertical Slice

**Files:**
- Modify: `docs/product/decision-log.md`
- Modify: `docs/product/trend-and-supporter-spec.md`
- Modify: `docs/context/current-project-state.md`
- Modify: `docs/engineering/m3-longitudinal-supporter-evidence.md`
- Modify: `docs/README.md`

**Interfaces:**
- Consumes: the verified three-state domain result and visible component
- Produces: current product and evidence records that distinguish genuine on-device AI from the local prototype trend rule

- [ ] **Step 1: Record the accepted product clarification**

Add a decision-log row stating that the hackathon progress surface exposes
`Stable`, `Declined`, or `Improving`; successfully loaded incomplete history
defaults to Stable; and AI-assisted wording refers to the on-device landmark
model plus local derived-history pipeline, not an LLM.

Add a trend-spec requirement that the presentation direction is symmetric
while the supporter gate remains downward-only.

- [ ] **Step 2: Run the complete local verification suite**

Run: `npm run verify`

Expected: documentation validation, lint, typecheck, unit tests, integration
tests, production build, and bundle budget all PASS.

- [ ] **Step 3: Update verified-state and evidence documents**

After Step 2 passes, update `current-project-state.md` and
`m3-longitudinal-supporter-evidence.md` with the exact current test counts and
commands. State that no LLM, external API, real-camera, or device validation was
introduced or claimed.

Index this implementation plan in `docs/README.md`.

- [ ] **Step 4: Re-run documentation and diff checks**

Run:

```bash
npm run docs:validate
git diff --check
git status --short
```

Expected: documentation validation passes, no whitespace errors are reported,
and the only unrelated unstaged file remains the user-owned
`src/features/progress/ProgressScreen.tsx` change.

- [ ] **Step 5: Commit the verified documentation**

```bash
git add docs/README.md docs/product/decision-log.md docs/product/trend-and-supporter-spec.md docs/context/current-project-state.md docs/engineering/m3-longitudinal-supporter-evidence.md docs/superpowers/plans/2026-08-14-ai-assisted-gameplay-trend.md
git commit -m "docs: record three-state gameplay trend"
```

- [ ] **Step 6: Perform final self-review**

Read `docs/ai/pr-review-checklist.md`, inspect `git diff HEAD~4..HEAD`, and
confirm there is no hidden simulation, false LLM claim, raw-frame storage,
network call, dependency change, weakened sharing gate, or accidental staging
of the user-owned `ProgressScreen.tsx` change.
