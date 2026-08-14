/** @vitest-environment jsdom */

import "@testing-library/jest-dom/vitest";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { evaluatePersonalTrend } from "../../domain/trend/personal-trend";
import { createSimulatedTrendHistory } from "../../domain/trend/simulated-history";
import { buildSessionSummary } from "../../test-support/session-summary-builder";
import { SharingScreen } from "../sharing/SharingScreen";
import { ProgressScreen } from "./ProgressScreen";

afterEach(cleanup);

function simulatedReport() {
  return evaluatePersonalTrend(createSimulatedTrendHistory("standing"), {
    mode: "standing",
    simulated: true,
  });
}

function improvingReport() {
  const baseline = Array.from({ length: 5 }, (_, index) =>
    buildSessionSummary({
      id: `baseline-${index}`,
      completedAt: new Date(Date.UTC(2026, 6, index + 1)).toISOString(),
      measures: {
        beatAccuracy: 0.5,
        shapeAccuracy: 0.5,
        flowRecovery: 0.5,
        memoryControl: 0.5,
      },
    }),
  );
  const recent = [
    buildSessionSummary({
      id: "recent-1",
      completedAt: new Date(Date.UTC(2026, 6, 6)).toISOString(),
      measures: {
        beatAccuracy: 0.75,
        shapeAccuracy: 0.5,
        flowRecovery: 0.5,
        memoryControl: 0.75,
      },
    }),
    buildSessionSummary({
      id: "recent-2",
      completedAt: new Date(Date.UTC(2026, 6, 7)).toISOString(),
      measures: {
        beatAccuracy: 0.76,
        shapeAccuracy: 0.5,
        flowRecovery: 0.5,
        memoryControl: 0.77,
      },
    }),
    buildSessionSummary({
      id: "recent-3",
      completedAt: new Date(Date.UTC(2026, 6, 8)).toISOString(),
      measures: {
        beatAccuracy: 0.55,
        shapeAccuracy: 0.5,
        flowRecovery: 0.5,
        memoryControl: 0.55,
      },
    }),
  ];

  return evaluatePersonalTrend([...baseline, ...recent], {
    mode: "standing",
    simulated: false,
  });
}

describe("progress and sharing UI", () => {
  it("labels simulated history at the trend consumer (BR-008)", () => {
    render(
      <ProgressScreen
        excludedSimulatedCount={0}
        language="zh"
        localDataStatus="ready"
        onBack={vi.fn()}
        onRetryLocalData={vi.fn()}
        onModeChange={vi.fn()}
        onOpenSharing={vi.fn()}
        onToggleSimulation={vi.fn()}
        report={simulatedReport()}
        weeklyParticipation={2}
      />,
    );

    expect(screen.getByText("模拟数据")).toBeInTheDocument();
    expect(
      screen.getByText(/不是你的表现，也没有加入本机历史/),
    ).toBeInTheDocument();
    expect(screen.getByText(/不会识别疾病/)).toBeInTheDocument();
  });

  it("turns the sustained prototype signal into a transparent longitudinal report (BR-012, BR-013)", () => {
    render(
      <ProgressScreen
        excludedSimulatedCount={0}
        language="en"
        localDataStatus="ready"
        onBack={vi.fn()}
        onRetryLocalData={vi.fn()}
        onModeChange={vi.fn()}
        onOpenSharing={vi.fn()}
        onToggleSimulation={vi.fn()}
        report={simulatedReport()}
        weeklyParticipation={2}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Simulated pattern report" }),
    ).toBeInTheDocument();
    expect(screen.getByText("AI-ASSISTED GAMEPLAY HISTORY")).toBeInTheDocument();
    expect(
      screen.getByText("Using on-device AI to analyze your performance"),
    ).toBeInTheDocument();
    expect(screen.getByText("Declined")).toBeInTheDocument();
    expect(screen.getByText(/8 clear sessions analyzed locally/)).toBeInTheDocument();
    expect(
      screen.getByText(/Beat and Memory repeatedly moved below/),
    ).toBeInTheDocument();
    expect(screen.getByText("21 points below usual")).toBeInTheDocument();
    expect(
      screen.getByText(/An area is flagged only when it crosses its personal threshold/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/does not identify a condition or explain its cause/),
    ).toBeInTheDocument();
    expect(screen.getByText(/No cloud LLM or API key is used/)).toBeInTheDocument();
  });

  it("defaults available incomplete history to a stable gameplay result", () => {
    render(
      <ProgressScreen
        excludedSimulatedCount={0}
        language="en"
        localDataStatus="ready"
        onBack={vi.fn()}
        onRetryLocalData={vi.fn()}
        onModeChange={vi.fn()}
        onOpenSharing={vi.fn()}
        onToggleSimulation={vi.fn()}
        report={evaluatePersonalTrend([], {
          mode: "standing",
          simulated: false,
        })}
        weeklyParticipation={0}
      />,
    );

    expect(screen.getByText("Stable")).toBeInTheDocument();
    expect(screen.getByText(/0 clear sessions analyzed locally/)).toBeInTheDocument();
    expect(screen.queryByText(/Collecting data/i)).not.toBeInTheDocument();
  });

  it("shows improving when repeated gameplay measures rise above usual", () => {
    render(
      <ProgressScreen
        excludedSimulatedCount={0}
        language="en"
        localDataStatus="ready"
        onBack={vi.fn()}
        onRetryLocalData={vi.fn()}
        onModeChange={vi.fn()}
        onOpenSharing={vi.fn()}
        onToggleSimulation={vi.fn()}
        report={improvingReport()}
        weeklyParticipation={2}
      />,
    );

    expect(screen.getByText("Improving")).toBeInTheDocument();
    expect(
      screen.getByText(/Beat and Memory repeatedly moved above/),
    ).toBeInTheDocument();
  });

  it("keeps sharing off until a separate confirmation (BR-009)", () => {
    const onGrant = vi.fn().mockResolvedValue(undefined);
    const onSend = vi.fn().mockResolvedValue({
      kind: "blocked",
      reason: "sharing-inactive",
    });

    render(
      <SharingScreen
        grant={null}
        language="zh"
        localDataStatus="ready"
        onBack={vi.fn()}
        onDeleteHistory={vi.fn().mockResolvedValue(undefined)}
        onGrant={onGrant}
        onRetryLocalData={vi.fn()}
        onRevoke={vi.fn().mockResolvedValue(undefined)}
        onSend={onSend}
        report={simulatedReport()}
        storedSummaries={[]}
      />,
    );

    expect(screen.getByText("默认关闭")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "在微信测试通道发送" }),
    ).toBeDisabled();
    expect(onGrant).not.toHaveBeenCalled();
    expect(
      screen.getByText("查看本机保存的字段与记录（0）"),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "选择一位信任的人" }),
    );
    expect(screen.getByText("这是独立的分享许可。")).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "我允许这个用途" }),
    );

    expect(onGrant).toHaveBeenCalledOnce();
    expect(onSend).not.toHaveBeenCalled();
  });

  it("does not treat unavailable personal history as an empty baseline", () => {
    const onRetryLocalData = vi.fn();

    render(
      <ProgressScreen
        excludedSimulatedCount={0}
        language="zh"
        localDataStatus="unavailable"
        onBack={vi.fn()}
        onModeChange={vi.fn()}
        onOpenSharing={vi.fn()}
        onRetryLocalData={onRetryLocalData}
        onToggleSimulation={vi.fn()}
        report={evaluatePersonalTrend([], {
          mode: "standing",
          simulated: false,
        })}
        weeklyParticipation={0}
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: "本机节奏暂时无法显示。",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "本机数据暂时无法读取",
    );
    expect(screen.queryByText(/还需要 5 次/)).not.toBeInTheDocument();
    expect(
      screen.queryByText("AI-ASSISTED GAMEPLAY HISTORY"),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "重试本机数据" }));
    expect(onRetryLocalData).toHaveBeenCalledOnce();
  });

  it("fails sharing closed while its local consent state is unavailable", () => {
    render(
      <SharingScreen
        grant={null}
        language="zh"
        localDataStatus="unavailable"
        onBack={vi.fn()}
        onDeleteHistory={vi.fn().mockResolvedValue(undefined)}
        onGrant={vi.fn().mockResolvedValue(undefined)}
        onRetryLocalData={vi.fn()}
        onRevoke={vi.fn().mockResolvedValue(undefined)}
        onSend={vi.fn().mockResolvedValue({
          kind: "blocked",
          reason: "sharing-inactive",
        })}
        report={simulatedReport()}
        storedSummaries={[]}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "本机数据暂时无法读取",
    );
    expect(screen.queryByText("默认关闭")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "选择一位信任的人" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "在微信测试通道发送" }),
    ).not.toBeInTheDocument();
  });
});
