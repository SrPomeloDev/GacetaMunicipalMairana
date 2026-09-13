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

const activarSenior = async (page) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("gaceta-modo-senior", "1");
  });
};

const sinSoporteVoz = async (page) => {
  await page.addInitScript(() => {
    for (const k of ["SpeechRecognition", "webkitSpeechRecognition"]) {
      try {
        Object.defineProperty(window, k, {
          value: undefined,
          configurable: true,
          writable: true,
        });
      } catch {
        // si el navegador no la expone, ya está sin soporte
      }
    }
  });
};

const conVozSimulada = async (page, texto = "ley de patentes") => {
  await page.addInitScript((transcript) => {
    class FakeSpeechRecognition {
      constructor() {
        this.lang = "";
        this.continuous = false;
        this.interimResults = false;
        this.onresult = null;
        this.onerror = null;
        this.onend = null;
      }
      start() {
        window.setTimeout(() => {
          if (this.onresult) {
            this.onresult({ results: [[{ transcript }]] });
          }
          if (this.onend) this.onend();
        }, 50);
      }
      stop() {
        if (this.onend) this.onend();
      }
      abort() {}
    }
    window.SpeechRecognition = FakeSpeechRecognition;
    window.webkitSpeechRecognition = FakeSpeechRecognition;
  }, texto);
};

test.describe("Tamaño de letra", () => {
  test("el toggle activa, persiste al recargar y desactiva", async ({ page }) => {
    await page.goto("/");
    const activar = page.getByRole("button", { name: "Aumentar tamaño de letra" });
    await expect(activar).toBeVisible();
    await expect(page.locator("html")).not.toHaveClass(/\bmodo-senior\b/);

    await activar.click();
    await expect(page.locator("html")).toHaveClass(/\bmodo-senior\b/);

    await page.reload();
    await expect(page.locator("html")).toHaveClass(/\bmodo-senior\b/);

    await page.getByRole("button", { name: "Restablecer tamaño de letra" }).click();
    await expect(page.locator("html")).not.toHaveClass(/\bmodo-senior\b/);
  });

  test("el toggle queda dentro del viewport con senior activo", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Aumentar tamaño de letra" }).click();
    const toggle = page.getByRole("button", { name: "Restablecer tamaño de letra" });
    await expect(toggle).toBeVisible();
    const box = await toggle.boundingBox();
    expect(box).not.toBeNull();
    const vw = page.viewportSize();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(vw.width + 1);
  });

  test("ninguna ruta pública desborda con senior activo", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Aumentar tamaño de letra" }).click();
    await expect(page.locator("html")).toHaveClass(/\bmodo-senior\b/);
    const fallos = [];
    for (const ruta of RUTAS) {
      await page.goto(ruta);
      await page.waitForTimeout(1500);
      const over = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      if (over > 1) fallos.push(`${ruta}: ${over}px`);
    }
    expect(fallos).toEqual([]);
  });

  test("accesos fáciles solo visibles en senior y partículas visibles en ambos", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".senior-accesos")).toBeHidden();
    await expect(page.locator(".hero-particles")).toBeVisible();
    await page.getByRole("button", { name: "Aumentar tamaño de letra" }).click();
    const accesos = page.locator(".senior-accesos");
    await expect(accesos).toBeVisible();
    await expect(accesos.locator("a")).toHaveCount(4);
    await expect(page.locator(".hero-particles")).toBeVisible();
  });

  test("el feedback visual sigue vivo en senior", async ({ page }) => {
    await activarSenior(page);
    await page.goto("/");
    await expect(page.locator("html")).toHaveClass(/\bmodo-senior\b/);
    const dur = await page
      .getByRole("button", { name: "Restablecer tamaño de letra" })
      .evaluate((el) => getComputedStyle(el).transitionDuration);
    expect(dur).not.toBe("0s");
  });

  test("sin errores de hidratación con senior preactivado", async ({ page }) => {
    await activarSenior(page);
    const errores = [];
    page.on("pageerror", (e) => errores.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errores.push(m.text());
    });
    await page.goto("/");
    await page.waitForTimeout(2500);
    expect(errores.filter((t) => /hydrat/i.test(t))).toEqual([]);
  });

  test.describe("viewport móvil", () => {
    test.use({ viewport: { width: 360, height: 800 } });

    test("el toggle sigue alcanzable en 360px con senior activo", async ({ page }) => {
      await page.goto("/");
      await page.getByRole("button", { name: "Aumentar tamaño de letra" }).click();
      const toggle = page.getByRole("button", { name: "Restablecer tamaño de letra" });
      await expect(toggle).toBeVisible();
      const box = await toggle.boundingBox();
      expect(box).not.toBeNull();
      expect(box.x + box.width).toBeLessThanOrEqual(360 + 1);
    });

    test("la home no desborda en 360px con senior activo", async ({ page }) => {
      await activarSenior(page);
      await page.goto("/");
      await page.waitForTimeout(2000);
      const over = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(over).toBeLessThanOrEqual(1);
    });
  });
});

test.describe("Dictado por voz", () => {
  test("dicta en el buscador de Gaceta", async ({ page }) => {
    await conVozSimulada(page);
    await page.goto("/gaceta");
    const mic = page.getByRole("button", { name: "Dictar por voz" });
    await expect(mic).toBeVisible();
    await mic.click();
    await expect(page.getByLabel(/Buscar en la Gaceta/)).toHaveValue("ley de patentes");
  });

  test("dicta en el Asistente", async ({ page }) => {
    await conVozSimulada(page, "cómo tramito una patente");
    await page.goto("/asistente");
    const mic = page.getByRole("button", { name: "Dictar por voz" });
    await expect(mic).toBeVisible();
    await mic.click();
    await expect(page.getByLabel(/Escribí tu consulta/)).toHaveValue("cómo tramito una patente");
  });

  test("sin soporte el mic no aparece y el buscador funciona", async ({ page }) => {
    await sinSoporteVoz(page);
    await page.goto("/gaceta");
    await expect(page.getByRole("button", { name: "Dictar por voz" })).toHaveCount(0);
    const input = page.getByLabel(/Buscar en la Gaceta/);
    await input.fill("ordenanza");
    await expect(input).toHaveValue("ordenanza");
  });
});
