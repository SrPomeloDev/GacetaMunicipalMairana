const { test, expect } = require("@playwright/test");
const { loginAs, confirmarEliminacion } = require("../helpers/actions");

const TS = Date.now();
const ASUNTO = `Asunto E2E ${TS}`;
const EMAIL = `ciudadano-e2e-${TS}@test.bo`;

async function crearMensaje(request) {
  const res = await request.post("/api/contacto", {
    data: {
      nombre: `Ciudadano E2E ${TS}`,
      email: EMAIL,
      asunto: ASUNTO,
      mensaje: `Mensaje de prueba E2E ${TS} para verificar el flujo de mensajes.`,
      categoria: "reclamo",
    },
  });
  expect(res.status()).toBe(201);
}

test.describe("Mensajes de contacto (admin)", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await loginAs(page, "admin");
  });

  test("un mensaje nuevo aparece con badges de categoría y estado", async ({ page, request }) => {
    await crearMensaje(request);
    await page.goto("/admin/mensajes");
    const tarjeta = page.locator("div.space-y-3 > div", { hasText: ASUNTO });
    await expect(tarjeta).toHaveCount(1);
    await expect(tarjeta).toContainText("Reclamo");
    await expect(tarjeta).toContainText("Nuevo");
  });

  test("?no_leidos=true muestra el mensaje y marcarlo leído lo oculta", async ({ page }) => {
    await page.goto("/admin/mensajes?no_leidos=true");
    await expect(page.getByRole("button", { name: "No leídos" })).toBeVisible();
    const tarjeta = page.locator("div.space-y-3 > div", { hasText: ASUNTO });
    await expect(tarjeta).toHaveCount(1);

    await tarjeta.getByRole("button", { name: "Leer" }).click();
    await expect(page.getByText("Marcado como leído")).toBeVisible();

    await page.goto("/admin/mensajes?no_leidos=true");
    await expect(page.locator("div.space-y-3 > div", { hasText: ASUNTO })).toHaveCount(0);
  });

  test("responder marca el mensaje como respondido", async ({ page }) => {
    await page.goto("/admin/mensajes");
    const tarjeta = page.locator("div.space-y-3 > div", { hasText: ASUNTO });
    await expect(tarjeta).toHaveCount(1);
    await tarjeta.getByRole("button", { name: "Detalle" }).click();

    await tarjeta.getByPlaceholder("Escribe la respuesta para este mensaje...").fill(
      `Respuesta de prueba E2E ${TS}`
    );
    await tarjeta.getByRole("button", { name: "Guardar respuesta y marcar como respondido" }).click();
    await expect(page.getByText("Respuesta guardada")).toBeVisible();
    await expect(tarjeta).toContainText("Respondido");
  });

  test.afterAll(async ({ browser }) => {
    const ctx = await browser.newContext({ baseURL: "http://localhost:3100" });
    const page = await ctx.newPage();
    await loginAs(page, "admin");
    await page.goto("/admin/mensajes");
    let guard = 0;
    while (
      (await page.locator("div.space-y-3 > div", { hasText: "E2E" }).count()) > 0 &&
      guard < 5
    ) {
      const tarjeta = page.locator("div.space-y-3 > div", { hasText: "E2E" }).first();
      await tarjeta.locator('input[type="checkbox"]').first().check();
      await page.getByRole("button", { name: /Eliminar seleccionados/ }).click();
      await confirmarEliminacion(page, "Eliminar mensajes seleccionados");
      guard += 1;
    }
    await ctx.close();
  });
});
