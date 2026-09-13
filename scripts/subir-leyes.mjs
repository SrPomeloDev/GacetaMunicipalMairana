#!/usr/bin/env node
// Carga masiva de leyes municipales desde PDFs locales a Supabase.
//
// Uso:
//   node scripts/subir-leyes.mjs --dry-run
//   node scripts/subir-leyes.mjs
//   node scripts/subir-leyes.mjs --dir "C:\Users\lenov\Downloads\LEYES" --publish
//
// - Por defecto: estado=vigente, publicada=false (borrador).
// - Idempotente: si el slug ya existe en `normativa`, se omite.
// - Lee credenciales de .env.local (no las imprime).

import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

const BUCKET = "normativa-pdf";
const DEST_PREFIX = "leyes";
const SIZE_LIMIT = 15 * 1024 * 1024;
const CATEGORIA_SLUG = "ley-municipal";
const DEPENDENCIA_SLUG = "concejo-municipal";

function parseArgs(argv) {
  const args = { dryRun: false, publish: false, dir: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run") args.dryRun = true;
    else if (a === "--publish") args.publish = true;
    else if (a === "--dir") args.dir = argv[++i];
    else if (a.startsWith("--dir=")) args.dir = a.slice("--dir=".length);
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
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}

function parseFileName(name) {
  const m = name.match(/LEY\s+MUNICIPAL\s+(\d{4})_N0*(\d+)\.pdf$/i);
  if (!m) return null;
  const year = m[1];
  const num = m[2].padStart(3, "0");
  return {
    year,
    numero: `${num}/${year}`,
    titulo: `Ley Municipal N° ${num}/${year}`,
    slug: `ley-municipal-${num}-${year}`,
  };
}

const cwd = process.cwd();
loadEnvLocal(cwd);

const args = parseArgs(process.argv);
const sourceDir = args.dir || "C:\\Users\\lenov\\Downloads\\LEYES";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error(
    "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local"
  );
  process.exit(1);
}

if (!fs.existsSync(sourceDir) || !fs.statSync(sourceDir).isDirectory()) {
  console.error(`Directorio no encontrado: ${sourceDir}`);
  process.exit(1);
}

const files = fs
  .readdirSync(sourceDir)
  .filter((f) => f.toLowerCase().endsWith(".pdf"))
  .sort();

if (files.length === 0) {
  console.error("No hay PDFs en el directorio.");
  process.exit(1);
}

const rows = [];
const skipped = [];
for (const f of files) {
  const parsed = parseFileName(f);
  if (!parsed) {
    skipped.push({ archivo: f, motivo: "nombre no coincide con patrón" });
    continue;
  }
  rows.push({ archivo: f, ...parsed });
}

console.log(`Archivos PDF: ${files.length} | Mapeados: ${rows.length} | Ignorados: ${skipped.length}`);
for (const s of skipped) console.log(`  IGNORADO: ${s.archivo} (${s.motivo})`);
console.log("Modo:", args.dryRun ? "DRY-RUN (sin cambios)" : "REAL");
console.log(`publicada=${args.publish} estado=vigente categoria=${CATEGORIA_SLUG} dependencia=${DEPENDENCIA_SLUG}\n`);

if (args.dryRun) {
  for (const r of rows) {
    console.log(`${r.numero}  |  ${r.slug}  |  ${r.titulo}  <-  ${r.archivo}`);
  }
  console.log("\nDry-run OK. Nada fue subido ni insertado.");
  process.exit(0);
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

let ok = 0;
const omits = [];
const fails = [];

for (const r of rows) {
  const fullPath = path.join(sourceDir, r.archivo);
  try {
    const { data: existing } = await supabase
      .from("normativa")
      .select("id")
      .eq("slug", r.slug)
      .maybeSingle();
    if (existing) {
      omits.push({ ...r, motivo: "slug ya existe" });
      console.log(`SKIP ${r.numero}: slug ya existe`);
      continue;
    }

    const buf = fs.readFileSync(fullPath);
    if (buf.length > SIZE_LIMIT) {
      fails.push({ ...r, motivo: `excede 15MB (${(buf.length / 1048576).toFixed(2)}MB)` });
      console.log(`FAIL ${r.numero}: excede 15MB`);
      continue;
    }
    if (!(buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46)) {
      fails.push({ ...r, motivo: "no es un PDF válido (magic bytes)" });
      console.log(`FAIL ${r.numero}: no es PDF válido`);
      continue;
    }

    const dest = `${DEST_PREFIX}/${r.slug}.pdf`;
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(dest, buf, { contentType: "application/pdf", upsert: false });

    let publicUrl;
    if (upErr) {
      if (/already exists|duplicate|The resource already exists/i.test(upErr.message)) {
        console.log(`INFO ${r.numero}: el objeto ya existe en storage, se reutiliza`);
      } else {
        throw new Error(`storage: ${upErr.message}`);
      }
    }
    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(dest);
    publicUrl = pub.publicUrl;

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
      archivo_pdf: publicUrl,
      publicada: args.publish,
      metadata: { origen: "carga-masiva-leyes", archivo_origen: r.archivo },
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
