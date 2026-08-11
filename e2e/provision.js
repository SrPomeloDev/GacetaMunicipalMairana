const fs = require("fs");
const crypto = require("crypto");

const envTxt = fs.readFileSync("../.env.local", "utf8");
const get = (k) => {
  const line = envTxt
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.startsWith(k + "="))
    .pop();
  return line ? line.slice(k.length + 1).trim() : "";
};
const BASE = get("NEXT_PUBLIC_SUPABASE_URL");
const KEY = get("SUPABASE_SERVICE_ROLE_KEY");
if (!BASE || !KEY) {
  console.log("PROVISION: faltan claves en .env.local");
  process.exit(1);
}

const EMAIL = "e2e-admin@gaceta.local";
const PASSWORD = "E2eAdmin-" + crypto.randomBytes(9).toString("hex");
const OUT = ".admin-credentials.json";
const authHeaders = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  "Content-Type": "application/json",
};

(async () => {
  // 1. Crear usuario en auth.users (el trigger handle_new_user crea la fila en usuarios con el rol de metadata)
  const res = await fetch(`${BASE}/auth/v1/admin/users`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      email: EMAIL,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { nombre: "E2E Admin", rol: "admin" },
    }),
  });
  const body = await res.json();
  console.log("PROVISION create-user status:", res.status);
  if (body.code) console.log("PROVISION error:", body.code, body.msg ?? body.message);
  if (!body.id) {
    if (body.code === "user_exists") {
      console.log("PROVISION el usuario ya existe (no puedo recuperar password, regenero en su lugar)");
    }
    process.exit(1);
  }
  console.log("PROVISION user id:", body.id);

  // 2. Verificar que el trigger insertó la fila en usuarios con rol admin
  const u = await (
    await fetch(`${BASE}/rest/v1/usuarios?select=id,email,rol,activo&email=eq.${encodeURIComponent(EMAIL)}`, {
      headers: authHeaders,
    })
  ).json();
  console.log("PROVISION fila usuarios:", JSON.stringify(u));

  // 3. Guardar credenciales (gitignored)
  fs.writeFileSync(OUT, JSON.stringify({ email: EMAIL, password: PASSWORD }, null, 2));
  console.log("PROVISION credenciales guardadas en", OUT);
})();