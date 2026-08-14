# Calibration Status Rail Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep calibration and on-device model status visible directly below, never over, the calibration camera viewport.

**Architecture:** Keep `CalibrationScreen` as the owner of calibration presentation. Add one clipped 4:3 viewport for camera-aligned content and one normal-flow status rail for the existing calibration and model-status components; scope positioning overrides to calibration so rehearsal and gameplay remain unchanged.

**Tech Stack:** React 19, TypeScript 6, vanilla CSS, Vitest, Testing Library

## Global Constraints

- Preserve the existing 4:3 camera size, bilingual copy, live-region semantics, and paper-and-ink visual direction.
- Keep the framing target, landmark drawing, detected-parts copy, and positioning guidance aligned inside the camera viewport.
- Do not change pose inference, confidence thresholds, calibration timing, camera lifecycle, persistence, dependencies, or privacy behavior.
- Use two status columns when space allows and one column when the calibration container is narrower than 460px.

---

### Task 1: Move calibration status into a responsive rail

**Files:**
- Modify: `src/features/calibration/CalibrationScreen.test.tsx`
- Modify: `src/features/calibration/CalibrationScreen.tsx`
- Modify: `src/app/styles.css`
- Modify: `docs/context/current-project-state.md`

**Interfaces:**
- Consumes: existing `CalibrationState` presentation and `PerceptionStatus` props.
- Produces: `[data-calibration-camera-viewport]` containing only camera-aligned content and `[data-calibration-status-rail]` containing both status panels.

- [x] **Step 1: Write the failing layout regression test**

Add a component test that renders camera calibration with the existing camera and detector test doubles, waits for `Stable tracking 0%`, and asserts:

```tsx
const viewport = container.querySelector(
  "[data-calibration-camera-viewport]",
);
const statusRail = container.querySelector(
  "[data-calibration-status-rail]",
);

expect(viewport).toContainElement(screen.getByLabelText("Camera preview"));
expect(viewport).not.toContainElement(screen.getByText("Stable tracking 0%"));
expect(viewport).not.toContainElement(screen.getByText("ON-DEVICE POSE AI"));
expect(statusRail).toContainElement(screen.getByText("Stable tracking 0%"));
expect(statusRail).toContainElement(screen.getByText("ON-DEVICE POSE AI"));
```

- [x] **Step 2: Run the focused test and verify RED**

Run:

```bash
npx vitest run src/features/calibration/CalibrationScreen.test.tsx
```

Expected: FAIL because the dedicated viewport and status rail do not exist and both statuses still live in the camera stage.

- [x] **Step 3: Implement the minimal component structure**

Inside `CalibrationScreen`, add:

```tsx
<div
  className="camera-stage__viewport"
  data-calibration-camera-viewport
>
  {/* video or synthetic figure, landmark/framing overlays, parts, guidance */}
</div>
<div
  className="camera-stage__status-rail"
  data-calibration-status-rail
>
  {/* existing calibration status and camera-only PerceptionStatus */}
</div>
```

Move no state, copy, or detector logic. Keep `PerceptionStatus` conditional on `source === "camera"`.

- [x] **Step 4: Implement the scoped layout styles**

Make `.camera-stage` a grid container without clipping. Move its 4:3 aspect ratio, border, background, shadow, and clipping to `.camera-stage__viewport`. Add a two-column `.camera-stage__status-rail`; reset `.camera-stage__status` and `.camera-stage__status-rail .perception-status` to normal flow. Use a 460px container query to stack the rail.

- [x] **Step 5: Run the focused test and verify GREEN**

Run:

```bash
npx vitest run src/features/calibration/CalibrationScreen.test.tsx src/ui/components/TrackingLandmarkOverlay.test.tsx
```

Expected: all focused component tests PASS.

- [x] **Step 6: Record the verified current state**

After the focused test passes, update the calibration evidence paragraph in `docs/context/current-project-state.md` to state that calibration completion and on-device model status render in a responsive rail below the preview while framing geometry remains inside it.

- [x] **Step 7: Run focused repository gates and inspect the result**

Run:

```bash
npm run docs:validate
npm run lint
npm run typecheck
npm run build
git diff --check
```

Inspect the calibration screen at the reported laptop viewport and one narrower viewport. Confirm both panels remain outside the camera bounds, text wraps, and the page has no horizontal overflow.

- [x] **Step 8: Self-review and commit**

Review only the task diff, confirm rehearsal/gameplay positioning rules are unchanged, and commit the plan, implementation, regression test, CSS, and verified current-state update.
