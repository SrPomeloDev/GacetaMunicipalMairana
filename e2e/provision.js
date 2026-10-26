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

const OUT = ".admin-credentials.json";
const headers = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  "Content-Type": "application/json",
};

async function listarUsuarios() {
  const res = await fetch(`${BASE}/auth/v1/admin/users?page=1&per_page=1000`, { headers });
  const body = await res.json();
  return body.users || [];
}

async function upsertUsuario({ email, nombre, rol }) {
  const password = "E2e-" + crypto.randomBytes(9).toString("hex");
  const res = await fetch(`${BASE}/auth/v1/admin/users`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { nombre, rol },
    }),
  });
  const body = await res.json();
  console.log(`PROVISION create-user ${email} status:`, res.status);

  let id = body.id;
  let creado = true;

  if (!id) {
    const yaExiste = ["user_exists", "email_exists"].includes(body.code) || res.status === 422;
    if (!yaExiste) {
      throw new Error(`no se pudo crear ${email}: ${body.code || ""} ${body.msg || body.message || ""}`);
    }
    const existente = (await listarUsuarios()).find((u) => u.email === email);
    if (!existente) throw new Error(`no se encontró ${email} en auth.users`);
    id = existente.id;
    creado = false;
    const upd = await fetch(`${BASE}/auth/v1/admin/users/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        password,
        email_confirm: true,
        user_metadata: { ...(existente.user_metadata || {}), nombre, rol },
      }),
    });
    const updBody = await upd.json();
    if (!updBody.id) {
      throw new Error(`no se pudo actualizar ${email}: ${updBody.code || ""} ${updBody.msg || updBody.message || ""}`);
    }
  }

  const patch = await fetch(`${BASE}/rest/v1/usuarios?id=eq.${id}`, {
    method: "PATCH",
    headers: { ...headers, Prefer: "return=representation" },
    body: JSON.stringify({ rol, activo: true, nombre }),
  });
  const fila = await patch.json();
  console.log(`PROVISION fila usuarios ${email}:`, JSON.stringify(fila));

  return { email, password, id, creado };
}

(async () => {
  const admin = await upsertUsuario({ email: "e2e-admin@gaceta.local", nombre: "E2E Admin", rol: "admin" });
  const editor = await upsertUsuario({ email: "e2e-editor@gaceta.local", nombre: "E2E Editor", rol: "editor" });

  fs.writeFileSync(
    OUT,
    JSON.stringify(
      {
        admin: { email: admin.email, password: admin.password },
        editor: { email: editor.email, password: editor.password },
      },
      null,
      2
    )
  );
  console.log("PROVISION credenciales guardadas en", OUT);
})();
