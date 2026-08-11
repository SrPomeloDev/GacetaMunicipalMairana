const { test, expect } = require("@playwright/test");
const { loginAs, confirmarEliminacion } = require("../helpers/actions");

const TS = Date.now();
const NUMERO = `E2E-${TS}`;
const TITULO = `Normativa E2E ${TS}`;

test.describe("CRUD de normativa (admin)", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await loginAs(page, "admin");
  });

  test("crear normativa y verla en la lista", async ({ page }) => {
    await page.goto("/admin/normativa/nueva");
    await expect(page.getByRole("heading", { name: "Nueva Normativa" })).toBeVisible();
    await page.fill('input[name="numero"]', NUMERO);
    await page.fill('input[name="titulo"]', TITULO);
    await page.fill('textarea[name="resumen"]', `Resumen de prueba E2E ${TS}`);
    await page.getByRole("button", { name: "Crear Normativa" }).click();
    await page.waitForURL("**/admin/normativa");

    await page.getByPlaceholder("Buscar normativa...").fill(NUMERO);
    const row = page.locator("tbody tr", { hasText: TITULO });
    await expect(row).toHaveCount(1);
    await expect(row).toContainText("Vigente");
  });

  test("editar normativa", async ({ page }) => {
    await page.goto("/admin/normativa");
    await page.getByPlaceholder("Buscar normativa...").fill(NUMERO);
    const row = page.locator("tbody tr", { hasText: TITULO });
    await expect(row).toHaveCount(1);
    await row.getByRole("link", { name: "Editar" }).click();

    await expect(page.getByRole("heading", { name: "Editar Normativa" })).toBeVisible();
    await page.fill('textarea[name="resumen"]', `Resumen editado E2E ${TS}`);
    await page.getByRole("button", { name: "Guardar Cambios" }).click();
    await page.waitForURL("**/admin/normativa");

    await page.getByPlaceholder("Buscar normativa...").fill(NUMERO);
    await expect(page.locator("tbody tr", { hasText: TITULO })).toHaveCount(1);
  });

  test("eliminar normativa con confirmación", async ({ page }) => {
    await page.goto("/admin/normativa");
    await page.getByPlaceholder("Buscar normativa...").fill(NUMERO);
    const row = page.locator("tbody tr", { hasText: TITULO });
    await expect(row).toHaveCount(1);
    await row.getByRole("button", { name: "Eliminar" }).click();
    await expect(page.getByText(/¿Seguro que deseas eliminar/i)).toBeVisible();
    await confirmarEliminacion(page, "Eliminar normativa");
    await expect(page.locator("tbody tr", { hasText: TITULO })).toHaveCount(0);
  });

  test.afterAll(async ({ browser }) => {
    const ctx = await browser.newContext({ baseURL: "http://localhost:3100" });
    const page = await ctx.newPage();
    await loginAs(page, "admin");
    await page.goto("/admin/normativa");
    await page.getByPlaceholder("Buscar normativa...").fill("E2E-");
    let left = await page.locator("tbody tr", { hasText: "E2E-" }).count();
    let guard = 0;
    while (left > 0 && guard < 10) {
      const row = page.locator("tbody tr", { hasText: "E2E-" }).first();
      await row.getByRole("button", { name: "Eliminar" }).click();
      await confirmarEliminacion(page, "Eliminar normativa");
      await expect
        .poll(() => page.locator("tbody tr", { hasText: "E2E-" }).count(), {
          timeout: 15_000,
        })
        .toBeLessThan(left);
      left = await page.locator("tbody tr", { hasText: "E2E-" }).count();
      guard += 1;
    }
    await ctx.close();
  });
});