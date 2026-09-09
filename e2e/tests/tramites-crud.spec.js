const { test, expect } = require("@playwright/test");
const { loginAs, confirmarEliminacion } = require("../helpers/actions");

const TS = Date.now();
const TITULO = `Trámite E2E ${TS}`;

test.describe("CRUD de trámites (admin)", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await loginAs(page, "admin");
  });

  test("crear trámite y verlo en la lista", async ({ page }) => {
    await page.goto("/admin/tramites/nueva");
    await expect(page.getByRole("heading", { name: "Nuevo Trámite" })).toBeVisible();
    await page.getByPlaceholder("Nombre del trámite").fill(TITULO);
    await page.getByPlaceholder("Descripción del trámite").fill(`Descripción E2E ${TS}`);
    await page.getByRole("button", { name: "Guardar Trámite" }).click();
    await page.waitForURL("**/admin/tramites");

    await page.getByPlaceholder("Buscar trámites...").fill(TITULO);
    const row = page.locator("tbody tr", { hasText: TITULO });
    await expect(row).toHaveCount(1);
    await expect(row.getByRole("button", { name: "Activo" })).toBeVisible();
  });

  test("editar trámite", async ({ page }) => {
    await page.goto("/admin/tramites");
    await page.getByPlaceholder("Buscar trámites...").fill(TITULO);
    const row = page.locator("tbody tr", { hasText: TITULO });
    await expect(row).toHaveCount(1);
    await row.getByTitle("Editar").click();

    await expect(page.getByRole("heading", { name: "Editar Trámite" })).toBeVisible();
    const tiempo = page
      .locator("div.space-y-2", { hasText: "Tiempo Estimado" })
      .last()
      .locator("input");
    await tiempo.fill("9 días hábiles E2E");
    await page.getByRole("button", { name: "Guardar Cambios" }).click();
    await page.waitForURL("**/admin/tramites");

    await page.getByPlaceholder("Buscar trámites...").fill(TITULO);
    const row2 = page.locator("tbody tr", { hasText: TITULO });
    await expect(row2).toHaveCount(1);
    await expect(row2).toContainText("9 días hábiles E2E");
  });

  test("eliminar trámite con confirmación", async ({ page }) => {
    await page.goto("/admin/tramites");
    await page.getByPlaceholder("Buscar trámites...").fill(TITULO);
    const row = page.locator("tbody tr", { hasText: TITULO });
    await expect(row).toHaveCount(1);
    await row.getByTitle("Eliminar").click();
    await expect(page.getByText(/¿Seguro que deseas eliminar/i)).toBeVisible();
    await confirmarEliminacion(page, "Eliminar trámite");
    await expect(page.locator("tbody tr", { hasText: TITULO })).toHaveCount(0);
  });

  test.afterAll(async ({ browser }) => {
    const ctx = await browser.newContext({ baseURL: "http://localhost:3100" });
    const page = await ctx.newPage();
    await loginAs(page, "admin");
    await page.goto("/admin/tramites");
    await page.getByPlaceholder("Buscar trámites...").fill("E2E");
    let guard = 0;
    while ((await page.locator("tbody tr", { hasText: "E2E" }).count()) > 0 && guard < 10) {
      await page.locator("tbody tr", { hasText: "E2E" }).first().getByTitle("Eliminar").click();
      await confirmarEliminacion(page, "Eliminar trámite");
      guard += 1;
    }
    await ctx.close();
  });
});
