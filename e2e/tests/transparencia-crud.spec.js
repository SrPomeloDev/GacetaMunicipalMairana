const fs = require("fs");
const path = require("path");
const { test, expect } = require("@playwright/test");
const { loginAs, confirmarEliminacion } = require("../helpers/actions");

const TS = Date.now();
const TITULO = `Documento E2E ${TS}`;

function fixturePdf() {
  const dir = path.join(__dirname, "..", "test-results", "fixtures");
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `e2e-${TS}.pdf`);
  if (!fs.existsSync(file)) {
    fs.writeFileSync(
      file,
      "%PDF-1.4\n%E2E fixture para tests de carga de documentos\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\ntrailer<</Root 1 0 R>>\n"
    );
  }
  return file;
}

async function buscar(page, texto) {
  await page.getByPlaceholder("Buscar documentos...").fill(texto);
  await page.waitForTimeout(600);
}

test.describe("CRUD de transparencia (admin)", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await loginAs(page, "admin");
  });

  test("crear documento y verlo en la lista", async ({ page }) => {
    await page.goto("/admin/transparencia/nueva");
    await expect(page.getByRole("heading", { name: "Nuevo Documento" })).toBeVisible();
    await page.getByPlaceholder("Ej: Presupuesto General 2026").fill(TITULO);
    await page.locator('input[type="file"]').setInputFiles(fixturePdf());
    await expect(page.getByRole("link", { name: "Ver archivo" })).toBeVisible();
    await page.getByRole("button", { name: "Guardar Documento" }).click();
    await page.waitForURL("**/admin/transparencia");

    await buscar(page, TITULO);
    const row = page.locator("tbody tr", { hasText: TITULO });
    await expect(row).toHaveCount(1);
    await expect(row.getByRole("button", { name: "Sí" })).toBeVisible();
  });

  test("toggle publicado", async ({ page }) => {
    await page.goto("/admin/transparencia");
    await buscar(page, TITULO);
    const row = page.locator("tbody tr", { hasText: TITULO });
    await expect(row).toHaveCount(1);

    await row.getByRole("button", { name: "Sí" }).click();
    await expect(row.getByRole("button", { name: "No" })).toBeVisible();

    await row.getByRole("button", { name: "No" }).click();
    await expect(row.getByRole("button", { name: "Sí" })).toBeVisible();
  });

  test("editar documento", async ({ page }) => {
    await page.goto("/admin/transparencia");
    await buscar(page, TITULO);
    const row = page.locator("tbody tr", { hasText: TITULO });
    await expect(row).toHaveCount(1);
    await row.getByTitle("Editar").click();

    await expect(page.getByRole("heading", { name: "Editar Documento" })).toBeVisible();
    await page.getByRole("button", { name: "Guardar Cambios" }).click();
    await page.waitForURL("**/admin/transparencia");

    await buscar(page, TITULO);
    await expect(page.locator("tbody tr", { hasText: TITULO })).toHaveCount(1);
  });

  test("eliminar documento con confirmación", async ({ page }) => {
    await page.goto("/admin/transparencia");
    await buscar(page, TITULO);
    const row = page.locator("tbody tr", { hasText: TITULO });
    await expect(row).toHaveCount(1);
    await row.getByTitle("Eliminar").click();
    await expect(page.getByRole("heading", { name: "Eliminar documento" })).toBeVisible();
    await confirmarEliminacion(page, "Eliminar documento");
    await expect(page.locator("tbody tr", { hasText: TITULO })).toHaveCount(0);
  });

  test.afterAll(async ({ browser }) => {
    const ctx = await browser.newContext({ baseURL: "http://localhost:3100" });
    const page = await ctx.newPage();
    await loginAs(page, "admin");
    await page.goto("/admin/transparencia");
    await buscar(page, "E2E");
    let guard = 0;
    while ((await page.locator("tbody tr", { hasText: "E2E" }).count()) > 0 && guard < 10) {
      await page.locator("tbody tr", { hasText: "E2E" }).first().getByTitle("Eliminar").click();
      await confirmarEliminacion(page, "Eliminar documento");
      guard += 1;
    }
    await ctx.close();
  });
});
