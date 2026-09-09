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

// [tabla, columnas a seleccionar, predicado sobre la fila]
const TARGETS = [
  ["normativa", "id,titulo,numero", (r) => (r.titulo || "").includes("E2E") || (r.numero || "").startsWith("E2E")],
  ["noticias", "id,titulo", (r) => (r.titulo || "").includes("E2E")],
  ["autoridades", "id,nombre_completo", (r) => (r.nombre_completo || "").includes("E2E")],
  ["tramites", "id,titulo", (r) => (r.titulo || "").includes("E2E")],
  ["galeria", "id,titulo", (r) => (r.titulo || "").includes("E2E")],
  ["transparencia", "id,titulo", (r) => (r.titulo || "").includes("E2E")],
  ["contrataciones", "id,titulo", (r) => (r.titulo || "").includes("E2E")],
  ["categorias_normativa", "id,nombre", (r) => (r.nombre || "").includes("E2E")],
  ["dependencias", "id,nombre", (r) => (r.nombre || "").includes("E2E")],
  // concejo: primero comisiones (FK a autoridades), luego sesiones
  ["concejales_comisiones", "id,comision", (r) => (r.comision || "").includes("E2E")],
  ["concejo_sesiones", "id,numero_sesion", (r) => (r.numero_sesion || "").includes("E2E")],
  ["contacto_mensajes", "id,nombre,asunto,mensaje", (r) =>
    (r.nombre || "").includes("E2E") || (r.asunto || "").includes("E2E") || (r.mensaje || "").includes("E2E")],
  ["suscripciones", "id,email", (r) => (r.email || "").includes("e2e-")],
];

(async () => {
  for (const [table, select, pred] of TARGETS) {
    let rows = [];
    try {
      const res = await fetch(`${BASE}/rest/v1/${table}?select=${select}&limit=200`, { headers });
      rows = (await res.json()) || [];
      if (!Array.isArray(rows)) {
        console.log(`clean ${table}: respuesta inesperada, se omite`);
        continue;
      }
    } catch (e) {
      console.log(`clean ${table}: error al listar (${e.message}), se omite`);
      continue;
    }
    const targets = rows.filter(pred);
    console.log(`clean ${table}: ${targets.length} filas E2E a borrar de ${rows.length}`);
    for (const t of targets) {
      try {
        const res = await fetch(`${BASE}/rest/v1/${table}?id=eq.${t.id}`, {
          method: "DELETE",
          headers,
        });
        console.log(`  delete ${table} ${t.id} -> ${res.status}`);
      } catch (e) {
        console.log(`  delete ${table} ${t.id} -> ERROR ${e.message}`);
      }
    }
  }
  console.log("CLEANUP listo. Nota: los archivos subidos a storage (galería/documentos) no se borran aquí.");
})();
