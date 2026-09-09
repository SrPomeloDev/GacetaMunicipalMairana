const { defineConfig, devices } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  retries: 1,
  timeout: 120_000,
  expect: { timeout: 15_000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:3100",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: 'cmd /c "npm run build > e2e-build.log 2>&1 && npm run start"',
    cwd: "..",
    env: { PORT: "3100" },
    url: "http://localhost:3100",
    reuseExistingServer: false,
    timeout: 300_000,
  },
  projects: [
    { name: "unauthenticated", testMatch: /(portal|auth|theme|share-buttons|transparencia-filter|login-redirect)\.spec\.js/ },
    { name: "admin", testMatch: /(admin-sesion|permisos-admin|normativa-crud|noticias-crud|noticias-facebook|autoridades-crud|tramites-crud|galeria-crud|transparencia-crud|contrataciones-crud|categorias-crud|dependencias-crud|concejo-crud|configuracion|usuarios-crud|mensajes|suscripciones|perfil|admin-filters)\.spec\.js/ },
    { name: "editor", testMatch: /permisos-editor\.spec\.js/ },
    { name: "mobile", testMatch: /(mobile|admin-overflow)\.spec\.js/, use: { ...devices["Pixel 5"] } },
  ],
});