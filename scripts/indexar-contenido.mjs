#!/usr/bin/env node
// Extrae el texto de los PDFs de las normativas publicadas y lo guarda en
// `contenido_texto` para que la búsqueda full-text (search_vector /
// buscar_normativa) y el asistente puedan leer el contenido real.
//
// Uso:
//   node scripts/indexar-contenido.mjs --dry-run
//   node scripts/indexar-contenido.mjs [--todos]
//
// - Por defecto solo procesa las normativas sin contenido_texto.
//   Con --todos reprocesa todas las que tengan archivo_pdf.
// - Los PDFs escaneados (imagen, sin capa de texto) quedan sin texto y se
//   reportan al final para su revisión.
// - Lee credenciales de .env.local (no las imprime).

import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import pdf from "pdf-parse/lib/pdf-parse.js";

const MIN_TEXT_LENGTH = 100;

function parseArgs(argv) {
  const args = { dryRun: false, todos: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run") args.dryRun = true;
    else if (a === "--todos") args.todos = true;
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

function normalize(text) {
  return text
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function extractText(buffer) {
  const data = await pdf(buffer);
  return normalize(data.text || "");
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

let query = supabase.from("normativa").select("id, slug, titulo, numero, archivo_pdf, contenido_texto").not("archivo_pdf", "is", null);
if (!args.todos) query = query.is("contenido_texto", null);

const { data: rows, error } = await query;
if (error) {
  console.error(`Error listando normativa: ${error.message}`);
  process.exit(1);
}

console.log(`Normativas a procesar: ${rows.length}${args.dryRun ? " (DRY-RUN, sin cambios)" : ""}\n`);

if (args.dryRun) {
  for (const r of rows) console.log(`${r.numero ?? "-"} | ${r.slug} | ${r.archivo_pdf}`);
  process.exit(0);
}

let ok = 0;
const scans = [];
const fails = [];

for (const r of rows) {
  if (!r.archivo_pdf) continue;
  try {
    const res = await fetch(r.archivo_pdf);
    if (!res.ok) throw new Error(`descarga ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());

    const text = await extractText(buffer);
    if (text.length < MIN_TEXT_LENGTH) {
      scans.push({ ...r, len: text.length });
      console.log(`SCAN ${r.numero ?? "-"} (${r.slug}): solo ${text.length} caracteres`);
      continue;
    }

    const { error: updErr } = await supabase
      .from("normativa")
      .update({ contenido_texto: text })
      .eq("id", r.id);
    if (updErr) throw new Error(`db: ${updErr.message}`);

    ok++;
    console.log(`OK ${r.numero ?? "-"} (${r.slug}): ${text.length} caracteres`);
  } catch (e) {
    fails.push({ ...r, motivo: e.message });
    console.log(`FAIL ${r.numero ?? "-"} (${r.slug}): ${e.message}`);
  }
}

console.log("\n==== RESUMEN ====");
console.log(`Extractados: ${ok} | Sin texto (probable escaneo): ${scans.length} | Fallidos: ${fails.length}`);
for (const s of scans) console.log(`  SCAN ${s.numero ?? "-"} (${s.slug}) len=${s.len}`);
for (const f of fails) console.log(`  FAIL ${f.numero ?? "-"} (${f.slug}): ${f.motivo}`);
process.exit(fails.length > 0 ? 2 : 0);