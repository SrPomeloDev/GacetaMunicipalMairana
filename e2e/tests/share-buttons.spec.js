const { test, expect } = require("@playwright/test");

test.describe("Botones compartir en fichas públicas", () => {
  test("normativa: Facebook/X/LinkedIn apuntan a la URL de la ficha", async ({ page }) => {
    await page.goto("/gaceta");
    const ficha = page.locator('a[href^="/normativa/"]').first();
    await expect(ficha).toBeVisible();
    await ficha.click();
    await expect(page).toHaveURL(/\/normativa\/.+/);

    const url = page.url();
    const enc = encodeURIComponent(url);
    await expect(page.getByRole("link", { name: "Compartir en Facebook" })).toHaveAttribute(
      "href",
      `https://www.facebook.com/sharer/sharer.php?u=${enc}`
    );
    const x = page.getByRole("link", { name: "Compartir en X" });
    await expect(x).toHaveAttribute("href", new RegExp(`^https://twitter\\.com/intent/tweet\\?url=${enc.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));
    await expect(page.getByRole("link", { name: "Compartir en LinkedIn" })).toHaveAttribute(
      "href",
      `https://www.linkedin.com/sharing/share-offsite/?url=${enc}`
    );
    for (const name of ["Compartir en Facebook", "Compartir en X", "Compartir en LinkedIn"]) {
      await expect(page.getByRole("link", { name })).toHaveAttribute("target", "_blank");
    }
    await expect(page.getByRole("button", { name: "Copiar enlace" })).toBeVisible();
  });

  test("noticias: WhatsApp incluye título y URL, y el resto de redes también", async ({ page }) => {
    await page.goto("/noticias");
    const ficha = page.locator('a[href^="/noticias/"]').first();
    await expect(ficha).toBeVisible();
    await ficha.click();
    await expect(page).toHaveURL(/\/noticias\/.+/);

    const url = page.url();
    const enc = encodeURIComponent(url);
    const wa = page.getByRole("link", { name: "Compartir en WhatsApp" });
    await expect(wa).toBeVisible();
    await expect(wa).toHaveAttribute("href", new RegExp(`^https://wa\\.me/\\?text=.+${enc.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));
    await expect(wa).toHaveAttribute("target", "_blank");
    await expect(page.getByRole("link", { name: "Compartir en Facebook" })).toHaveAttribute(
      "href",
      `https://www.facebook.com/sharer/sharer.php?u=${enc}`
    );
    await expect(page.getByRole("button", { name: "Copiar enlace" })).toBeVisible();
  });
});
