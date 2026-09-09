const { test, expect } = require("@playwright/test");
const { loginAs } = require("../helpers/actions");

const TS = Date.now();

test.describe("Mi perfil (admin)", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await loginAs(page, "admin");
  });

  test("cambiar el nombre y restaurarlo", async ({ page }) => {
    await page.goto("/admin/perfil");
    await expect(page.getByRole("heading", { name: "Mi Perfil" })).toBeVisible();

    const card = page.locator("div.rounded-xl", {
      has: page.getByRole("heading", { name: "Datos del Perfil" }),
    });
    const nombre = card.locator("input:not([disabled])").first();
    await expect(nombre).toBeVisible();
    const original = await nombre.inputValue();
    expect(original.length).toBeGreaterThan(0);

    await nombre.fill(`E2E Perfil ${TS}`);
    await page.getByRole("button", { name: "Guardar Perfil" }).click();
    await expect(page.getByText("Perfil actualizado")).toBeVisible();

    await page.reload();
    const card2 = page.locator("div.rounded-xl", {
      has: page.getByRole("heading", { name: "Datos del Perfil" }),
    });
    await expect(card2.locator("input:not([disabled])").first()).toHaveValue(
      `E2E Perfil ${TS}`
    );

    await card2.locator("input:not([disabled])").first().fill(original);
    await page.getByRole("button", { name: "Guardar Perfil" }).click();
    await expect(page.getByText("Perfil actualizado")).toBeVisible();

    await page.reload();
    const card3 = page.locator("div.rounded-xl", {
      has: page.getByRole("heading", { name: "Datos del Perfil" }),
    });
    await expect(card3.locator("input:not([disabled])").first()).toHaveValue(original);
  });

  test("el toggle de tema cambia claro/oscuro", async ({ page }) => {
    await page.goto("/admin/perfil");
    await page.getByRole("button", { name: "Oscuro" }).click();
    await expect(page.locator("html")).toHaveClass(/\bdark\b/);

    await page.getByRole("button", { name: "Claro" }).click();
    await expect(page.locator("html")).not.toHaveClass(/\bdark\b/);
  });

  test("contraseñas distintas muestran error de validación", async ({ page }) => {
    await page.goto("/admin/perfil");
    const passwords = page.locator('input[type="password"]');
    await passwords.nth(0).fill("clave-una-123");
    await passwords.nth(1).fill("clave-otra-456");
    await page.getByRole("button", { name: "Actualizar Contraseña" }).click();
    await expect(page.getByText("Las contraseñas no coinciden")).toBeVisible();
  });
});
