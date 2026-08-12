import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

async function enterSyntheticMode(page: Page): Promise<void> {
  await page.getByRole("button", { name: "设置", exact: true }).click();
  await page.getByRole("switch", { name: /减少动态效果/ }).check();
  await page.getByRole("button", { name: "开始一局", exact: true }).click();
  await page
    .getByRole("button", { name: "我明白了，继续", exact: true })
    .click();
  await page
    .getByRole("button", { name: "先看模拟演示", exact: true })
    .click();
}

async function seedCapturedStandingHistory(
  page: Page,
  validity: {
    readonly validForTrend: boolean;
    readonly exclusionReasons: readonly string[];
  } = { validForTrend: true, exclusionReasons: [] },
): Promise<void> {
  const serializedValidity = JSON.stringify(validity);
  await page.evaluate(`
    new Promise((resolve, reject) => {
      const { exclusionReasons, validForTrend } = ${serializedValidity};
      const request = indexedDB.open("wuban-local-v1", 2);
      request.addEventListener("error", () => {
        reject(new Error("Could not open test history."));
      });
      request.addEventListener("success", () => {
        const database = request.result;
        const transaction = database.transaction(
          "session-summaries",
          "readwrite",
        );
        transaction.objectStore("session-summaries").put({
          schemaVersion: 1,
          sessionId: "captured-returning-player",
          completedAt: new Date().toISOString(),
          mode: "standing",
          chartId: "standing-mvp",
          chartVersion: 1,
          classifierVersion: 1,
          qualityVersion: 1,
          scoringVersion: 1,
          simulated: false,
          score: {
            funScore: 820,
            measures: {
              beatAccuracy: 0.82,
              shapeAccuracy: 0.84,
              flowRecovery: 0.8,
              memoryControl: 0.82,
              scoreableRatio: 0.95,
            },
            outcomes: [],
          },
          validity: {
            validForTrend,
            participationCredit: true,
            exclusionReasons,
          },
        });
        transaction.addEventListener("complete", () => {
          database.close();
          resolve();
        });
        transaction.addEventListener("error", () => {
          reject(new Error("Could not seed test history."));
        });
      });
    });
  `);
}

async function completeSyntheticSession(
  page: Page,
  modeName: string,
  contextConfounder = false,
): Promise<void> {
  await enterSyntheticMode(page);
  await page.getByRole("button", { name: modeName, exact: true }).click();
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
    page.getByRole("button", {
      name: contextConfounder
        ? "今天有些不同，也查看结果"
        : "和平常差不多，查看结果",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: contextConfounder
        ? "今天有些不同，也查看结果"
        : "和平常差不多，查看结果",
      exact: true,
    })
    .click();
}

async function reachStandingAudioStart(page: Page): Promise<void> {
  await enterSyntheticMode(page);
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
}

test("scored gameplay fills the viewport without page scrolling", async ({
  page,
}) => {
  await page.goto("/");
  await reachStandingAudioStart(page);

  await expect(
    page.getByRole("button", { name: "暂停", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "接下来的动作", exact: true }),
  ).toBeVisible();
  expect(await page.locator("[data-move-note]").count()).toBeGreaterThanOrEqual(
    4,
  );
  await expect(page.locator("[data-move-note]").first()).toContainText(
    /向左一步|向右一步|轻轻向前|轻轻退回/,
  );
  const playerState = page.locator("[data-player-state]");
  await expect(playerState).toBeVisible();
  await expect(playerState).toHaveAttribute("data-player-state", "center");
  await expect(playerState).toContainText("已在画面内");
  await expect(playerState).toContainText("已回到起始位置");
  const playerStateBounds = await playerState.boundingBox();
  expect(playerStateBounds?.width ?? 0).toBeGreaterThanOrEqual(200);
  const stateLabelSize = await page.evaluate<number>(`(() => {
    const label = document.querySelector(
      ".player-state-panel__state-copy strong",
    );
    return label === null
      ? 0
      : Number.parseFloat(getComputedStyle(label).fontSize);
  })()`);
  expect(stateLabelSize).toBeGreaterThanOrEqual(24);
  const pauseBounds = await page
    .getByRole("button", { name: "暂停", exact: true })
    .boundingBox();
  expect(pauseBounds?.height ?? 0).toBeGreaterThanOrEqual(56);
  await expect(
    page
      .getByRole("list", { name: "动作时间提示" })
      .getByText("现在做", { exact: true }),
  ).toBeVisible();
  const timingStages = await page.evaluate<(string | null)[]>(`Array.from(
    document.querySelectorAll("[data-move-note]"),
    (note) => note.getAttribute("data-timing-stage"),
  )`);
  expect(new Set(timingStages).size).toBeGreaterThanOrEqual(3);
  await expect(
    page.getByRole("region", { name: "本局进度", exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("第 8 步")).toHaveCount(0);
  await expect(page.getByText("08 / 11", { exact: true })).toHaveCount(0);

  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(
    accessibility.violations,
    accessibility.violations
      .map((violation) => `${violation.id}: ${violation.help}`)
      .join("\n"),
  ).toEqual([]);

  const dimensions = await page.evaluate<{
    viewportHeight: number;
    pageHeight: number;
  }>(`({
    viewportHeight: document.documentElement.clientHeight,
    pageHeight: document.documentElement.scrollHeight,
  })`);

  expect(dimensions.pageHeight).toBeLessThanOrEqual(
    dimensions.viewportHeight + 1,
  );
});

test("seated gameplay uses visible hand-specific readiness guidance", async ({
  page,
}) => {
  await page.goto("/");
  await enterSyntheticMode(page);
  await page
    .getByRole("button", {
      name: "02 坐姿手势 用左右手掌与食指完成节奏。",
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

  const playerState = page.locator("[data-player-state]");
  await expect(playerState).toBeVisible();
  await expect(playerState).toContainText("双手清楚可见");
  await expect(playerState).toContainText("双手准备好了");
  await expect(
    page.getByRole("group", { name: "您的移动位置" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("region", { name: "接下来的动作" }),
  ).toContainText(/左手掌|右手掌|双手掌|食指保持/);
});

for (const route of [
  {
    name: "standing",
    mode: "01 站立舞步 左右与轻缓前后移动，不跳跃。",
  },
  {
    name: "seated",
    mode: "02 坐姿手势 用左右手掌与食指完成节奏。",
  },
] as const) {
  test(`${route.name} simulated journey reaches a labelled result`, async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error" || message.type() === "warning") {
        consoleErrors.push(message.text());
      }
    });
    await page.goto("/?fast=1");

    await completeSyntheticSession(page, route.mode);

    await expect(page.getByText("模拟演示", { exact: true })).toHaveCount(2);
    await expect(page.getByText("这不是诊断。", { exact: true })).toBeVisible();
    await expect(
      page.getByText("此结果来自预制关键点，只用于演示，不是个人表现。", {
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByText(
        "DEV-ONLY CAMERA EVIDENCE — NOT YET HUMAN-VALIDATED",
        { exact: true },
      ),
    ).toHaveCount(0);
    expect(consoleErrors).toEqual([]);
  });
}

test("an unusual-day report preserves the result but excludes the trend", async ({
  page,
}) => {
  await page.goto("/?fast=1");

  await completeSyntheticSession(
    page,
    "01 站立舞步 左右与轻缓前后移动，不跳跃。",
    true,
  );

  await expect(
    page.getByText(
      "欢乐分和参与记录已保留。因为你说今天有些不同，这一局不会加入个人平常范围。",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(page.getByText("欢乐分", { exact: true })).toBeVisible();
});

test("pause, resume, and stop are keyboard reachable during play", async ({
  page,
}) => {
  await page.goto("/");
  await enterSyntheticMode(page);
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

  const pause = page.getByRole("button", { name: "暂停", exact: true });
  await expect(pause).toBeVisible();
  const voiceGuidance = page.getByRole("checkbox", {
    name: "朗读固定动作提示",
    exact: true,
  });
  await expect(voiceGuidance).toHaveCount(0);
  const firstNote = page.locator("[data-move-note]").first();
  await pause.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText("已暂停", { exact: true })).toBeVisible();
  await expect(voiceGuidance).toBeVisible();
  await voiceGuidance.check();
  await expect(voiceGuidance).toBeChecked();
  const pausedStyle = await firstNote.getAttribute("style");
  await page.waitForTimeout(350);
  await expect(firstNote).toHaveAttribute("style", pausedStyle ?? "");

  const resume = page.getByRole("button", {
    name: "继续游戏",
    exact: true,
  });
  await resume.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText("已暂停", { exact: true })).toBeHidden();

  await page.evaluate(`
    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  `);
  await expect(page.getByText("已暂停", { exact: true })).toBeVisible();
  await page.evaluate(`
    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => false,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  `);
  await page
    .getByRole("button", { name: "继续游戏", exact: true })
    .click();

  const stop = page.getByRole("button", {
    name: "停止并退出",
    exact: true,
  });
  await stop.focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { name: /一起跳， 慢慢来/ }),
  ).toBeVisible();
  await expect(page.getByText(/本机共 1 次记录/)).toBeVisible();
  await page
    .getByRole("button", { name: "查看我的节奏", exact: true })
    .click();
  await page
    .getByRole("button", { name: "隐私与分享", exact: true })
    .click();
  await page
    .getByText("查看本机保存的字段与记录（1）", { exact: true })
    .click();
  const interruptedRecord = page.locator(".local-record-inspector pre");
  await expect(interruptedRecord).toContainText('"sessionId"');
  await expect(interruptedRecord).toContainText('"interrupted"');
  await expect(
    page.getByText("这里不会出现视频、照片、声音或关键点帧。", {
      exact: true,
    }),
  ).toBeVisible();
});

test("disclosure precedes permission and camera-free demo remains available", async ({
  page,
}) => {
  await page.addInitScript(`
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        getUserMedia: () =>
          Promise.reject(
            new DOMException("Permission denied by browser test.", "NotAllowedError"),
          ),
      },
    });
  `);
  await page.goto("/?fast=1");
  await page.getByRole("button", { name: "开始一局", exact: true }).focus();
  await page.keyboard.press("Enter");

  await expect(
    page.getByText("不保存视频、照片、人脸或声音。", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "打开摄像头", exact: true }),
  ).toHaveCount(0);

  await page
    .getByRole("button", { name: "我明白了，继续", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "打开摄像头", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "先看模拟演示", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "打开摄像头", exact: true })
    .click();
  await expect(
    page.getByText("摄像头没有打开。请在浏览器地址栏允许访问，再重试。", {
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "先看模拟演示", exact: true })
    .click();
  await expect(
    page.getByRole("button", {
      name: "01 站立舞步 左右与轻缓前后移动，不跳跃。",
      exact: true,
    }),
  ).toBeVisible();
});

test("a returning captured player reuses mode and reaches play without the full tutorial", async ({
  page,
}) => {
  await page.goto("/?fast=1");
  await seedCapturedStandingHistory(page);
  await page.reload();

  await expect(
    page.getByText(/站立舞步.*约 4 分钟/),
  ).toBeVisible();
  const startedAt = Date.now();
  await page
    .getByRole("button", { name: "开始今天的一局", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "现在打开摄像头？", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("不保存视频、照片、人脸或声音。", { exact: true }),
  ).toHaveCount(0);

  await page
    .getByRole("button", { name: "先看模拟演示", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "空间准备好了", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "01 站立舞步 左右与轻缓前后移动，不跳跃。",
      exact: true,
    }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "空间准备好了", exact: true })
    .click();
  await page
    .getByRole("button", { name: "位置没问题", exact: true })
    .click();

  await expect(
    page.getByRole("button", { name: "暂停", exact: true }),
  ).toBeVisible();
  expect(Date.now() - startedAt).toBeLessThan(45_000);
});

test("classifier-backed tracking loss recovers and persists a quality-invalid result", async ({
  page,
}) => {
  await page.goto("/?fast=1&scenario=tracking-loss");
  await enterSyntheticMode(page);
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

  const trackingOverlay = page.getByText("暂时看不清动作", {
    exact: true,
  });
  await expect(trackingOverlay).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText("不计分", { exact: true }).last()).toBeVisible();
  await expect(
    page.getByRole("button", { name: "暂停", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "停止并退出", exact: true }),
  ).toBeVisible();
  await expect(trackingOverlay).toBeHidden({ timeout: 10_000 });
  await page
    .getByRole("button", {
      name: "和平常差不多，查看结果",
      exact: true,
    })
    .click();

  await expect(
    page.getByText(
      "你完成了这一局，但有些片段看不清，所以不会加入个人平常模式。",
      { exact: true },
    ),
  ).toBeVisible();
  await page.getByRole("button", { name: "回到首页", exact: true }).click();
  await page
    .getByRole("button", { name: "查看我的节奏", exact: true })
    .click();
  await expect(
    page.getByText("还需要 5 次同一方式的清晰游戏，才能形成初步平常范围。", {
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "隐私与分享", exact: true })
    .click();
  await page
    .getByText("查看本机保存的字段与记录（1）", { exact: true })
    .click();
  const record = page.locator(".local-record-inspector pre");
  await expect(record).toContainText('"validForTrend": false');
  await expect(record).toContainText('"insufficient-scoreable-input"');
});

test("a captured quality-invalid session earns participation but not trend input", async ({
  page,
}) => {
  await page.goto("/?fast=1");
  await seedCapturedStandingHistory(page, {
    validForTrend: false,
    exclusionReasons: ["insufficient-scoreable-input"],
  });
  await page.reload();

  await expect(
    page.getByText("本周已跳 1 次 · 本机共 1 次记录", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "查看我的节奏", exact: true })
    .click();
  await expect(page.getByText("本周参与 1 次", { exact: true })).toBeVisible();
  await expect(
    page.getByText("还需要 5 次同一方式的清晰游戏，才能形成初步平常范围。", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.locator(".trend-rule-note strong"),
  ).toHaveText("0");
});

test("audio preparation stops before cues and silent practice stays excluded", async ({
  page,
}) => {
  await page.addInitScript(`
    Object.defineProperty(window, "AudioContext", {
      configurable: true,
      value: function BlockedAudioContext() {
        throw new Error("Synthetic audio preparation failure.");
      },
    });
  `);
  await page.goto("/");
  await reachStandingAudioStart(page);

  await expect(
    page.getByRole("heading", { name: "节拍还没有准备好。", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("alert")).toContainText(
    "计分提示还没有开始",
  );
  await expect(
    page.getByRole("button", { name: "暂停", exact: true }),
  ).toHaveCount(0);

  await page
    .getByRole("button", { name: "继续静音练习", exact: true })
    .click();
  await expect(
    page.getByText("静音练习", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "暂停", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "停止并退出", exact: true })
    .click();

  await expect(page.getByText(/本机共 1 次记录/)).toBeVisible();
  await page
    .getByRole("button", { name: "查看我的节奏", exact: true })
    .click();
  await page
    .getByRole("button", { name: "隐私与分享", exact: true })
    .click();
  await page
    .getByText("查看本机保存的字段与记录（1）", { exact: true })
    .click();
  await expect(page.locator(".local-record-inspector pre")).toContainText(
    '"clock-error"',
  );
});

test("audio retry creates a fresh clock before countdown", async ({ page }) => {
  await page.addInitScript(`
    const NativeAudioContext = window.AudioContext;
    let openingAttempts = 0;
    Object.defineProperty(window, "AudioContext", {
      configurable: true,
      value: function RecoverableAudioContext(options) {
        openingAttempts += 1;
        if (openingAttempts === 1) {
          throw new Error("Synthetic first audio preparation failure.");
        }
        return new NativeAudioContext(options);
      },
    });
  `);
  await page.goto("/");
  await reachStandingAudioStart(page);

  await expect(
    page.getByRole("heading", { name: "节拍还没有准备好。", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "重试声音", exact: true }).click();

  await expect(page.getByText("准备", { exact: true })).toBeVisible();
  await expect(
    page.getByText("静音练习", { exact: true }),
  ).toHaveCount(0);
});

test("leaving during audio preparation cannot start a stale session", async ({
  page,
}) => {
  await page.addInitScript(`
    Object.defineProperty(window, "AudioContext", {
      configurable: true,
      value: function PendingAudioContext() {
        this.state = "suspended";
        this.resume = () =>
          new Promise((resolve) => {
            window.resolvePendingWubanAudio = () => {
              this.state = "running";
              resolve();
            };
          });
        this.close = () => {
          this.state = "closed";
          return Promise.resolve();
        };
      },
    });
  `);
  await page.goto("/");
  await reachStandingAudioStart(page);

  await expect(
    page.getByRole("button", { name: "正在准备节拍…", exact: true }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "停止并退出", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: /一起跳， 慢慢来/ }),
  ).toBeVisible();

  await page.evaluate(`
    window.resolvePendingWubanAudio();
  `);
  await expect(page.getByText("准备", { exact: true })).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: /一起跳， 慢慢来/ }),
  ).toBeVisible();
});

test("a runtime audio failure ends scoring and preserves an invalid result", async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });
  await page.addInitScript(`
    const NativeAudioContext = window.AudioContext;
    Object.defineProperty(window, "AudioContext", {
      configurable: true,
      value: function RuntimeFailingAudioContext(options) {
        const context = new NativeAudioContext(options);
        context.suspend = () =>
          Promise.reject(new Error("Synthetic runtime audio failure."));
        return context;
      },
    });
  `);
  await page.goto("/");
  await reachStandingAudioStart(page);

  const pause = page.getByRole("button", { name: "暂停", exact: true });
  await expect(pause).toBeVisible();
  await pause.click();

  await expect(
    page.getByRole("heading", { name: "这一局完成了。", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: "和平常差不多，查看结果",
      exact: true,
    })
    .click();
  await expect(
    page.getByText(
      "本局部分或全部节拍没有正常工作。欢乐分和参与记录已保留，但不会进入个人平常范围。",
      { exact: true },
    ),
  ).toBeVisible();
  expect(pageErrors).toEqual([]);
});
