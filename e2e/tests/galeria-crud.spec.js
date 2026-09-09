const fs = require("fs");
const path = require("path");
const { test, expect } = require("@playwright/test");
const { loginAs, confirmarEliminacion } = require("../helpers/actions");

const TS = Date.now();
const TITULO = `Foto E2E ${TS}`;

// PNG mínimo de 1x1 generado en tiempo de test (no se commitea)
const PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

function fixtureImage() {
  const dir = path.join(__dirname, "..", "test-results", "fixtures");
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `e2e-${TS}.png`);
  if (!fs.existsSync(file)) fs.writeFileSync(file, Buffer.from(PNG_BASE64, "base64"));
  return file;
}

test.describe("CRUD de galería (admin)", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await loginAs(page, "admin");
  });

  test("subir imagen y verla en la grilla", async ({ page }) => {
    await page.goto("/admin/galeria/nueva");
    await expect(page.getByRole("heading", { name: "Nueva Imagen" })).toBeVisible();
    await page.locator("#titulo").fill(TITULO);
    await page.locator('input[type="file"]').setInputFiles(fixtureImage());
    await expect(page.getByRole("link", { name: "Ver archivo" })).toBeVisible();
    await page.getByRole("button", { name: "Guardar Imagen" }).click();
    await page.waitForURL("**/admin/galeria");

    await expect(page.getByRole("heading", { level: 3, name: TITULO })).toBeVisible();
  });

  test("editar imagen", async ({ page }) => {
    await page.goto("/admin/galeria");
    const card = page.locator("div.rounded-xl", {
      has: page.getByRole("heading", { level: 3, name: TITULO }),
    });
    await expect(card).toHaveCount(1);
    await card.getByRole("link").first().click();

    await expect(page.getByRole("heading", { name: "Editar Imagen" })).toBeVisible();
    await page.getByRole("button", { name: "Guardar Cambios" }).click();
    await page.waitForURL("**/admin/galeria");
    await expect(page.getByRole("heading", { level: 3, name: TITULO })).toBeVisible();
  });

  test("eliminar imagen con confirmación", async ({ page }) => {
    await page.goto("/admin/galeria");
    const card = page.locator("div.rounded-xl", {
      has: page.getByRole("heading", { level: 3, name: TITULO }),
    });
    await expect(card).toHaveCount(1);
    await card.getByRole("button", { name: "Eliminar" }).click();
    await expect(page.getByText(/¿Seguro que deseas eliminar/i)).toBeVisible();
    await confirmarEliminacion(page, "Eliminar imagen");
    await expect(page.getByRole("heading", { level: 3, name: TITULO })).toHaveCount(0);
  });

  test.afterAll(async ({ browser }) => {
    const ctx = await browser.newContext({ baseURL: "http://localhost:3100" });
    const page = await ctx.newPage();
    await loginAs(page, "admin");
    await page.goto("/admin/galeria");
    let guard = 0;
    while (
      (await page.getByRole("heading", { level: 3, name: "E2E" }).count()) > 0 &&
      guard < 10
    ) {
      const card = page.locator("div.rounded-xl", {
        has: page.getByRole("heading", { level: 3, name: "E2E" }),
      }).first();
      await card.getByRole("button", { name: "Eliminar" }).click();
      await confirmarEliminacion(page, "Eliminar imagen");
      guard += 1;
    }
    await ctx.close();
  });
});
