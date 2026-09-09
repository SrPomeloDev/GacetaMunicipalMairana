const { test, expect } = require("@playwright/test");
const { loginAs, confirmarEliminacion } = require("../helpers/actions");

const TS = Date.now();
const EMAIL = `susc-e2e-${TS}@test.bo`;

test.describe("Suscripciones (admin)", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await loginAs(page, "admin");
  });

  test("una suscripción nueva aparece activa en la lista", async ({ page, request }) => {
    const res = await request.post("/api/suscripciones", { data: { email: EMAIL } });
    expect([200, 201]).toContain(res.status());

    await page.goto("/admin/suscripciones");
    await page.getByPlaceholder("Buscar por correo...").fill(EMAIL);
    const row = page.locator("tbody tr", { hasText: EMAIL });
    await expect(row).toHaveCount(1);
    await expect(row).toContainText("Activa");
  });

  test("desactivar y reactivar suscripción", async ({ page }) => {
    await page.goto("/admin/suscripciones");
    await page.getByPlaceholder("Buscar por correo...").fill(EMAIL);
    const row = page.locator("tbody tr", { hasText: EMAIL });
    await expect(row).toHaveCount(1);

    await row.getByRole("button", { name: "Desactivar" }).click();
    await expect(page.getByText("Suscripción desactivada")).toBeVisible();
    await expect(row).toContainText("Inactiva");

    await row.getByRole("button", { name: "Activar" }).click();
    await expect(page.getByText("Suscripción activada")).toBeVisible();
    await expect(row).toContainText("Activa");
  });

  test("eliminar suscripción con confirmación masiva", async ({ page }) => {
    await page.goto("/admin/suscripciones");
    await page.getByPlaceholder("Buscar por correo...").fill(EMAIL);
    const row = page.locator("tbody tr", { hasText: EMAIL });
    await expect(row).toHaveCount(1);
    await row.locator('input[type="checkbox"]').check();
    await page.getByRole("button", { name: /Eliminar seleccionadas/ }).click();
    await expect(page.getByRole("heading", { name: "Eliminar suscripciones" })).toBeVisible();
    await confirmarEliminacion(page, "Eliminar suscripciones");
    await expect(page.locator("tbody tr", { hasText: EMAIL })).toHaveCount(0);
  });

  test.afterAll(async ({ browser }) => {
    const ctx = await browser.newContext({ baseURL: "http://localhost:3100" });
    const page = await ctx.newPage();
    await loginAs(page, "admin");
    await page.goto("/admin/suscripciones");
    await page.getByPlaceholder("Buscar por correo...").fill("e2e-");
    let guard = 0;
    while ((await page.locator("tbody tr", { hasText: "e2e-" }).count()) > 0 && guard < 5) {
      await page.locator("tbody tr", { hasText: "e2e-" }).first().locator('input[type="checkbox"]').check();
      await page.getByRole("button", { name: /Eliminar seleccionadas/ }).click();
      await confirmarEliminacion(page, "Eliminar suscripciones");
      guard += 1;
    }
    await ctx.close();
  });
});
