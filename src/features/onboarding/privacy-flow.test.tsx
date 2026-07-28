/** @vitest-environment jsdom */

import "@testing-library/jest-dom/vitest";

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DisclosureScreen } from "./DisclosureScreen";
import { PermissionScreen } from "./PermissionScreen";

afterEach(cleanup);

describe("camera privacy flow", () => {
  it("requires an explicit disclosure acknowledgement", () => {
    const onAccept = vi.fn();

    render(<DisclosureScreen language="zh" onAccept={onAccept} />);

    expect(onAccept).not.toHaveBeenCalled();
    expect(
      screen.getByText("不保存视频、照片、人脸或声音。"),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "我明白了，继续" }),
    );
    expect(onAccept).toHaveBeenCalledOnce();
  });

  it("does not request camera access until the user presses the camera button", async () => {
    const onRequestCamera = vi.fn().mockResolvedValue(null);
    const onUseSynthetic = vi.fn();

    render(
      <PermissionScreen
        language="zh"
        onRequestCamera={onRequestCamera}
        onUseSynthetic={onUseSynthetic}
        permissionError={null}
      />,
    );

    expect(onRequestCamera).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "打开摄像头" }));

    await waitFor(() => {
      expect(onRequestCamera).toHaveBeenCalledOnce();
    });
  });

  it("offers a camera-free simulation path", () => {
    const onRequestCamera = vi.fn().mockResolvedValue(null);
    const onUseSynthetic = vi.fn();

    render(
      <PermissionScreen
        language="zh"
        onRequestCamera={onRequestCamera}
        onUseSynthetic={onUseSynthetic}
        permissionError={null}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "先看模拟演示" }));

    expect(onUseSynthetic).toHaveBeenCalledOnce();
    expect(onRequestCamera).not.toHaveBeenCalled();
  });
});
