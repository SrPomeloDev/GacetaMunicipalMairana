const { test, expect } = require("@playwright/test");

const PUBLIC_ROUTES = [
  { path: "/", heading: "Portal Municipal de Mairana" },
  { path: "/gaceta", heading: "Gaceta Municipal Oficial" },
  { path: "/noticias", heading: "Noticias del Municipio" },
  { path: "/autoridades", heading: "Autoridades Municipales" },
  { path: "/transparencia", heading: "Transparencia Municipal" },
  { path: "/tramites", heading: "Trámites Municipales" },
  { path: "/galeria", heading: "Galería Municipal" },
  { path: "/contacto", heading: "Contacto" },
  { path: "/asistente", heading: "Asistente Virtual" },
  { path: "/contrataciones", heading: "Contrataciones Públicas" },
  { path: "/concejo-municipal", heading: "Concejo Municipal" },
  { path: "/organo-ejecutivo", heading: "Órgano Ejecutivo" },
];

test.describe("Portal público", () => {
  for (const r of PUBLIC_ROUTES) {
    test(`${r.path} muestra su encabezado`, async ({ page }) => {
      await page.goto(r.path);
      await expect(
        page.getByRole("heading", { level: 1, name: r.heading })
      ).toBeVisible();
    });
  }

  test("home: el CTA del hero lleva a la Gaceta Oficial", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Consultar Gaceta Oficial" }).click();
    await expect(page).toHaveURL(/\/gaceta/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Gaceta Municipal Oficial" })
    ).toBeVisible();
  });

  test("gaceta: el buscador filtra normativas", async ({ page }) => {
    await page.goto("/gaceta");
    const search = page.locator('input[placeholder*="Buscar por Ley"]');
    await expect(search).toBeVisible();
    await search.fill("ordenanza");
    await expect(search).toHaveValue("ordenanza");
  });

  test("header: acceso funcionarios lleva al login", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Gaceta Municipal" })).toBeVisible();
    await page.getByRole("link", { name: "Acceso Funcionarios" }).click();
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});