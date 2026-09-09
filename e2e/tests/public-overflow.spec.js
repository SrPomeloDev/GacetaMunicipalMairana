const { test, expect } = require("@playwright/test");

const RUTAS = [
  "/",
  "/gaceta",
  "/noticias",
  "/autoridades",
  "/transparencia",
  "/tramites",
  "/galeria",
  "/contacto",
  "/asistente",
  "/contrataciones",
  "/concejo-municipal",
  "/organo-ejecutivo",
  "/ayuda",
];

test.describe("Sin scroll horizontal en el portal (móvil)", () => {
  test("ninguna ruta pública desborda el viewport", async ({ page }) => {
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
