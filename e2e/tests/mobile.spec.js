const { test, expect } = require("@playwright/test");
const { loginAs } = require("../helpers/actions");

test.describe("Móvil", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "admin");
  });

  test("home muestra menú hamburguesa y navega a la Gaceta Oficial", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { level: 1, name: "Portal Municipal de Mairana" })
    ).toBeVisible();
    await page.getByRole("button", { name: "Abrir menú" }).click();
    const drawer = page.locator("#menu-movil");
    await expect(drawer.getByRole("link", { name: "Gaceta Oficial" })).toBeVisible();
    await drawer.getByRole("link", { name: "Gaceta Oficial" }).click();
    await expect(
      page.getByRole("heading", { level: 1, name: "Gaceta Municipal Oficial" })
    ).toBeVisible();
  });

  test("panel admin sin scroll horizontal en móvil", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await expect(
      page.getByRole("heading", { name: "Bienvenido al Panel de Administración" })
    ).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });
});