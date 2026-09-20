const { test, expect } = require("@playwright/test");

test("Noor Quran boots without runtime errors", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(`PAGEERROR: ${error.stack || error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`CONSOLE: ${message.text()}`);
  });

  await page.goto("http://127.0.0.1:4173/noor-quran/", {
    waitUntil: "networkidle",
    timeout: 30000,
  });
  await page.waitForTimeout(2500);

  const rootText = await page.locator("#root").innerText();
  console.log("TITLE:", await page.title());
  console.log("ROOT:", rootText.slice(0, 1200));

  expect(rootText).toContain("نُور");
  expect(rootText).not.toMatch(/تعذر تشغيل واجهة التطبيق|تعذّر تشغيل واجهة التطبيق/);
  expect(errors, errors.join("\n")).toEqual([]);
});

// Runtime smoke test: CommonJS runner for CI.
