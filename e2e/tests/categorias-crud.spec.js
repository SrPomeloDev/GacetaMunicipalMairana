const { test, expect } = require("@playwright/test");
const { loginAs, confirmarEliminacion } = require("../helpers/actions");

const TS = Date.now();
const NOMBRE = `Categoría E2E ${TS}`;

test.describe("CRUD de categorías (admin)", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await loginAs(page, "admin");
  });

  test("crear categoría y verla en la lista", async ({ page }) => {
    await page.goto("/admin/categorias/nueva");
    await expect(page.getByRole("heading", { name: "Nueva Categoría" })).toBeVisible();
    await page.fill('input[name="nombre"]', NOMBRE);
    await page.getByRole("button", { name: "Crear Categoría" }).click();
    await page.waitForURL("**/admin/categorias");

    await page.getByPlaceholder("Buscar categoría...").fill(NOMBRE);
    const row = page.locator("tbody tr", { hasText: NOMBRE });
    await expect(row).toHaveCount(1);
  });

  test("editar categoría", async ({ page }) => {
    await page.goto("/admin/categorias");
    await page.getByPlaceholder("Buscar categoría...").fill(NOMBRE);
    const row = page.locator("tbody tr", { hasText: NOMBRE });
    await expect(row).toHaveCount(1);
    await row.getByRole("link", { name: "Editar" }).click();

    await expect(page.getByRole("heading", { name: "Editar Categoría" })).toBeVisible();
    await page.fill('textarea[name="descripcion"]', `Descripción E2E ${TS}`);
    await page.getByRole("button", { name: "Guardar Cambios" }).click();
    await page.waitForURL("**/admin/categorias");

    await page.getByPlaceholder("Buscar categoría...").fill(NOMBRE);
    await expect(page.locator("tbody tr", { hasText: NOMBRE })).toHaveCount(1);
  });

  test("eliminar categoría con confirmación", async ({ page }) => {
    await page.goto("/admin/categorias");
    await page.getByPlaceholder("Buscar categoría...").fill(NOMBRE);
    const row = page.locator("tbody tr", { hasText: NOMBRE });
    await expect(row).toHaveCount(1);
    await row.getByRole("button", { name: "Eliminar" }).click();
    await expect(page.getByText(/¿Seguro que deseas eliminar/i)).toBeVisible();
    await confirmarEliminacion(page, "Eliminar categoría");
    await expect(page.locator("tbody tr", { hasText: NOMBRE })).toHaveCount(0);
  });

  test.afterAll(async ({ browser }) => {
    const ctx = await browser.newContext({ baseURL: "http://localhost:3100" });
    const page = await ctx.newPage();
    await loginAs(page, "admin");
    await page.goto("/admin/categorias");
    await page.getByPlaceholder("Buscar categoría...").fill("E2E");
    let guard = 0;
    while ((await page.locator("tbody tr", { hasText: "E2E" }).count()) > 0 && guard < 10) {
      await page.locator("tbody tr", { hasText: "E2E" }).first().getByRole("button", { name: "Eliminar" }).click();
      await confirmarEliminacion(page, "Eliminar categoría");
      guard += 1;
    }
    await ctx.close();
  });
});
