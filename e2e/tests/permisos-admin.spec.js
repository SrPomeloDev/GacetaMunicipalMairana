const { test, expect } = require("@playwright/test");
const { loginAs } = require("../helpers/actions");

test.describe("Permisos — administrador", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "admin");
  });

  test("el sidebar muestra todos los módulos", async ({ page }) => {
    await page.goto("/admin/dashboard");
    const nav = page.locator("aside nav");
    await expect(nav.getByRole("link", { name: "Usuarios" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Configuración" })).toBeVisible();
  });

  test("la lista de normativa muestra acciones por fila", async ({ page }) => {
    await page.goto("/admin/normativa");
    await expect(page.getByRole("heading", { name: "Normativa" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Nueva Normativa" })).toBeVisible();
    await expect(page.locator("thead th", { hasText: "Acciones" })).toBeVisible();
  });

  test("la lista de noticias muestra acciones por fila", async ({ page }) => {
    await page.goto("/admin/noticias");
    await expect(page.getByRole("heading", { name: "Noticias" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Nueva Noticia" })).toBeVisible();
    await expect(page.locator("thead th", { hasText: "Acciones" })).toBeVisible();
  });
});