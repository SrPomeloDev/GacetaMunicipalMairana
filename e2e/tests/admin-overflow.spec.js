const { test, expect } = require("@playwright/test");
const { loginAs } = require("../helpers/actions");

const RUTAS = [
  "/admin/dashboard",
  "/admin/normativa",
  "/admin/noticias",
  "/admin/autoridades",
  "/admin/dependencias",
  "/admin/categorias",
  "/admin/concejo",
  "/admin/concejo/comisiones",
  "/admin/transparencia",
  "/admin/tramites",
  "/admin/galeria",
  "/admin/contrataciones",
  "/admin/suscripciones",
  "/admin/mensajes",
  "/admin/usuarios",
  "/admin/configuracion",
  "/admin/perfil",
];

test.describe("Sin scroll horizontal en el panel (móvil)", () => {
  test("ninguna ruta admin desborda el viewport", async ({ page }) => {
    await loginAs(page, "admin");
    const fallos = [];
    for (const ruta of RUTAS) {
      await page.goto(ruta);
      await page.waitForTimeout(2000);
      const over = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      if (over > 1) fallos.push(`${ruta}: ${over}px`);
    }
    expect(fallos).toEqual([]);
  });
});
