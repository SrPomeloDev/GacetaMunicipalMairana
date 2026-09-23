#!/usr/bin/env node
// Crea/publica los registros en `normativa` a partir de los PDFs ya subidos al
// bucket `normativa-pdf/leyes/` por scripts/subir-leyes.mjs.
//
// Diferencia con subir-leyes.mjs: NO re-subir PDFs — reutiliza los objetos que
// ya están en storage. Las filas faltantes se insertan y las que existen como
// borrador (publicada=false) se pasan a publicada=true (visibles al público).
//
// Uso:
//   node scripts/crear-registros-leyes.mjs --dry-run
//   node scripts/crear-registros-leyes.mjs
//
// - Idempotente: si el slug ya existe publicada=true, se omite.
// - Lee credenciales de .env.local (no las imprime).

import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

const BUCKET = "normativa-pdf";
const DEST_PREFIX = "leyes";
const CATEGORIA_SLUG = "ley-municipal";
const DEPENDENCIA_SLUG = "OEM";
const PATTERN = /^ley-municipal-(\d{3})-(\d{4})\.pdf$/i;

function parseArgs(argv) {
  const args = { dryRun: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run") args.dryRun = true;
  }
  return args;
}

function loadEnvLocal(cwd) {
  const file = path.join(cwd, ".env.local");
  if (!fs.existsSync(file)) return;
  const text = fs.readFileSync(file, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#") || !t.includes("=")) continue;
    const eq = t.indexOf("=");
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}

const cwd = process.cwd();
loadEnvLocal(cwd);

const args = parseArgs(process.argv);

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: cat, error: catErr } = await supabase
  .from("categorias_normativa")
  .select("id")
  .eq("slug", CATEGORIA_SLUG)
  .maybeSingle();
if (catErr || !cat) {
  console.error(`Categoría '${CATEGORIA_SLUG}' no encontrada. Ejecuta las migraciones/seed primero.`);
  process.exit(1);
}

const { data: dep } = await supabase
  .from("dependencias")
  .select("id")
  .eq("slug", DEPENDENCIA_SLUG)
  .maybeSingle();
if (!dep) {
  console.warn(`Advertencia: dependencia '${DEPENDENCIA_SLUG}' no encontrada. Se usará null.`);
}

const { data: objects, error: listErr } = await supabase.storage.from(BUCKET).list(DEST_PREFIX, {
  limit: 500,
  offset: 0,
  sortBy: { column: "name", order: "asc" },
});
if (listErr) {
  console.error(`Error listando '${DEST_PREFIX}/': ${listErr.message}`);
  process.exit(1);
}

const rows = [];
const ignored = [];
for (const o of objects ?? []) {
  const m = o.name.match(PATTERN);
  const num = m ? m[1] : null;
  const year = m ? m[2] : null;
  if (!m) {
    ignored.push(o.name);
    continue;
  }
  rows.push({
    archivo: o.name,
    numero: `${num}/${year}`,
    titulo: `Ley Municipal N° ${num}/${year}`,
    slug: `ley-municipal-${num}-${year}`,
  });
}

console.log(`Objetos en ${DEST_PREFIX}/: ${objects?.length ?? 0} | Mapeados: ${rows.length} | Ignorados: ${ignored.length}`);
for (const i of ignored) console.log(`  IGNORADO: ${i}`);
console.log("Modo:", args.dryRun ? "DRY-RUN (sin cambios)" : "REAL");
console.log(`publicada=true estado=vigente categoria=${CATEGORIA_SLUG} dependencia=${DEPENDENCIA_SLUG}\n`);

if (args.dryRun) {
  for (const r of rows) console.log(`${r.numero}  |  ${r.slug}  |  ${r.titulo}  <-  ${r.archivo}`);
  console.log("\nDry-run OK. Nada fue insertado.");
  process.exit(0);
}

let ok = 0;
const omits = [];
const fails = [];

for (const r of rows) {
  try {
    const { data: existing } = await supabase.from("normativa").select("id, publicada").eq("slug", r.slug).maybeSingle();
    if (existing) {
      if (existing.publicada) {
        omits.push({ ...r, motivo: "ya publicada" });
        console.log(`SKIP ${r.numero}: ya publicada`);
        continue;
      }
      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(`${DEST_PREFIX}/${r.archivo}`);
      const { error: updErr } = await supabase
        .from("normativa")
        .update({ publicada: true, archivo_pdf: pub.publicUrl })
        .eq("id", existing.id);
      if (updErr) throw new Error(`db: ${updErr.message}`);
      ok++;
      console.log(`PUB ${r.numero} -> ${r.slug} (era borrador)`);
      continue;
    }

    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(`${DEST_PREFIX}/${r.archivo}`);
    const { error: insErr } = await supabase.from("normativa").insert({
      numero: r.numero,
      slug: r.slug,
      titulo: r.titulo,
      resumen: null,
      contenido_texto: null,
      categoria_id: cat.id,
      dependencia_id: dep ? dep.id : null,
      estado: "vigente",
      fecha_aprobacion: null,
      fecha_publicacion: null,
      fecha_vigencia: null,
      numero_paginas: null,
      archivo_pdf: pub.publicUrl,
      publicada: true,
      metadata: { origen: "registro-desde-storage", archivo_origen: r.archivo },
    });
    if (insErr) throw new Error(`db: ${insErr.message}`);

    ok++;
    console.log(`OK ${r.numero} -> ${r.slug}`);
  } catch (e) {
    fails.push({ ...r, motivo: e.message });
    console.log(`FAIL ${r.numero}: ${e.message}`);
  }
}

console.log("\n==== RESUMEN ====");
console.log(`OK: ${ok} | Omitidos: ${omits.length} | Fallidos: ${fails.length}`);
for (const f of fails) console.log(`  FAIL ${f.numero} (${f.archivo}): ${f.motivo}`);
process.exit(fails.length > 0 ? 2 : 0);