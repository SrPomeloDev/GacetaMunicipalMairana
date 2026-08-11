const { test, expect } = require("@playwright/test");
const { login } = require("../helpers/actions");
const { readCredentials } = require("../helpers/actions");

test.describe("Autenticación — sin sesión", () => {
  test("formulario de login muestra campos y restricción", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page.getByRole("heading", { name: "Iniciar Sesión" })).toBeVisible();
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
    await expect(
      page.getByText("Acceso restringido al personal autorizado del G.A.M. Mairana")
    ).toBeVisible();
  });

  test("credenciales inválidas muestran error", async ({ page }) => {
    await page.goto("/admin/login");
    await page.fill("#email", "nadie@mairana.gob.bo");
    await page.fill("#password", "clave-incorrecta");
    await page.getByRole("button", { name: "Iniciar Sesión" }).click();
    await expect(page.getByText("Credenciales inválidas")).toBeVisible();
  });

  test("/admin sin sesión llega a la pantalla de login", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForURL("**/admin/login**");
    await expect(page.getByRole("heading", { name: "Iniciar Sesión" })).toBeVisible();
  });

  test("/admin/dashboard sin sesión llega a la pantalla de login", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await page.waitForURL("**/admin/login**");
  });

  test("?error=inactive muestra mensaje de usuario desactivado", async ({ page }) => {
    await page.goto("/admin/login?error=inactive");
    await expect(page.getByText(/usuario fue desactivado/i)).toBeVisible();
  });

  test("las rutas API admin requieren sesión (401)", async ({ page }) => {
    const res = await page.request.get("/api/admin/dashboard/stats");
    expect(res.status()).toBe(401);
  });

  test("un admin real puede iniciar sesión", async ({ page }) => {
    const creds = readCredentials().admin;
    await login(page, creds.email, creds.password);
    await expect(
      page.getByRole("heading", { name: "Bienvenido al Panel de Administración" })
    ).toBeVisible();
  });
});