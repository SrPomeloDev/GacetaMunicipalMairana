const { test, expect } = require("@playwright/test");
const { loginAs, confirmarEliminacion } = require("../helpers/actions");

const TS = Date.now();
const NOMBRE = `Dependencia E2E ${TS}`;

test.describe("CRUD de dependencias (admin)", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await loginAs(page, "admin");
  });

  test("crear dependencia y verla en la lista", async ({ page }) => {
    await page.goto("/admin/dependencias/nueva");
    await expect(page.getByRole("heading", { name: "Nueva Dependencia" })).toBeVisible();
    await page.fill('input[name="nombre"]', NOMBRE);
    await page.getByRole("button", { name: "Crear Dependencia" }).click();
    await page.waitForURL("**/admin/dependencias");

    await page.getByPlaceholder("Buscar dependencia...").fill(NOMBRE);
    const row = page.locator("tbody tr", { hasText: NOMBRE });
    await expect(row).toHaveCount(1);
  });

  test("editar dependencia", async ({ page }) => {
    await page.goto("/admin/dependencias");
    await page.getByPlaceholder("Buscar dependencia...").fill(NOMBRE);
    const row = page.locator("tbody tr", { hasText: NOMBRE });
    await expect(row).toHaveCount(1);
    await row.getByRole("link", { name: "Editar" }).click();

    await expect(page.getByRole("heading", { name: "Editar Dependencia" })).toBeVisible();
    await page.fill('input[name="telefono"]', "70000001");
    await page.getByRole("button", { name: "Guardar Cambios" }).click();
    await page.waitForURL("**/admin/dependencias");

    await page.getByPlaceholder("Buscar dependencia...").fill(NOMBRE);
    await expect(page.locator("tbody tr", { hasText: NOMBRE })).toHaveCount(1);
  });

  test("eliminar dependencia con confirmación", async ({ page }) => {
    await page.goto("/admin/dependencias");
    await page.getByPlaceholder("Buscar dependencia...").fill(NOMBRE);
    const row = page.locator("tbody tr", { hasText: NOMBRE });
    await expect(row).toHaveCount(1);
    await row.getByRole("button", { name: "Eliminar" }).click();
    await expect(page.getByText(/¿Seguro que deseas eliminar/i)).toBeVisible();
    await confirmarEliminacion(page, "Eliminar dependencia");
    await expect(page.locator("tbody tr", { hasText: NOMBRE })).toHaveCount(0);
  });

  test.afterAll(async ({ browser }) => {
    const ctx = await browser.newContext({ baseURL: "http://localhost:3100" });
    const page = await ctx.newPage();
    await loginAs(page, "admin");
    await page.goto("/admin/dependencias");
    await page.getByPlaceholder("Buscar dependencia...").fill("E2E");
    let guard = 0;
    while ((await page.locator("tbody tr", { hasText: "E2E" }).count()) > 0 && guard < 10) {
      await page.locator("tbody tr", { hasText: "E2E" }).first().getByRole("button", { name: "Eliminar" }).click();
      await confirmarEliminacion(page, "Eliminar dependencia");
      guard += 1;
    }
    await ctx.close();
  });
});
