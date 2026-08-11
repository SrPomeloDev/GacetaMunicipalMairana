const { test, expect } = require("@playwright/test");

test.describe("Tema oscuro/claro", () => {
  test("el toggle cambia a oscuro y persiste al recargar", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByRole("button", { name: "Cambiar tema" });
    const stored = await page.evaluate(() => localStorage.getItem("gaceta-theme"));
    if (stored === "dark") await toggle.click();

    await expect(page.locator("html")).not.toHaveClass(/\bdark\b/);
    await toggle.click();
    await expect(page.locator("html")).toHaveClass(/\bdark\b/);

    await page.reload();
    await expect(page.locator("html")).toHaveClass(/\bdark\b/);

    await toggle.click();
    await expect(page.locator("html")).not.toHaveClass(/\bdark\b/);
  });
});