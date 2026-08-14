import { expect, test } from "@playwright/test";

test("simulated trend stays separate through grant and revoke", async ({
  page,
}) => {
  await page.goto("/?fast=1");
  await page
    .getByRole("button", { name: "查看我的节奏", exact: true })
    .click();

  await expect(
    page.getByRole("heading", {
      name: "你的游戏趋势稳定。",
      exact: true,
    }),
  ).toBeVisible();
  const gameplayAnalysis = page.locator(".ai-gameplay-analysis");
  await expect(
    gameplayAnalysis.getByText("AI 辅助游戏历史", { exact: true }),
  ).toBeVisible();
  await expect(
    gameplayAnalysis.getByText("稳定", { exact: true }),
  ).toBeVisible();

  await page
    .getByRole("button", { name: "查看模拟趋势演示", exact: true })
    .click();
  await expect(page.getByText("模拟数据", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "你的游戏趋势有所下降。",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "模拟个人模式报告",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    gameplayAnalysis.getByText("下降", { exact: true }),
  ).toBeVisible();
  await expect(
    gameplayAnalysis.getByText(
      "节拍和顺序与停住在最近的清晰游戏中重复低于平常范围。",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(page.getByText("建议下一步：", { exact: true })).toBeVisible();

  await page
    .getByRole("button", { name: "隐私与分享", exact: true })
    .click();
  await expect(page.getByText("默认关闭", { exact: true })).toBeVisible();
  await page
    .getByText("查看本机保存的字段与记录（0）", { exact: true })
    .click();
  await expect(
    page.getByText("本机还没有游戏记录。", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "在微信测试通道发送",
      exact: true,
    }),
  ).toBeDisabled();

  await page
    .getByRole("button", { name: "选择一位信任的人", exact: true })
    .click();
  await expect(
    page.getByText("这是独立的分享许可。", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "我允许这个用途", exact: true })
    .click();
  await expect(page.getByText("已允许预览", { exact: true })).toBeVisible();

  await page
    .getByRole("button", { name: "撤销未来分享", exact: true })
    .click();
  await expect(page.getByText("默认关闭", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "在微信测试通道发送",
      exact: true,
    }),
  ).toBeDisabled();
});

test("compact screens allow reading but block movement gameplay", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?fast=1");

  await expect(
    page.getByRole("button", { name: "开始一局", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "开始一局", exact: true }).click();
  await page
    .getByRole("button", { name: "我明白了，继续", exact: true })
    .click();
  await page
    .getByRole("button", { name: "先看模拟演示", exact: true })
    .click();
  await page
    .getByRole("button", {
      name: "01 站立舞步 左右与轻缓前后移动，不跳跃。",
      exact: true,
    })
    .click();

  await expect(
    page.getByText("请使用笔记本电脑", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "空间准备好了", exact: true }),
  ).toBeHidden();
});

test("a failed grant write stays visible and never grants optimistically", async ({
  page,
}) => {
  await page.addInitScript(`
    const nativeTransaction = IDBDatabase.prototype.transaction;
    let failNextWrite = true;
    IDBDatabase.prototype.transaction = function (...args) {
      const mode = args[1] ?? "readonly";
      if (failNextWrite && mode === "readwrite") {
        failNextWrite = false;
        throw new DOMException(
          "Synthetic write failure.",
          "InvalidStateError",
        );
      }
      return nativeTransaction.apply(this, args);
    };
  `);
  await page.goto("/?fast=1");
  await page
    .getByRole("button", { name: "查看我的节奏", exact: true })
    .click();
  await page
    .getByRole("button", { name: "查看模拟趋势演示", exact: true })
    .click();
  await page
    .getByRole("button", { name: "隐私与分享", exact: true })
    .click();
  await page
    .getByRole("button", { name: "选择一位信任的人", exact: true })
    .click();
  await page
    .getByRole("button", { name: "我允许这个用途", exact: true })
    .click();

  await expect(page.getByRole("alert")).toContainText(
    "本机数据暂时无法读取",
  );
  await expect(page.getByText("已允许预览", { exact: true })).toHaveCount(0);
  await page
    .getByRole("button", { name: "重试本机数据", exact: true })
    .click();
  await expect(page.getByText("默认关闭", { exact: true })).toBeVisible();
  await expect(page.getByRole("alert")).toHaveCount(0);
});
