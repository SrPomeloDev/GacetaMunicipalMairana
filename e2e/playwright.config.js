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
    { name: "unauthenticated", testMatch: /(portal|auth|theme)\.spec\.js/ },
    { name: "admin", testMatch: /(admin-sesion|permisos-admin|normativa-crud|noticias-crud)\.spec\.js/ },
    { name: "editor", testMatch: /permisos-editor\.spec\.js/ },
    { name: "mobile", testMatch: /mobile\.spec\.js/, use: { ...devices["Pixel 5"] } },
  ],
});