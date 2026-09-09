const fs = require("fs");
const path = require("path");
const { test, expect } = require("@playwright/test");
const { loginAs, confirmarEliminacion } = require("../helpers/actions");

const TS = Date.now();

function fixturePdf() {
  const dir = path.join(__dirname, "..", "test-results", "fixtures");
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `e2e-filter-${TS}.pdf`);
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, `%PDF-1.4\n%E2E fixture filtros ${TS}\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\ntrailer<</Root 1 0 R>>\n`);
  }
  return file;
}

// Localiza el <select> nativo que contiene una opción con el texto dado
async function selectConOpcion(page, texto) {
  const selects = page.locator("select");
  const n = await selects.count();
  for (let i = 0; i < n; i++) {
    if ((await selects.nth(i).innerText()).includes(texto)) return selects.nth(i);
  }
  throw new Error(`select con opción "${texto}" no encontrado`);
}

test.describe("Filtros admin inicializados por URL", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await loginAs(page, "admin");
  });

  test("noticias ?publicada=false filtra borradores", async ({ page }) => {
    const titulo = `FiltroNoticia E2E ${TS}`;
    await page.goto("/admin/noticias/nueva");
    await page.fill('input[name="titulo"]', titulo);
    await page.fill('textarea[name="resumen"]', `Resumen filtro ${TS}`);
    await page.getByRole("button", { name: "Crear Noticia" }).click();
    await page.waitForURL("**/admin/noticias");

    await page.goto("/admin/noticias?publicada=false");
    const sel = await selectConOpcion(page, "Borradores");
    await expect(sel).toHaveValue("no");
    await expect(page.locator("tbody tr", { hasText: titulo })).toHaveCount(1);

    await sel.selectOption("si");
    await expect(page.locator("tbody tr", { hasText: titulo })).toHaveCount(0);

    await page.goto("/admin/noticias?publicada=false");
    await expect(page.locator("tbody tr", { hasText: titulo })).toHaveCount(1);

    await page.locator("tbody tr", { hasText: titulo }).getByRole("button", { name: "Eliminar" }).click();
    await confirmarEliminacion(page, "Eliminar noticia");
    await expect(page.locator("tbody tr", { hasText: titulo })).toHaveCount(0);
  });

  test("normativa ?publicada=false discrimina publicada/no publicada", async ({ page }) => {
    const numero = `E2EF-${TS}`;
    const titulo = `FiltroNormativa E2E ${TS}`;
    await page.goto("/admin/normativa/nueva");
    await page.fill('input[name="numero"]', numero);
    await page.fill('input[name="titulo"]', titulo);
    await page.getByRole("button", { name: "Crear Normativa" }).click();
    await page.waitForURL("**/admin/normativa");

    await page.goto("/admin/normativa?publicada=false");
    const sel = await selectConOpcion(page, "No publicadas");
    await expect(sel).toHaveValue("no");
    await page.getByPlaceholder("Buscar normativa...").fill(numero);
    await expect(page.locator("tbody tr", { hasText: titulo })).toHaveCount(1);

    await sel.selectOption("si");
    await expect(page.locator("tbody tr", { hasText: titulo })).toHaveCount(0);

    await page.goto("/admin/normativa");
    await page.getByPlaceholder("Buscar normativa...").fill(numero);
    await page.locator("tbody tr", { hasText: titulo }).getByRole("button", { name: "Eliminar" }).click();
    await confirmarEliminacion(page, "Eliminar normativa");
    await expect(page.locator("tbody tr", { hasText: titulo })).toHaveCount(0);
  });

  test("transparencia ?publicada=false + toggle por fila", async ({ page }) => {
    const titulo = `FiltroDoc E2E ${TS}`;
    await page.goto("/admin/transparencia/nueva");
    await page.getByPlaceholder("Ej: Presupuesto General 2026").fill(titulo);
    await page.locator('input[type="file"]').setInputFiles(fixturePdf());
    await expect(page.getByRole("link", { name: "Ver archivo" })).toBeVisible();
    await page.getByRole("button", { name: "Guardar Documento" }).click();
    await page.waitForURL("**/admin/transparencia");

    await page.goto("/admin/transparencia?publicada=false");
    const sel = await selectConOpcion(page, "No publicados");
    await expect(sel).toHaveValue("no");
    // recién creado está publicado → no aparece en "no"
    await expect(page.locator("tbody tr", { hasText: titulo })).toHaveCount(0);

    await sel.selectOption("si");
    const row = page.locator("tbody tr", { hasText: titulo });
    await expect(row).toHaveCount(1);
    await row.getByRole("button", { name: "Sí" }).click();
    // al despublicar sale de la vista "si" (la lista refetcha con el filtro)
    await expect(page.locator("tbody tr", { hasText: titulo })).toHaveCount(0);

    await sel.selectOption("no");
    const rowNo = page.locator("tbody tr", { hasText: titulo });
    await expect(rowNo).toHaveCount(1);
    await expect(rowNo.getByRole("button", { name: "No" })).toBeVisible();
    await sel.selectOption("si");
    await expect(page.locator("tbody tr", { hasText: titulo })).toHaveCount(0);

    await sel.selectOption("todas");
    await page.getByPlaceholder("Buscar documentos...").fill(titulo);
    await page.waitForTimeout(600);
    await page.locator("tbody tr", { hasText: titulo }).getByTitle("Eliminar").click();
    await confirmarEliminacion(page, "Eliminar documento");
    await expect(page.locator("tbody tr", { hasText: titulo })).toHaveCount(0);
  });

  test("contrataciones ?estado=publicada filtra por estado", async ({ page }) => {
    const titulo = `FiltroContrat E2E ${TS}`;
    await page.goto("/admin/contrataciones/nueva");
    await page.fill('input[name="titulo"]', titulo);
    await page.getByRole("button", { name: "Crear Contratación" }).click();
    await page.waitForURL("**/admin/contrataciones");

    await page.goto("/admin/contrataciones?estado=publicada");
    const sel = page.getByLabel("Filtrar por estado");
    await expect(sel).toHaveValue("publicada");
    await expect(page.locator("tbody tr", { hasText: titulo })).toHaveCount(1);

    await sel.selectOption("borrador");
    await expect(page.locator("tbody tr", { hasText: titulo })).toHaveCount(0);

    await sel.selectOption("publicada");
    await expect(page.locator("tbody tr", { hasText: titulo })).toHaveCount(1);

    await page.locator("tbody tr", { hasText: titulo }).getByRole("button", { name: "Eliminar" }).click();
    await confirmarEliminacion(page, "Eliminar contratación");
    await expect(page.locator("tbody tr", { hasText: titulo })).toHaveCount(0);
  });

  test("usuarios ?activo=false muestra solo inactivos", async ({ page }) => {
    const email = `e2ef-${TS}@gaceta.local`;
    await page.goto("/admin/usuarios/nueva");
    await page.getByPlaceholder("Nombre y apellidos").fill(`FiltroUser E2E ${TS}`);
    await page.getByPlaceholder("usuario@mairana.gob.bo").fill(email);
    await page.getByPlaceholder("Mínimo 8 caracteres").fill(`E2ePass-${TS}`);
    await page.getByRole("button", { name: "Crear Usuario" }).click();
    await page.waitForURL("**/admin/usuarios");

    await page.goto("/admin/usuarios");
    await page.getByPlaceholder("Buscar usuarios...").fill(email);
    await page.locator("tbody tr", { hasText: email }).getByTitle("Editar").click();
    await page.getByText("Cuenta activa", { exact: true }).click();
    await expect(page.locator("#activo")).not.toBeChecked();
    await page.getByRole("button", { name: "Guardar Cambios" }).click();
    await expect(page.getByText("Usuario actualizado")).toBeVisible();

    await page.goto("/admin/usuarios?activo=false");
    const sel = page.getByLabel("Filtrar por estado");
    await expect(sel).toHaveValue("inactivo");
    await expect(page.locator("tbody tr", { hasText: email })).toHaveCount(1);

    await sel.selectOption("activo");
    await expect(page.locator("tbody tr", { hasText: email })).toHaveCount(0);

    await sel.selectOption("inactivo");
    await page.locator("tbody tr", { hasText: email }).getByTitle("Eliminar").click();
    await confirmarEliminacion(page, "Eliminar usuario");
    await expect(page.locator("tbody tr", { hasText: email })).toHaveCount(0);
  });
});
