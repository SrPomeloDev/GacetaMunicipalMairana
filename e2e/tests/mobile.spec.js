const { test, expect } = require("@playwright/test");
const { loginAs } = require("../helpers/actions");

test.describe("Móvil", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "admin");
  });

  test("home muestra menú hamburguesa y navega a normativa", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { level: 1, name: "Gaceta Municipal Oficial" })
    ).toBeVisible();
    await page.getByRole("button", { name: "Abrir menú" }).click();
    const drawerNav = page.locator("header div.liquid-glass.xl\\:hidden").getByRole("navigation");
    await expect(drawerNav.getByRole("link", { name: "Normativa", exact: true })).toBeVisible();
    await drawerNav.getByRole("link", { name: "Normativa", exact: true }).click();
    await expect(
      page.getByRole("heading", { level: 1, name: "Normativa Municipal" })
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