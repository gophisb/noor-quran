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

test("Main navigation responds to touch-sized clicks", async ({ page }) => {
  const errors = [];
  await installRuntimeErrorHooks(page, errors);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://127.0.0.1:4173/noor-quran/", {
    waitUntil: "networkidle",
    timeout: 30000,
  });

  const expected = [
    ["القرآن", "سورة الفاتحة"],
    ["الأذان", "تجربة الأذان"],
    ["الأذكار", "تسبيح"],
    ["القبلة", "اتجاه القبلة"],
    ["حسابي", "الإعدادات"],
  ];

  for (const [label, viewText] of expected) {
    const button = page.getByRole("button", { name: label, exact: true }).last();
    await expect(button).toBeVisible();
    await button.click({ delay: 25 });
    await expect(page.getByText(viewText, { exact: false }).first()).toBeVisible({ timeout: 10000 });
  }

  const home = page.getByRole("button", { name: "الرئيسية", exact: true }).last();
  await expect(home).toBeVisible();
  await home.click({ delay: 25 });

  const quickQuran = page.getByRole("button", { name: /المصحف/ }).first();
  await expect(quickQuran).toBeVisible();
  await quickQuran.click({ delay: 25 });
  await expect(page.getByText("سورة الفاتحة", { exact: false }).first()).toBeVisible({ timeout: 10000 });

  expect(errors, errors.join("\n")).toEqual([]);
});
