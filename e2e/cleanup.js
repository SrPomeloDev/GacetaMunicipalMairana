const fs = require("fs");

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
const headers = { apikey: KEY, Authorization: `Bearer ${KEY}` };

const clean = async (table, pred) => {
  const rows = await (await fetch(`${BASE}/rest/v1/${table}?select=id`, { headers })).json();
  const targets = (rows || []).filter((r) => pred(r.id));
  console.log(`clean ${table}: ${targets.length} filas a borrar de ${rows.length}`);
  for (const t of targets) {
    const res = await fetch(`${BASE}/rest/v1/${table}?id=eq.${t.id}`, {
      method: "DELETE",
      headers,
    });
    console.log(`  delete ${t.id} -> ${res.status}`);
  }
};

(async () => {
  const norm = await (
    await fetch(`${BASE}/rest/v1/normativa?select=id,titulo,numero&limit=100`, { headers })
  ).json();
  const nE2E = (norm || []).filter((n) => n.titulo.includes("E2E") || n.numero.startsWith("E2E"));
  console.log("normativa E2E:", nE2E.map((n) => n.numero));
  for (const n of nE2E) {
    const res = await fetch(`${BASE}/rest/v1/normativa?id=eq.${n.id}`, { method: "DELETE", headers });
    console.log(`  delete normativa ${n.id} -> ${res.status}`);
  }

  const not = await (
    await fetch(`${BASE}/rest/v1/noticias?select=id,titulo&limit=100`, { headers })
  ).json();
  const tE2E = (not || []).filter((n) => n.titulo.includes("E2E"));
  console.log("noticias E2E:", tE2E.map((n) => n.titulo));
  for (const n of tE2E) {
    const res = await fetch(`${BASE}/rest/v1/noticias?id=eq.${n.id}`, { method: "DELETE", headers });
    console.log(`  delete noticia ${n.id} -> ${res.status}`);
  }
})();