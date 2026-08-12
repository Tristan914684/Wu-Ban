import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

async function expectNoAxeViolations(page: Page) {
  const results = await new AxeBuilder({ page }).analyze();
  expect(
    results.violations,
    results.violations
      .map((violation) => `${violation.id}: ${violation.help}`)
      .join("\n"),
  ).toEqual([]);
}

async function expectPageToFitViewport(page: Page, screen: string) {
  const dimensions = await page.evaluate<{
    viewportHeight: number;
    pageHeight: number;
  }>(`({
    viewportHeight: document.documentElement.clientHeight,
    pageHeight: document.documentElement.scrollHeight,
  })`);

  expect(
    dimensions.pageHeight,
    `${screen} should not require page-level vertical scrolling at 1280 × 720`,
  ).toBeLessThanOrEqual(dimensions.viewportHeight + 1);
}

async function completeStandingSpectatorSession(page: Page): Promise<void> {
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
  await page
    .getByRole("button", { name: "空间准备好了", exact: true })
    .click();
  await page
    .getByRole("button", { name: "位置没问题", exact: true })
    .click();
  await page
    .getByRole("button", { name: "听到节拍，开始倒数", exact: true })
    .click();
  await page
    .getByRole("button", {
      name: "和平常差不多，查看结果",
      exact: true,
    })
    .click();
}

async function reachStandingGameplay(page: Page): Promise<void> {
  await page.goto("/");
  await page.getByRole("button", { name: "开始一局", exact: true }).click();
  await page
    .getByRole("button", { name: "我明白了，继续", exact: true })
    .click();
  await page
    .getByRole("button", { name: "先看模拟演示", exact: true })
    .click();
  await page
    .getByRole("button", { name: /01 站立舞步/ })
    .click();
  await page
    .getByRole("button", { name: "空间准备好了", exact: true })
    .click();
  await page
    .getByRole("button", { name: "位置没问题", exact: true })
    .click();
  await page
    .getByRole("button", { name: "听到节拍，开始倒数", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "暂停", exact: true }),
  ).toBeVisible();
}

test("home and progress surfaces have no detectable axe violations", async ({
  page,
}) => {
  await page.goto("/");
  await expectNoAxeViolations(page);

  await page
    .getByRole("button", { name: "查看我的节奏", exact: true })
    .click();
  await expectNoAxeViolations(page);

  await page
    .getByRole("button", { name: "查看模拟趋势演示", exact: true })
    .click();
  await expectNoAxeViolations(page);

  await page
    .getByRole("button", { name: "隐私与分享", exact: true })
    .click();
  await expectNoAxeViolations(page);
});

test("gameplay and paused comfort settings have no detectable axe violations", async ({
  page,
}) => {
  await reachStandingGameplay(page);

  await expect(
    page.getByRole("complementary", { name: "您的位置与动作识别" }),
  ).toBeVisible();
  await expect(
    page.getByRole("list", { name: "动作时间提示" }),
  ).toContainText("稍后下一个准备现在做");
  await expectNoAxeViolations(page);

  await page.getByRole("button", { name: "暂停", exact: true }).click();
  const pauseDialog = page.getByRole("dialog", {
    name: "暂停与舒适度设置",
  });
  await expect(pauseDialog).toBeVisible();
  await expect(
    pauseDialog.getByRole("button", { name: "继续游戏", exact: true }),
  ).toBeVisible();
  await expect(
    pauseDialog.getByRole("checkbox", { name: "朗读固定动作提示" }),
  ).toBeVisible();
  await expectNoAxeViolations(page);
});

test("screen changes orient keyboard and screen-reader users to the new task", async ({
  page,
}) => {
  await page.goto("/?fast=1");

  const homeHeading = page.getByRole("heading", {
    name: /一起跳， 慢慢来。/,
    exact: true,
  });
  await expect(homeHeading).toBeFocused();
  await page.getByRole("button", { name: "设置", exact: true }).click();
  await expect(
    page.getByRole("switch", { name: /减少动态效果/ }),
  ).not.toBeChecked();
  await expect(
    page.getByRole("radio", { name: "中文", exact: true }),
  ).toBeChecked();

  await page.getByRole("button", { name: "开始一局", exact: true }).click();
  const disclosureHeading = page.getByRole("heading", {
    name: /画面看过就 丢弃。/,
    exact: true,
  });
  await expect(disclosureHeading).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "我明白了，继续", exact: true }),
  ).toBeFocused();

  await page.goto("/?fast=1");
  await page
    .getByRole("button", { name: "查看我的节奏", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "正在认识你的平常节奏。",
      exact: true,
    }),
  ).toBeFocused();
  await page
    .getByRole("button", { name: "隐私与分享", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "由你决定谁能看到。",
      exact: true,
    }),
  ).toBeFocused();

  await page.goto("/?fast=1");
  await completeStandingSpectatorSession(page);
  await expect(
    page.getByRole("heading", {
      name: /完成比满分 更重要。/,
      exact: true,
    }),
  ).toBeFocused();
  await expect(page.getByRole("status")).toContainText("模拟演示");
  await expect(
    page.getByRole("button", { name: "回到首页", exact: true }),
  ).toBeVisible();
});

test("the language choice updates page semantics and survives reload", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "设置", exact: true }).click();
  await page.getByRole("radio", { name: "English", exact: true }).check();

  await expect(
    page.getByRole("heading", { name: /Dance together. Take your time./ }),
  ).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");

  await page.reload();
  await expect(
    page.getByRole("button", { name: "Settings", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /Dance together. Take your time./ }),
  ).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("the explicit reduced-motion choice survives a new session", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "设置", exact: true }).click();
  const control = page.getByRole("switch", { name: /减少动态效果/ });

  await expect(control).not.toBeChecked();
  await control.check();
  await expect(control).toBeChecked();

  await page.reload();
  await page.getByRole("button", { name: "设置", exact: true }).click();
  await expect(
    page.getByRole("switch", { name: /减少动态效果/ }),
  ).toBeChecked();
  await expect(page.locator(".app-shell")).toHaveAttribute(
    "data-reduced-motion",
    "true",
  );
});

test("reading surfaces remain available at a 200 percent equivalent viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 640, height: 720 });
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: /一起跳， 慢慢来/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "设置", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "查看我的节奏", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: /正在认识你的平常节奏/ }),
  ).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(
    "document.documentElement.scrollWidth > document.documentElement.clientWidth",
  );
  expect(hasHorizontalOverflow).toBe(false);
});

test("primary setup screens fit the laptop viewport without page scrolling", async ({
  page,
}) => {
  await page.goto("/?fast=1");
  await expectPageToFitViewport(page, "Home");

  await page.getByRole("button", { name: "开始一局", exact: true }).click();
  await expectPageToFitViewport(page, "Camera disclosure");

  await page
    .getByRole("button", { name: "我明白了，继续", exact: true })
    .click();
  await expectPageToFitViewport(page, "Camera permission");

  await page
    .getByRole("button", { name: "先看模拟演示", exact: true })
    .click();
  await expectPageToFitViewport(page, "Mode selection");

  await page
    .getByRole("button", {
      name: "01 站立舞步 左右与轻缓前后移动，不跳跃。",
      exact: true,
    })
    .click();
  await expectPageToFitViewport(page, "Safety check");

  await page
    .getByRole("button", { name: "空间准备好了", exact: true })
    .click();
  await expectPageToFitViewport(page, "Calibration");

  await page
    .getByRole("button", { name: "位置没问题", exact: true })
    .click();
  await expectPageToFitViewport(page, "Movement tutorial");
  await expect(
    page.getByRole("heading", {
      name: "双脚从中央脚印开始，每一步后回到脚印。",
    }),
  ).toBeVisible();
  const practiceStage = page.locator("[data-practice-stage]");
  await expect(practiceStage).toBeInViewport();
  const stageBox = await practiceStage.boundingBox();
  const viewport = page.viewportSize();
  expect(stageBox).not.toBeNull();
  expect(viewport).not.toBeNull();
  expect(stageBox!.width).toBeGreaterThan(520);
  expect(stageBox!.height).toBeGreaterThan(390);
  expect(stageBox!.x).toBeGreaterThanOrEqual(0);
  expect(stageBox!.x + stageBox!.width).toBeLessThanOrEqual(
    viewport!.width,
  );
  await expect(page.getByText("中央起点", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "设置", exact: true }).click();
  await page.getByRole("radio", { name: "English", exact: true }).check();
  await page.goto("/?fast=1");
  await expectPageToFitViewport(page, "English home");

  await page
    .getByRole("button", { name: "Start a session", exact: true })
    .click();
  await expectPageToFitViewport(page, "English camera disclosure");

  await page
    .getByRole("button", { name: "I understand, continue", exact: true })
    .click();
  await expectPageToFitViewport(page, "English camera permission");

  await page
    .getByRole("button", { name: "View simulated demo", exact: true })
    .click();
  await expectPageToFitViewport(page, "English mode selection");

  await page
    .getByRole("button", {
      name: "01 Standing steps Gentle side and bounded forward/back steps. No jumps.",
      exact: true,
    })
    .click();
  await expectPageToFitViewport(page, "English safety check");

  await page
    .getByRole("button", { name: "My space is ready", exact: true })
    .click();
  await expectPageToFitViewport(page, "English calibration");

  await page
    .getByRole("button", { name: "Position looks good", exact: true })
    .click();
  await expectPageToFitViewport(page, "English movement tutorial");
});

test("forced colours and system reduced motion keep the first task operable", async ({
  page,
}) => {
  await page.emulateMedia({
    forcedColors: "active",
    reducedMotion: "reduce",
  });
  await page.goto("/");

  await expect(
    page.getByRole("button", { name: "开始一局", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "设置", exact: true }).click();
  await expect(
    page.getByRole("switch", { name: /减少动态效果/ }),
  ).toBeChecked();
  await expectNoAxeViolations(page);
});

test("local data failures stay visible and recover without becoming empty history", async ({
  page,
}) => {
  await page.addInitScript(`
    const nativeOpen = indexedDB.open.bind(indexedDB);
    let remainingFailures = 2;
    Object.defineProperty(indexedDB, "open", {
      configurable: true,
      value(...args) {
        if (remainingFailures <= 0) {
          return nativeOpen(...args);
        }
        remainingFailures -= 1;
        const request = new EventTarget();
        Object.defineProperty(request, "error", {
          configurable: true,
          get: () => new DOMException(
            "Synthetic storage failure.",
            "UnknownError",
          ),
        });
        queueMicrotask(() => {
          request.dispatchEvent(new Event("error"));
        });
        return request;
      },
    });
  `);
  await page.goto("/?fast=1");

  const unavailable = page.getByRole("alert");
  await expect(unavailable).toContainText("本机数据暂时无法读取");
  await page
    .getByRole("button", { name: "查看我的节奏", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "本机节奏暂时无法显示。",
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByText(/还需要 5 次/)).toHaveCount(0);
  await expectNoAxeViolations(page);

  await page
    .getByRole("button", { name: "重试本机数据", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "正在认识你的平常节奏。",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "隐私与分享", exact: true })
    .click();
  await expect(unavailable).toContainText("本机数据暂时无法读取");
  await expect(page.getByText("默认关闭", { exact: true })).toHaveCount(0);
  await expectNoAxeViolations(page);

  await page
    .getByRole("button", { name: "重试本机数据", exact: true })
    .click();
  await expect(page.getByText("默认关闭", { exact: true })).toBeVisible();
  await expect(unavailable).toHaveCount(0);
});
