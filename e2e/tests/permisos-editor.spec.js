const { test, expect } = require("@playwright/test");
const { loginAs, confirmarEliminacion } = require("../helpers/actions");

const TS = Date.now();
const NUMERO = `E2E-${TS}`;
const NUMERO_APROBADA = `${NUMERO}-A`;
const TITULO = `Normativa editor E2E ${TS}`;

function fila(page, titulo) {
  return page.locator("tbody tr", { hasText: titulo });
}

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

  test("puede crear y eliminar sus propios borradores", async ({ page }) => {
    await page.goto("/admin/normativa/nueva");
    await expect(page.getByRole("heading", { name: "Nueva Normativa" })).toBeVisible();
    await page.fill('input[name="numero"]', NUMERO);
    await page.fill('input[name="titulo"]', TITULO);
    await page.getByRole("button", { name: "Crear Normativa" }).click();
    await page.waitForURL("**/admin/normativa");

    await page.getByPlaceholder("Buscar normativa...").fill(NUMERO);
    const row = fila(page, TITULO);
    await expect(row).toHaveCount(1);
    await expect(row).toContainText("Pendiente");

    await row.getByRole("button", { name: "Eliminar" }).click();
    await confirmarEliminacion(page, "Eliminar normativa");
    await expect(row).toHaveCount(0);
  });

  test("no puede eliminar normativa ya aprobada", async ({ page, browser }) => {
    await page.goto("/admin/normativa/nueva");
    await page.fill('input[name="numero"]', NUMERO_APROBADA);
    await page.fill('input[name="titulo"]', TITULO);
    await page.getByRole("button", { name: "Crear Normativa" }).click();
    await page.waitForURL("**/admin/normativa");

    await page.getByPlaceholder("Buscar normativa...").fill(NUMERO_APROBADA);
    const row = fila(page, TITULO);
    await expect(row).toHaveCount(1);
    const href = await row.getByRole("link", { name: "Editar" }).getAttribute("href");
    expect(href).toBeTruthy();

    const ctx = await browser.newContext({ baseURL: "http://localhost:3100" });
    const adminPage = await ctx.newPage();
    await loginAs(adminPage, "admin");
    await adminPage.goto(href);
    await adminPage.getByRole("button", { name: "Aprobar y publicar" }).click();
    await expect(adminPage.getByText("Aprobada y publicada", { exact: true })).toBeVisible();
    await ctx.close();

    await page.goto("/admin/normativa");
    await page.getByPlaceholder("Buscar normativa...").fill(NUMERO_APROBADA);
    await expect(row).toHaveCount(1);
    await expect(row).toContainText("Aprobada");
    await expect(row.getByRole("button", { name: "Eliminar" })).toHaveCount(0);
  });

  test.afterAll(async ({ browser }) => {
    const ctx = await browser.newContext({ baseURL: "http://localhost:3100" });
    const page = await ctx.newPage();
    await loginAs(page, "admin");
    for (const numero of [NUMERO, NUMERO_APROBADA]) {
      await page.goto("/admin/normativa");
      await page.getByPlaceholder("Buscar normativa...").fill(numero);
      const row = fila(page, TITULO);
      if ((await row.count()) === 1) {
        await row.getByRole("button", { name: "Eliminar" }).click();
        await confirmarEliminacion(page, "Eliminar normativa");
        await expect(row).toHaveCount(0);
      }
    }
    await ctx.close();
  });
});
