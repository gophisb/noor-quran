const { test, expect } = require("@playwright/test");

async function installRuntimeErrorHooks(page, errors) {
  page.on("pageerror", (error) => errors.push(`PAGEERROR: ${error.stack || error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`CONSOLE: ${message.text()}`);
  });
}

test("Noor Quran boots without runtime errors", async ({ page }) => {
  const errors = [];
  await installRuntimeErrorHooks(page, errors);

  await page.goto("http://127.0.0.1:4173/noor-quran/", {
    waitUntil: "networkidle",
    timeout: 30000,
  });
  await page.waitForTimeout(1500);

  const rootText = await page.locator("#root").innerText();
  console.log("TITLE:", await page.title());
  console.log("ROOT:", rootText.slice(0, 1200));

  expect(rootText).toContain("نُور");
  expect(rootText).not.toMatch(/تعذر تشغيل واجهة التطبيق|تعذّر تشغيل واجهة التطبيق/);
  expect(errors, errors.join("\n")).toEqual([]);
});

test.describe("mobile touch interaction", () => {
  test.use({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
  });

  test("Main navigation responds to real touch taps", async ({ page }) => {
    const errors = [];
    await installRuntimeErrorHooks(page, errors);

    await page.goto("http://127.0.0.1:4173/noor-quran/", {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    const expectedViews = ["quran", "adhan", "athkar", "qibla", "profile"];

    for (const view of expectedViews) {
      const labels = {
        quran: "القرآن",
        adhan: "الأذان",
        athkar: "الأذكار",
        qibla: "القبلة",
        profile: "حسابي",
      };
      const button = page.getByRole("button", { name: labels[view], exact: true }).last();
      await expect(button).toBeVisible();
      await button.tap();
      await expect(page.locator('[data-view="' + view + '"]')).toBeVisible({ timeout: 10000 });
    }

    const home = page.getByRole("button", { name: "الرئيسية", exact: true }).last();
    await expect(home).toBeVisible();
    await home.tap();
    await expect(page.locator('[data-view="home"]')).toBeVisible();

    const quickQuran = page.getByRole("button", { name: /المصحف/ }).first();
    await expect(quickQuran).toBeVisible();
    await quickQuran.tap();
    await expect(page.locator('[data-view="quran"]')).toBeVisible({ timeout: 10000 });

    expect(errors, errors.join("\n")).toEqual([]);
  });
});
