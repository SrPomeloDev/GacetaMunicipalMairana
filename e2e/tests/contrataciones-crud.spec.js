const { test, expect } = require("@playwright/test");
const { loginAs, confirmarEliminacion } = require("../helpers/actions");

const TS = Date.now();
const TITULO = `Contratación E2E ${TS}`;

test.describe("CRUD de contrataciones (admin)", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await loginAs(page, "admin");
  });

  test("crear contratación y verla en la lista", async ({ page }) => {
    await page.goto("/admin/contrataciones/nueva");
    await expect(page.getByRole("heading", { name: "Nueva Contratación" })).toBeVisible();
    await page.fill('input[name="titulo"]', TITULO);
    await page.fill('input[name="monto"]', "150000");
    await page.getByRole("button", { name: "Crear Contratación" }).click();
    await page.waitForURL("**/admin/contrataciones");

    const row = page.locator("tbody tr", { hasText: TITULO });
    await expect(row).toHaveCount(1);
    await expect(row).toContainText("Pública");
  });

  test("editar contratación", async ({ page }) => {
    await page.goto("/admin/contrataciones");
    const row = page.locator("tbody tr", { hasText: TITULO });
    await expect(row).toHaveCount(1);
    await row.getByRole("link", { name: "Editar" }).click();

    await expect(page.getByRole("heading", { name: "Editar Contratación" })).toBeVisible();
    await page.fill('input[name="monto"]', "175000");
    await page.getByRole("button", { name: "Guardar Cambios" }).click();
    await page.waitForURL("**/admin/contrataciones");

    await expect(page.locator("tbody tr", { hasText: TITULO })).toHaveCount(1);
  });

  test("eliminar contratación con confirmación", async ({ page }) => {
    await page.goto("/admin/contrataciones");
    const row = page.locator("tbody tr", { hasText: TITULO });
    await expect(row).toHaveCount(1);
    await row.getByRole("button", { name: "Eliminar" }).click();
    await expect(page.getByText(/¿Seguro que deseas eliminar/i)).toBeVisible();
    await confirmarEliminacion(page, "Eliminar contratación");
    await expect(page.locator("tbody tr", { hasText: TITULO })).toHaveCount(0);
  });

  test.afterAll(async ({ browser }) => {
    const ctx = await browser.newContext({ baseURL: "http://localhost:3100" });
    const page = await ctx.newPage();
    await loginAs(page, "admin");
    await page.goto("/admin/contrataciones");
    let guard = 0;
    while ((await page.locator("tbody tr", { hasText: "E2E" }).count()) > 0 && guard < 10) {
      await page.locator("tbody tr", { hasText: "E2E" }).first().getByRole("button", { name: "Eliminar" }).click();
      await confirmarEliminacion(page, "Eliminar contratación");
      guard += 1;
    }
    await ctx.close();
  });
});
