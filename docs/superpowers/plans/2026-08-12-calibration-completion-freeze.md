# Calibration Completion Freeze Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make standing and seated calibration show 100% only after the accepted position has been frozen and detector sampling has stopped.

**Architecture:** Keep three-second stability in the existing pure domain function and keep ephemeral calibration lifecycle state in `CalibrationScreen`. Correct the UI boundary so incomplete progress is capped at 99%, then make the existing ready transition explicitly report completed 100% while preserving its no-further-animation-frame behavior.

**Tech Stack:** React 19, TypeScript, Vitest 4, Testing Library, MediaPipe adapter interfaces

## Global Constraints

- While calibration is active, displayed progress remains between 0% and 99%.
- Reaching the full three-second stability requirement immediately freezes the accepted result and stops requesting further detector frames.
- The ready state explicitly reports that calibration is complete at 100%.
- Standing and seated must share the same truthful completion contract.
- Do not change the three-second duration, tracking thresholds, classifiers, camera privacy boundary, synthetic fallback, dependencies, or session state-machine transitions.
- Raw camera frames and landmark traces remain transient and are neither stored nor transmitted.
- Preserve the user-owned `.gitignore` and presentation-file changes.

---

### Task 1: Lock calibration completion at true 100%

**Files:**
- Modify: `src/features/calibration/CalibrationScreen.test.tsx`
- Modify: `src/features/calibration/CalibrationScreen.tsx`

**Interfaces:**
- Consumes: `updateTrackingStability(previous, timestampMs, scoreable): TrackingStability`, `poseFrame(...)`, `handFrame(...)`, and `handLandmarks(...)`.
- Produces: `incompleteCalibrationPercent(progress: number): number` inside the calibration UI and the visible ready labels `Calibration complete — 100%` / `校准完成 — 100%`.

- [ ] **Step 1: Add deterministic calibration-frame test support**

Update the test imports and add a queued animation-frame harness:

```tsx
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import {
  handFrame,
  handLandmarks,
  poseFrame,
} from "../../test-support/landmark-builders";

function installAnimationFrameQueue() {
  const callbacks: FrameRequestCallback[] = [];
  vi.stubGlobal(
    "requestAnimationFrame",
    vi.fn((callback: FrameRequestCallback) => {
      callbacks.push(callback);
      return callbacks.length;
    }),
  );
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
  return callbacks;
}

async function runNextFrame(
  callbacks: FrameRequestCallback[],
  timestampMs: number,
) {
  const callback = callbacks.shift();
  if (callback === undefined) {
    throw new Error("Expected a queued calibration frame.");
  }
  await act(async () => {
    callback(timestampMs);
  });
}
```

Extend `afterEach` with `vi.unstubAllGlobals()` and make the video ready in each camera test:

```tsx
vi.spyOn(HTMLMediaElement.prototype, "readyState", "get").mockReturnValue(
  HTMLMediaElement.HAVE_CURRENT_DATA,
);
```

- [ ] **Step 2: Write failing standing and seated regression tests**

Add a standing test that returns three valid pose frames and advances the controlled timestamps across the completion boundary:

```tsx
it("shows 100% only after freezing standing calibration", async () => {
  const callbacks = installAnimationFrameQueue();
  const camera = new BrowserCamera();
  const detector = new MediaPipeLandmarkDetector();
  const onComplete = vi.fn();
  vi.spyOn(HTMLMediaElement.prototype, "readyState", "get").mockReturnValue(
    HTMLMediaElement.HAVE_CURRENT_DATA,
  );
  vi.spyOn(camera, "attachPreview").mockResolvedValue();
  vi.spyOn(detector, "load").mockResolvedValue();
  const detect = vi
    .spyOn(detector, "detect")
    .mockReturnValueOnce(poseFrame({ hipCenterX: 0.4 }))
    .mockReturnValueOnce(poseFrame({ hipCenterX: 0.5 }))
    .mockReturnValueOnce(poseFrame({ hipCenterX: 0.6 }));

  render(
    <CalibrationScreen
      camera={camera}
      detector={detector}
      language="en"
      mode="standing"
      onComplete={onComplete}
      onUseSyntheticFallback={vi.fn()}
      source="camera"
    />,
  );

  await screen.findByText("Stable tracking 0%");
  await runNextFrame(callbacks, 100);
  await runNextFrame(callbacks, 3_099);

expect(screen.getByText("Stable tracking 99%")).toBeInTheDocument();
expect(screen.queryByText("Calibration complete — 100%")).not.toBeInTheDocument();

await runNextFrame(callbacks, 3_179);

expect(
  screen.getByText("Calibration complete — 100%"),
).toBeInTheDocument();
expect(callbacks).toHaveLength(0);
expect(detect).toHaveBeenCalledTimes(3);

fireEvent.click(screen.getByRole("button", { name: "Position looks good" }));
expect(onComplete).toHaveBeenCalledOnce();
expect(onComplete).toHaveBeenCalledWith(
  expect.objectContaining({ hipCenterX: 0.5 }),
);
});
```

The pose hip centres `0.4`, `0.5`, and `0.6` make the asserted `0.5` prove the frozen standing average. Add the equivalent seated lifecycle test with valid two-open-palm frames:

```tsx
it("freezes seated calibration when true progress reaches 100%", async () => {
  const callbacks = installAnimationFrameQueue();
  const camera = new BrowserCamera();
  const detector = new MediaPipeLandmarkDetector();
  const onComplete = vi.fn();
  const frame = handFrame([
    handLandmarks("left", "open"),
    handLandmarks("right", "open"),
  ]);
  vi.spyOn(HTMLMediaElement.prototype, "readyState", "get").mockReturnValue(
    HTMLMediaElement.HAVE_CURRENT_DATA,
  );
  vi.spyOn(camera, "attachPreview").mockResolvedValue();
  vi.spyOn(detector, "load").mockResolvedValue();
  const detect = vi.spyOn(detector, "detect").mockReturnValue(frame);

  render(
    <CalibrationScreen
      camera={camera}
      detector={detector}
      language="en"
      mode="seated"
      onComplete={onComplete}
      onUseSyntheticFallback={vi.fn()}
      source="camera"
    />,
  );

  await screen.findByText("Stable tracking 0%");
  await runNextFrame(callbacks, 100);
  await runNextFrame(callbacks, 3_099);

  expect(screen.getByText("Stable tracking 99%")).toBeInTheDocument();

  await runNextFrame(callbacks, 3_179);

  expect(
    screen.getByText("Calibration complete — 100%"),
  ).toBeInTheDocument();
  expect(callbacks).toHaveLength(0);
  expect(detect).toHaveBeenCalledTimes(3);

  fireEvent.click(screen.getByRole("button", { name: "Position looks good" }));
  expect(onComplete).toHaveBeenCalledWith(null);
});
```

- [ ] **Step 3: Run the focused component test and verify RED**

Run:

```bash
npx vitest run src/features/calibration/CalibrationScreen.test.tsx
```

Expected: FAIL because incomplete progress is rendered as `Stable tracking 100%` and the ready state still says `Position ready`.

- [ ] **Step 4: Implement the minimal truthful-progress and completion copy**

Add the UI-only formatter near `CalibrationState`:

```tsx
function incompleteCalibrationPercent(progress: number): number {
  return Math.min(99, Math.floor(progress * 100));
}
```

Use it for both active progress labels:

```tsx
? `稳定追踪 ${incompleteCalibrationPercent(state.progress)}%`
: `Stable tracking ${incompleteCalibrationPercent(state.progress)}%`
```

Replace the ready status copy with:

```tsx
? "校准完成 — 100%"
: "Calibration complete — 100%"
```

Do not add another detector flag or timer: the existing `return` after setting the ready state is the freeze boundary and must remain the only completion exit.

- [ ] **Step 5: Run focused tests and verify GREEN**

Run:

```bash
npx vitest run src/features/calibration/CalibrationScreen.test.tsx src/domain/quality/tracking-stability.test.ts
```

Expected: all calibration and tracking-stability tests PASS with no errors or warnings.

### Task 2: Record verified state and run applicable gates

**Files:**
- Modify: `docs/context/current-project-state.md`

**Interfaces:**
- Consumes: passing Task 1 tests and the accepted design at `docs/superpowers/specs/2026-08-12-calibration-completion-freeze-design.md`.
- Produces: a verified current-state statement that distinguishes automated evidence from the open real-camera device pass.

- [ ] **Step 1: Update the calibration evidence paragraph after focused tests pass**

Extend the current calibration-status paragraph with this verified behavior:

```markdown
Active calibration progress is capped at 99%; true 100% now freezes the accepted standing average or seated completion state and stops the detector frame loop before the player releases position. Component tests cover both modes and the near-threshold boundary; representative real-camera validation remains open.
```

- [ ] **Step 2: Run the applicable repository verification gates**

Run:

```bash
npm run docs:validate
npm run lint
npm run typecheck
npm run test:integration
npm run build
npm run build:budget
git diff --check
```

Retain the fresh focused result from Task 1. Record any unrelated pre-existing failure separately and do not weaken its test.

- [ ] **Step 3: Self-review the final diff**

Inspect:

```bash
git diff -- src/features/calibration/CalibrationScreen.tsx src/features/calibration/CalibrationScreen.test.tsx docs/context/current-project-state.md
git status --short
```

Confirm that incomplete progress cannot display 100%, completion schedules no further frame, both language labels are direct, no raw media or landmark data is logged or stored, and only task files plus pre-existing user changes are present.

- [ ] **Step 4: Commit the implementation**

Stage only the calibration implementation, regression tests, current-state update, and this implementation plan if it has not already been committed:

```bash
git add src/features/calibration/CalibrationScreen.tsx \
  src/features/calibration/CalibrationScreen.test.tsx \
  docs/context/current-project-state.md \
  docs/superpowers/plans/2026-08-12-calibration-completion-freeze.md \
  docs/README.md
git commit -m "fix: freeze completed calibration position"
```

Do not stage `.gitignore`, `output/舞伴-Age-Well-Hackathon-Pitch.pptx`, or generated test-cache files.
