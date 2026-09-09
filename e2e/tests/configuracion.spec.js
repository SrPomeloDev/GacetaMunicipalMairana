const { test, expect } = require("@playwright/test");
const { loginAs } = require("../helpers/actions");

const TS = Date.now();

test.describe("Configuración general (admin)", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await loginAs(page, "admin");
  });

  test("editar y restaurar el nombre del municipio", async ({ page }) => {
    await page.goto("/admin/configuracion");
    await expect(page.getByRole("heading", { name: "Configuración" })).toBeVisible();

    const campo = page.locator("#cfg-municipio");
    await expect(campo).toBeVisible();
    const original = await campo.inputValue();
    expect(original.length).toBeGreaterThan(0);

    await campo.fill(`Municipio E2E ${TS}`);
    await page.getByRole("button", { name: "Guardar Cambios" }).click();
    await expect(page.getByText("Configuración guardada")).toBeVisible();

    await page.reload();
    await expect(page.locator("#cfg-municipio")).toHaveValue(`Municipio E2E ${TS}`);

    await page.locator("#cfg-municipio").fill(original);
    await page.getByRole("button", { name: "Guardar Cambios" }).click();
    await expect(page.getByText("Configuración guardada")).toBeVisible();

    await page.reload();
    await expect(page.locator("#cfg-municipio")).toHaveValue(original);
  });
});
