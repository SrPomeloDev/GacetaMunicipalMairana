const { test, expect } = require("@playwright/test");
const { loginAs, confirmarEliminacion } = require("../helpers/actions");

const TS = Date.now();
const TITULO = `NoticiaFB E2E ${TS}`;
const FB_URL = "https://www.facebook.com/gammariana/posts/1234567890";

test.describe("Noticias de Facebook (admin + público)", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await loginAs(page, "admin");
  });

  test("crear noticia con link y ver embed en la web", async ({ page }) => {
    await page.goto("/admin/noticias/nueva");
    await expect(page.getByRole("heading", { name: "Nueva Noticia" })).toBeVisible();
    await page.fill('input[name="titulo"]', TITULO);
    await page.fill('textarea[name="resumen"]', `Resumen FB E2E ${TS}`);
    await page.getByPlaceholder("https://www.facebook.com/.../posts/...").fill(FB_URL);
    await page.getByRole("button", { name: "Crear Noticia" }).click();
    await page.waitForURL("**/admin/noticias");

    await page.getByPlaceholder("Buscar noticia...").fill(TITULO);
    const row = page.locator("tbody tr", { hasText: TITULO });
    await expect(row).toHaveCount(1);
    await row.getByRole("link", { name: "Editar" }).click();
    await expect(page.locator('input[name="facebook_url"]')).toHaveValue(FB_URL);
    await page.getByRole("button", { name: "Guardar Cambios" }).click();
    await page.waitForURL("**/admin/noticias");

    // publicar para verla en la web
    await page.getByPlaceholder("Buscar noticia...").fill(TITULO);
    const row2 = page.locator("tbody tr", { hasText: TITULO });
    await row2.getByRole("button", { name: "Borrador" }).click();
    await expect(row2.getByRole("button", { name: "Publicada" })).toBeVisible();
  });

  test("la lista pública muestra badge Facebook y la ficha el embed", async ({ page }) => {
    await page.goto("/noticias");
    const card = page.locator("div", { hasText: TITULO }).filter({ hasText: "Facebook" }).first();
    await expect(card).toBeVisible();

    await page.getByRole("heading", { name: TITULO }).click();
    await expect(page).toHaveURL(/\/noticias\/.+/);
    const frame = page.locator('iframe[title^="Publicación de Facebook"]');
    await expect(frame).toBeVisible();
    await expect(frame).toHaveAttribute(
      "src",
      `https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(FB_URL)}&show_text=true&width=500`
    );
    const original = page.getByRole("link", { name: "Ver original en Facebook" });
    await expect(original).toHaveAttribute("href", FB_URL);
    await expect(original).toHaveAttribute("target", "_blank");
  });

  test("eliminar noticia de Facebook con confirmación", async ({ page }) => {
    await page.goto("/admin/noticias");
    await page.getByPlaceholder("Buscar noticia...").fill(TITULO);
    const row = page.locator("tbody tr", { hasText: TITULO });
    await expect(row).toHaveCount(1);
    await row.getByRole("button", { name: "Eliminar" }).click();
    await confirmarEliminacion(page, "Eliminar noticia");
    await expect(page.locator("tbody tr", { hasText: TITULO })).toHaveCount(0);
  });

  test.afterAll(async ({ browser }) => {
    const ctx = await browser.newContext({ baseURL: "http://localhost:3100" });
    const page = await ctx.newPage();
    await loginAs(page, "admin");
    await page.goto("/admin/noticias");
    await page.getByPlaceholder("Buscar noticia...").fill("E2E");
    let guard = 0;
    while ((await page.locator("tbody tr", { hasText: "E2E" }).count()) > 0 && guard < 10) {
      await page.locator("tbody tr", { hasText: "E2E" }).first().getByRole("button", { name: "Eliminar" }).click();
      await confirmarEliminacion(page, "Eliminar noticia");
      guard += 1;
    }
    await ctx.close();
  });
});
