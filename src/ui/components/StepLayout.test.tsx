/** @vitest-environment jsdom */

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { StepLayout } from "./StepLayout";

afterEach(cleanup);

describe("StepLayout composition", () => {
  it("uses the wide content grid when there is no aside", () => {
    render(
      <StepLayout eyebrow="§ 01" title="Primary task">
        <button type="button">Continue</button>
      </StepLayout>,
    );

    expect(screen.getByRole("main")).toHaveAttribute(
      "data-has-aside",
      "false",
    );
  });

  it("reserves a visual region when an aside is present", () => {
    render(
      <StepLayout
        aside={<div>Proof surface</div>}
        eyebrow="§ 05"
        title="Camera setup"
      >
        <button type="button">Continue</button>
      </StepLayout>,
    );

    expect(screen.getByRole("main")).toHaveAttribute(
      "data-has-aside",
      "true",
    );
    expect(
      screen.getByRole("complementary"),
    ).toHaveTextContent("Proof surface");
  });
});
