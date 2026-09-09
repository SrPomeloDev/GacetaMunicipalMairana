const { test, expect } = require("@playwright/test");
const { loginAs, confirmarEliminacion } = require("../helpers/actions");

const TS = Date.now();
const NOMBRE = `Autoridad E2E ${TS}`;
const CARGO = `Cargo E2E ${TS}`;
// el admin normaliza nombre/cargo a Título español al guardar (E2E → E2e)
const CARGO_NORM = `Cargo E2e ${TS}`;

test.describe("CRUD de autoridades (admin)", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await loginAs(page, "admin");
  });

  test("crear autoridad y verla en la lista", async ({ page }) => {
    await page.goto("/admin/autoridades/nueva");
    await expect(page.getByRole("heading", { name: "Nueva Autoridad" })).toBeVisible();
    await page.fill('input[name="nombre_completo"]', NOMBRE);
    await page.fill('input[name="cargo"]', CARGO);
    await page.getByRole("button", { name: "Crear Autoridad" }).click();
    await page.waitForURL("**/admin/autoridades");

    await page.getByPlaceholder("Buscar autoridad...").fill(NOMBRE);
    const row = page.locator("tbody tr", { hasText: NOMBRE });
    await expect(row).toHaveCount(1);
    await expect(row).toContainText(CARGO_NORM);
    await expect(row.getByRole("button", { name: "Activo" })).toBeVisible();
  });

  test("toggle activo/inactivo", async ({ page }) => {
    await page.goto("/admin/autoridades");
    await page.getByPlaceholder("Buscar autoridad...").fill(NOMBRE);
    const row = page.locator("tbody tr", { hasText: NOMBRE });
    await expect(row).toHaveCount(1);

    await row.getByRole("button", { name: "Activo" }).click();
    await expect(row.getByRole("button", { name: "Inactivo" })).toBeVisible();

    await row.getByRole("button", { name: "Inactivo" }).click();
    await expect(row.getByRole("button", { name: "Activo" })).toBeVisible();
  });

  test("editar autoridad", async ({ page }) => {
    await page.goto("/admin/autoridades");
    await page.getByPlaceholder("Buscar autoridad...").fill(NOMBRE);
    const row = page.locator("tbody tr", { hasText: NOMBRE });
    await expect(row).toHaveCount(1);
    await row.getByRole("link", { name: "Editar" }).click();

    await expect(page.getByRole("heading", { name: "Editar Autoridad" })).toBeVisible();
    await page.fill('input[name="cargo"]', `${CARGO} editado`);
    await page.getByRole("button", { name: "Guardar Cambios" }).click();
    await page.waitForURL("**/admin/autoridades");

    await page.getByPlaceholder("Buscar autoridad...").fill(NOMBRE);
    await expect(page.locator("tbody tr", { hasText: NOMBRE })).toHaveCount(1);
  });

  test("eliminar autoridad con confirmación", async ({ page }) => {
    await page.goto("/admin/autoridades");
    await page.getByPlaceholder("Buscar autoridad...").fill(NOMBRE);
    const row = page.locator("tbody tr", { hasText: NOMBRE });
    await expect(row).toHaveCount(1);
    await row.getByRole("button", { name: "Eliminar" }).click();
    await expect(page.getByText(/¿Seguro que deseas eliminar/i)).toBeVisible();
    await confirmarEliminacion(page, "Eliminar autoridad");
    await expect(page.locator("tbody tr", { hasText: NOMBRE })).toHaveCount(0);
  });

  test.afterAll(async ({ browser }) => {
    const ctx = await browser.newContext({ baseURL: "http://localhost:3100" });
    const page = await ctx.newPage();
    await loginAs(page, "admin");
    await page.goto("/admin/autoridades");
    await page.getByPlaceholder("Buscar autoridad...").fill("E2E");
    let guard = 0;
    while ((await page.locator("tbody tr", { hasText: "E2E" }).count()) > 0 && guard < 10) {
      await page.locator("tbody tr", { hasText: "E2E" }).first().getByRole("button", { name: "Eliminar" }).click();
      await confirmarEliminacion(page, "Eliminar autoridad");
      guard += 1;
    }
    await ctx.close();
  });
});
