const fs = require("fs");
const path = require("path");
const { expect } = require("@playwright/test");

function readCredentials() {
  let saved = {};
  const file = path.join(__dirname, "..", ".admin-credentials.json");
  if (fs.existsSync(file)) {
    try {
      saved = JSON.parse(fs.readFileSync(file, "utf8"));
    } catch {}
  }
  return {
    admin: {
      email: process.env.E2E_ADMIN_EMAIL || saved.email || "e2e-admin@gaceta.local",
      password: process.env.E2E_ADMIN_PASSWORD || saved.password || "",
    },
    editor: {
      email: process.env.E2E_EDITOR_EMAIL || "profpbz@gmail.com",
      password: process.env.E2E_EDITOR_PASSWORD || "13727173",
    },
  };
}

async function login(page, email, password) {
  await page.goto("/admin/login");
  await page.fill("#email", email);
  await page.fill("#password", password);
  await page.getByRole("button", { name: "Iniciar Sesión" }).click();
  await page.waitForURL("**/admin/dashboard");
  await expect(
    page.getByRole("heading", { name: "Bienvenido al Panel de Administración" })
  ).toBeVisible();
}

async function loginAs(page, rol) {
  const creds = readCredentials()[rol];
  await login(page, creds.email, creds.password);
}

async function confirmarEliminacion(page, tituloDialog) {
  const panel = page
    .locator(`h2:text-is("${tituloDialog}")`)
    .locator("xpath=ancestor::div[2]");
  await panel.getByRole("button", { name: "Eliminar" }).click();
  await expect(panel).toBeHidden();
}

module.exports = { login, loginAs, confirmarEliminacion, readCredentials };