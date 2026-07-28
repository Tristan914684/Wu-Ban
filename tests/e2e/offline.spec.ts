import { expect, test } from "@playwright/test";

test("the local spectator route starts after the network is removed", async ({
  context,
  page,
}) => {
  await page.goto("/?fast=1");
  await page.evaluate(`
    navigator.serviceWorker.ready.then(() => {
      if (navigator.serviceWorker.controller !== null) return;
      return new Promise((resolve) => {
        navigator.serviceWorker.addEventListener(
          "controllerchange",
          resolve,
          { once: true },
        );
      });
    })
  `);

  await context.setOffline(true);
  await page.reload();

  await expect(
    page.getByRole("heading", { name: /一起跳， 慢慢来/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "开始一局", exact: true }).click();
  await page
    .getByRole("button", { name: "我明白了，继续", exact: true })
    .click();
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
