const fs = require("fs");
const path = require("path");
const { test, expect } = require("@playwright/test");
const { loginAs, confirmarEliminacion } = require("../helpers/actions");

const TS = Date.now();
const DOC_PRESUPUESTO = `FiltroPub E2E ${TS}`;
const DOC_POA = `FiltroPoa E2E ${TS}`;

function fixturePdf() {
  const dir = path.join(__dirname, "..", "test-results", "fixtures");
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `e2e-transp-${TS}.pdf`);
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, `%PDF-1.4\n%E2E fixture transparencia ${TS}\n`);
  }
  return file;
}

async function crearDocumento(page, titulo, categoria) {
  await page.goto("/admin/transparencia/nueva");
  await page.getByPlaceholder("Ej: Presupuesto General 2026").fill(titulo);
  if (categoria) await page.locator("select").selectOption(categoria);
  await page.locator('input[type="file"]').setInputFiles(fixturePdf());
  await expect(page.getByRole("link", { name: "Ver archivo" })).toBeVisible();
  await page.getByRole("button", { name: "Guardar Documento" }).click();
  await page.waitForURL("**/admin/transparencia");
}

async function botonActivo(page, nombre) {
  const btn = page.getByRole("button", { name: nombre, exact: true });
  await expect(btn).toBeVisible();
  await expect(btn).toHaveClass(/bg-primary/);
}

function tarjetas(page) {
  return page.locator("div.grid.gap-4 > div", { has: page.getByRole("heading") });
}

test.describe("Filtro ?categoria= en transparencia pública", () => {
  test.beforeAll(async ({ browser }) => {
    const ctx = await browser.newContext({ baseURL: "http://localhost:3100" });
    const page = await ctx.newPage();
    await loginAs(page, "admin");
    await crearDocumento(page, DOC_PRESUPUESTO);
    await crearDocumento(page, DOC_POA, "poa");
    await ctx.close();
  });

  test("?categoria=presupuesto preselecciona Presupuesto y filtra", async ({ page }) => {
    await page.goto("/transparencia?categoria=presupuesto");
    await expect(
      page.getByRole("heading", { level: 1, name: "Transparencia Municipal" })
    ).toBeVisible();
    await botonActivo(page, "Presupuesto");

    const cards = tarjetas(page);
    await expect(cards.filter({ hasText: DOC_PRESUPUESTO })).toHaveCount(1);
    const n = await cards.count();
    expect(n).toBeGreaterThan(0);
    for (let i = 0; i < n; i++) {
      await expect(cards.nth(i)).toContainText("Presupuesto");
    }
  });

  test("?categoria=poa preselecciona POA y filtra", async ({ page }) => {
    await page.goto("/transparencia?categoria=poa");
    await botonActivo(page, "POA");

    const cards = tarjetas(page);
    await expect(cards.filter({ hasText: DOC_POA })).toHaveCount(1);
    const n = await cards.count();
    for (let i = 0; i < n; i++) {
      await expect(cards.nth(i)).toContainText("POA");
    }
  });

  test("sin param queda Todos", async ({ page }) => {
    await page.goto("/transparencia");
    await botonActivo(page, "Todos");
  });

  test("categoría desconocida cae a Todos", async ({ page }) => {
    await page.goto("/transparencia?categoria=inexistente-xyz");
    await botonActivo(page, "Todos");
  });

  test.afterAll(async ({ browser }) => {
    const ctx = await browser.newContext({ baseURL: "http://localhost:3100" });
    const page = await ctx.newPage();
    await loginAs(page, "admin");
    for (const titulo of [DOC_PRESUPUESTO, DOC_POA]) {
      await page.goto("/admin/transparencia");
      await page.getByPlaceholder("Buscar documentos...").fill(titulo);
      await page.waitForTimeout(600);
      if ((await page.locator("tbody tr", { hasText: titulo }).count()) === 1) {
        await page.locator("tbody tr", { hasText: titulo }).getByTitle("Eliminar").click();
        await confirmarEliminacion(page, "Eliminar documento");
      }
    }
    await ctx.close();
  });
});
