const { test, expect } = require("@playwright/test");
const { loginAs, readCredentials } = require("../helpers/actions");

test.describe("Login con ?redirect=", () => {
  test("tras login lleva a la ruta pedida", async ({ page }) => {
    const creds = readCredentials().admin;
    await page.goto("/admin/login?redirect=/admin/normativa");
    await page.fill("#email", creds.email);
    await page.fill("#password", creds.password);
    await page.getByRole("button", { name: "Iniciar Sesión" }).click();
    await page.waitForURL("**/admin/normativa");
    await expect(page.getByRole("heading", { name: "Normativa" })).toBeVisible();
  });

  test("un redirect externo malicioso cae al dashboard", async ({ page }) => {
    const creds = readCredentials().admin;
    await page.goto("/admin/login?redirect=//evil.example.com/admin");
    await page.fill("#email", creds.email);
    await page.fill("#password", creds.password);
    await page.getByRole("button", { name: "Iniciar Sesión" }).click();
    await page.waitForURL("**/admin/dashboard");
    await expect(
      page.getByRole("heading", { name: "Bienvenido al Panel de Administración" })
    ).toBeVisible();
  });

  test("sin redirect lleva al dashboard", async ({ page }) => {
    await loginAs(page, "admin");
    await expect(
      page.getByRole("heading", { name: "Bienvenido al Panel de Administración" })
    ).toBeVisible();
  });
});
