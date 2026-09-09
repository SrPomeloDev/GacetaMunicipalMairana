const { test, expect } = require("@playwright/test");
const { loginAs, confirmarEliminacion } = require("../helpers/actions");

const TS = Date.now();
const NOMBRE = `Usuario E2E ${TS}`;
const EMAIL = `e2e-${TS}@gaceta.local`;
const PASSWORD = `E2ePass-${TS}`;

test.describe("CRUD de usuarios (admin)", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await loginAs(page, "admin");
  });

  test("crear usuario editor y verlo en la lista", async ({ page }) => {
    await page.goto("/admin/usuarios/nueva");
    await expect(page.getByRole("heading", { name: "Nuevo Usuario" })).toBeVisible();
    await page.getByPlaceholder("Nombre y apellidos").fill(NOMBRE);
    await page.getByPlaceholder("usuario@mairana.gob.bo").fill(EMAIL);
    await page.getByPlaceholder("Mínimo 8 caracteres").fill(PASSWORD);
    await page.getByRole("button", { name: "Crear Usuario" }).click();
    await page.waitForURL("**/admin/usuarios");

    await page.getByPlaceholder("Buscar usuarios...").fill(EMAIL);
    const row = page.locator("tbody tr", { hasText: EMAIL });
    await expect(row).toHaveCount(1);
    await expect(row).toContainText("Editor");
    await expect(row).toContainText("Activo");
  });

  test("desactivar y reactivar usuario", async ({ page }) => {
    await page.goto("/admin/usuarios");
    await page.getByPlaceholder("Buscar usuarios...").fill(EMAIL);
    const row = page.locator("tbody tr", { hasText: EMAIL });
    await expect(row).toHaveCount(1);
    await row.getByTitle("Editar").click();

    await expect(page.getByRole("heading", { name: "Editar Usuario" })).toBeVisible();
    const activo = page.locator("#activo");
    const activoLabel = page.getByText("Cuenta activa", { exact: true });
    await expect(activo).toBeChecked();
    await activoLabel.click();
    await expect(activo).not.toBeChecked();
    await page.getByRole("button", { name: "Guardar Cambios" }).click();
    await expect(page.getByText("Usuario actualizado")).toBeVisible();

    await page.goto("/admin/usuarios");
    await page.getByPlaceholder("Buscar usuarios...").fill(EMAIL);
    await expect(page.locator("tbody tr", { hasText: EMAIL })).toContainText("Inactivo");

    await page.locator("tbody tr", { hasText: EMAIL }).getByTitle("Editar").click();
    await page.getByText("Cuenta activa", { exact: true }).click();
    await expect(page.locator("#activo")).toBeChecked();
    await page.getByRole("button", { name: "Guardar Cambios" }).click();
    await expect(page.getByText("Usuario actualizado")).toBeVisible();

    await page.goto("/admin/usuarios");
    await page.getByPlaceholder("Buscar usuarios...").fill(EMAIL);
    await expect(page.locator("tbody tr", { hasText: EMAIL })).toContainText("Activo");
  });

  test("eliminar usuario con confirmación", async ({ page }) => {
    await page.goto("/admin/usuarios");
    await page.getByPlaceholder("Buscar usuarios...").fill(EMAIL);
    const row = page.locator("tbody tr", { hasText: EMAIL });
    await expect(row).toHaveCount(1);
    await row.getByTitle("Eliminar").click();
    await expect(page.getByText(/¿Seguro que deseas eliminar/i)).toBeVisible();
    await confirmarEliminacion(page, "Eliminar usuario");
    await expect(page.locator("tbody tr", { hasText: EMAIL })).toHaveCount(0);
  });

  test.afterAll(async ({ browser }) => {
    const ctx = await browser.newContext({ baseURL: "http://localhost:3100" });
    const page = await ctx.newPage();
    await loginAs(page, "admin");
    await page.goto("/admin/usuarios");
    await expect(page.locator("tbody tr").first()).toBeVisible({ timeout: 20000 });
    await page.getByPlaceholder("Buscar usuarios...").fill("e2e-");
    await page.waitForTimeout(800);
    // e2e-\d+ para no tocar nunca e2e-admin@gaceta.local (cuenta de provision)
    const patron = /e2e-\d+@gaceta\.local/;
    let guard = 0;
    while ((await page.locator("tbody tr", { hasText: patron }).count()) > 0 && guard < 20) {
      const n = await page.locator("tbody tr", { hasText: patron }).count();
      await page.locator("tbody tr", { hasText: patron }).first().getByTitle("Eliminar").click();
      await confirmarEliminacion(page, "Eliminar usuario");
      await expect
        .poll(() => page.locator("tbody tr", { hasText: patron }).count(), { timeout: 20000 })
        .toBeLessThan(n);
      guard += 1;
    }
    await ctx.close();
  });
});
