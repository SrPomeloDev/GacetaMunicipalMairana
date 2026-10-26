const { test, expect } = require("@playwright/test");
const { loginAs, confirmarEliminacion } = require("../helpers/actions");

const TS = Date.now();
const NUMERO = `E2E-APR-${TS}`;
const TITULO = `Normativa aprobaciones E2E ${TS}`;
const BASE = "http://localhost:3100";

function fila(page, titulo) {
  return page.locator("tbody tr", { hasText: titulo });
}

function tarjetaPendiente(page, titulo) {
  return page
    .locator("div.rounded-xl.border")
    .filter({ has: page.getByRole("link", { name: titulo }) })
    .first();
}

test.describe("Aprobaciones — solo admin", () => {
  test("el admin ve Aprobaciones en el sidebar y la bandeja con pestañas", async ({ page }) => {
    await loginAs(page, "admin");
    const nav = page.locator("aside nav");
    await expect(nav.getByRole("link", { name: "Aprobaciones" })).toHaveCount(1);

    await nav.getByRole("link", { name: "Aprobaciones" }).click();
    await page.waitForURL("**/admin/aprobaciones");
    await expect(page.getByRole("heading", { name: "Aprobaciones" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Pendientes/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Rechazadas/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Aprobadas/ })).toBeVisible();
  });

  test("el editor no ve Aprobaciones (sidebar ni Ctrl+K) y la URL muestra la restricción", async ({ page }) => {
    await loginAs(page, "editor");
    const nav = page.locator("aside nav");
    await expect(nav.getByRole("link", { name: "Aprobaciones" })).toHaveCount(0);

    await page.keyboard.press("Control+k");
    const dialogo = page.getByRole("dialog", { name: "Paleta de comandos" });
    await expect(dialogo).toBeVisible();
    await dialogo.getByRole("textbox").fill("aprobaciones");
    await expect(dialogo.getByRole("option", { name: /Aprobaciones/i })).toHaveCount(0);
    await page.keyboard.press("Escape");

    await page.goto("/admin/aprobaciones");
    await expect(page.getByText("Solo un administrador puede revisar y aprobar normativa.")).toBeVisible();
    await expect(page.getByRole("button", { name: /Rechazadas/ })).toHaveCount(0);
  });

  test("flujo completo: editor sube, admin aprueba y la normativa se publica", async ({ page, browser }) => {
    await loginAs(page, "editor");
    await page.goto("/admin/normativa/nueva");
    await page.fill('input[name="numero"]', NUMERO);
    await page.fill('input[name="titulo"]', TITULO);
    await page.getByRole("button", { name: "Crear Normativa" }).click();
    await page.waitForURL("**/admin/normativa");

    const ctxAdmin = await browser.newContext({ baseURL: BASE });
    const adminPage = await ctxAdmin.newPage();
    await loginAs(adminPage, "admin");
    await adminPage.goto("/admin/aprobaciones");

    const tarjeta = tarjetaPendiente(adminPage, TITULO);
    await expect(tarjeta).toHaveCount(1);
    await tarjeta.getByRole("button", { name: "Aprobar y publicar" }).click();
    await expect(adminPage.getByText("Normativa aprobada y publicada")).toBeVisible();

    await adminPage.getByRole("button", { name: /Aprobadas/ }).click();
    await expect(tarjetaPendiente(adminPage, TITULO)).toHaveCount(1);

    const ctxPublico = await browser.newContext({ baseURL: BASE });
    const publico = await ctxPublico.newPage();
    await publico.goto(`/normativa?q=${encodeURIComponent(NUMERO)}`);
    await expect(publico.getByText(TITULO).first()).toBeVisible();
    await ctxPublico.close();

    await ctxAdmin.close();

    await page.goto("/admin/normativa");
    await page.getByPlaceholder("Buscar normativa...").fill(NUMERO);
    const row = fila(page, TITULO);
    await expect(row).toHaveCount(1);
    await expect(row).toContainText("Aprobada");
    await expect(row.getByRole("button", { name: "Eliminar" })).toHaveCount(0);
  });

  test.afterAll(async ({ browser }) => {
    const ctx = await browser.newContext({ baseURL: BASE });
    const page = await ctx.newPage();
    await loginAs(page, "admin");
    await page.goto("/admin/normativa");
    await page.getByPlaceholder("Buscar normativa...").fill(NUMERO);
    const row = fila(page, TITULO);
    if ((await row.count()) === 1) {
      await row.getByRole("button", { name: "Eliminar" }).click();
      await confirmarEliminacion(page, "Eliminar normativa");
      await expect(row).toHaveCount(0);
    }
    await ctx.close();
  });
});
