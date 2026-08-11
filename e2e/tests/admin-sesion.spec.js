const { test, expect } = require("@playwright/test");
const { loginAs } = require("../helpers/actions");

test.describe("Sesión de administrador", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "admin");
  });

  test("dashboard carga con bienvenida", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await expect(
      page.getByRole("heading", { name: "Bienvenido al Panel de Administración" })
    ).toBeVisible();
  });

  test("cerrar sesión devuelve al login", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await page.getByRole("button", { name: "Cerrar Sesión" }).click();
    await page.waitForURL("**/admin/login");
    await expect(page.getByRole("heading", { name: "Iniciar Sesión" })).toBeVisible();
  });
});