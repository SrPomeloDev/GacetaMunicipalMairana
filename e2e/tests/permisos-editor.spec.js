const { test, expect } = require("@playwright/test");
const { loginAs, confirmarEliminacion } = require("../helpers/actions");

const TS = Date.now();
const NUMERO = `E2E-${TS}`;
const TITULO = `Normativa editor E2E ${TS}`;

test.describe("Permisos — editor", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "editor");
  });

  test("el sidebar oculta Usuarios y Configuración", async ({ page }) => {
    await page.goto("/admin/dashboard");
    const nav = page.locator("aside nav");
    await expect(nav.getByRole("link", { name: "Usuarios" })).toHaveCount(0);
    await expect(nav.getByRole("link", { name: "Configuración" })).toHaveCount(0);
  });

  test("puede crear normativa pero no eliminarla (RLS)", async ({ page }) => {
    await page.goto("/admin/normativa/nueva");
    await expect(page.getByRole("heading", { name: "Nueva Normativa" })).toBeVisible();
    await page.fill('input[name="numero"]', NUMERO);
    await page.fill('input[name="titulo"]', TITULO);
    await page.getByRole("button", { name: "Crear Normativa" }).click();
    await page.waitForURL("**/admin/normativa");

    await page.getByPlaceholder("Buscar normativa...").fill(NUMERO);
    const row = page.locator("tbody tr", { hasText: TITULO });
    await expect(row).toHaveCount(1);

    await row.getByRole("button", { name: "Eliminar" }).click();
    await confirmarEliminacion(page, "Eliminar normativa");

    // RLS: el DELETE es silencioso (204 sin filas afectadas): la fila NO se borra del servidor
    await expect(row).toHaveCount(1);
  });

  test.afterAll(async ({ browser }) => {
    const ctx = await browser.newContext({ baseURL: "http://localhost:3100" });
    const page = await ctx.newPage();
    await loginAs(page, "admin");
    await page.goto("/admin/normativa");
    await page.getByPlaceholder("Buscar normativa...").fill(NUMERO);
    const row = page.locator("tbody tr", { hasText: TITULO });
    if ((await row.count()) === 1) {
      await row.getByRole("button", { name: "Eliminar" }).click();
      await confirmarEliminacion(page, "Eliminar normativa");
      await expect(row).toHaveCount(0);
    }
    await ctx.close();
  });
});