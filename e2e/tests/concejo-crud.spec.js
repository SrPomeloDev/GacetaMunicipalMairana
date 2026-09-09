const { test, expect } = require("@playwright/test");
const { loginAs, confirmarEliminacion } = require("../helpers/actions");

const TS = Date.now();
const NUMERO = `E2E-${TS}`;
const CONCEJAL = `Concejal E2E ${TS}`;
const COMISION = `Comisión E2E ${TS}`;

test.describe("CRUD de concejo — sesiones y comisiones (admin)", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await loginAs(page, "admin");
  });

  test("crear sesión y verla en la lista", async ({ page }) => {
    await page.goto("/admin/concejo/sesiones/nueva");
    await expect(page.getByRole("heading", { name: "Nueva Sesión" })).toBeVisible();
    await page.fill('input[name="numero_sesion"]', NUMERO);
    await page.fill('input[name="fecha"]', "2026-10-01");
    await page.fill('textarea[name="agenda"]', `Agenda E2E ${TS}`);
    await page.getByRole("button", { name: "Crear Sesión" }).click();
    await page.waitForURL("**/admin/concejo");

    const row = page.locator("tbody tr", { hasText: NUMERO });
    await expect(row).toHaveCount(1);
  });

  test("crear concejal y comisión asociada", async ({ page }) => {
    await page.goto("/admin/autoridades/nueva");
    await expect(page.getByRole("heading", { name: "Nueva Autoridad" })).toBeVisible();
    await page.fill('input[name="nombre_completo"]', CONCEJAL);
    await page.fill('input[name="cargo"]', "Concejal E2E");
    await page.getByRole("button", { name: "Crear Autoridad" }).click();
    await page.waitForURL("**/admin/autoridades");

    await page.goto("/admin/concejo/comisiones/nueva");
    await expect(page.getByRole("heading", { name: "Nueva Comisión" })).toBeVisible();
    await page.locator('select[name="autoridad_id"]').selectOption({ label: CONCEJAL });
    await page.fill('input[name="comision"]', COMISION);
    await page.locator('select[name="cargo_comision"]').selectOption("presidente");
    await page.getByRole("button", { name: "Crear Comisión" }).click();
    await page.waitForURL("**/admin/concejo/comisiones");

    const row = page.locator("tbody tr", { hasText: COMISION });
    await expect(row).toHaveCount(1);
    await expect(row).toContainText(CONCEJAL);
  });

  test("editar sesión", async ({ page }) => {
    await page.goto("/admin/concejo");
    const row = page.locator("tbody tr", { hasText: NUMERO });
    await expect(row).toHaveCount(1);
    await row.getByRole("link", { name: "Editar" }).click();

    await expect(page.getByRole("heading", { name: "Editar Sesión" })).toBeVisible();
    await page.fill('textarea[name="agenda"]', `Agenda editada E2E ${TS}`);
    await page.getByRole("button", { name: "Guardar Cambios" }).click();
    await page.waitForURL("**/admin/concejo");

    await expect(page.locator("tbody tr", { hasText: NUMERO })).toHaveCount(1);
  });

  test("eliminar comisión, sesión y concejal con confirmación", async ({ page }) => {
    await page.goto("/admin/concejo/comisiones");
    const comRow = page.locator("tbody tr", { hasText: COMISION });
    await expect(comRow).toHaveCount(1);
    await comRow.getByRole("button", { name: "Eliminar" }).click();
    await confirmarEliminacion(page, "Eliminar comisión");
    await expect(page.locator("tbody tr", { hasText: COMISION })).toHaveCount(0);

    await page.goto("/admin/concejo");
    const sesRow = page.locator("tbody tr", { hasText: NUMERO });
    await expect(sesRow).toHaveCount(1);
    await sesRow.getByRole("button", { name: "Eliminar" }).click();
    await confirmarEliminacion(page, "Eliminar sesión");
    await expect(page.locator("tbody tr", { hasText: NUMERO })).toHaveCount(0);

    await page.goto("/admin/autoridades");
    await page.getByPlaceholder("Buscar autoridad...").fill(CONCEJAL);
    const autRow = page.locator("tbody tr", { hasText: CONCEJAL });
    await expect(autRow).toHaveCount(1);
    await autRow.getByRole("button", { name: "Eliminar" }).click();
    await confirmarEliminacion(page, "Eliminar autoridad");
    await expect(page.locator("tbody tr", { hasText: CONCEJAL })).toHaveCount(0);
  });

  test.afterAll(async ({ browser }) => {
    const ctx = await browser.newContext({ baseURL: "http://localhost:3100" });
    const page = await ctx.newPage();
    await loginAs(page, "admin");

    await page.goto("/admin/concejo/comisiones");
    let guard = 0;
    while ((await page.locator("tbody tr", { hasText: "E2E" }).count()) > 0 && guard < 5) {
      await page.locator("tbody tr", { hasText: "E2E" }).first().getByRole("button", { name: "Eliminar" }).click();
      await confirmarEliminacion(page, "Eliminar comisión");
      guard += 1;
    }

    await page.goto("/admin/concejo");
    guard = 0;
    while ((await page.locator("tbody tr", { hasText: "E2E" }).count()) > 0 && guard < 5) {
      await page.locator("tbody tr", { hasText: "E2E" }).first().getByRole("button", { name: "Eliminar" }).click();
      await confirmarEliminacion(page, "Eliminar sesión");
      guard += 1;
    }

    await page.goto("/admin/autoridades");
    await page.getByPlaceholder("Buscar autoridad...").fill("E2E");
    guard = 0;
    while ((await page.locator("tbody tr", { hasText: "E2E" }).count()) > 0 && guard < 5) {
      await page.locator("tbody tr", { hasText: "E2E" }).first().getByRole("button", { name: "Eliminar" }).click();
      await confirmarEliminacion(page, "Eliminar autoridad");
      guard += 1;
    }
    await ctx.close();
  });
});
