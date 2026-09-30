#!/usr/bin/env node
/**
 * Barrido de archivos huerfanos en Supabase Storage.
 *
 * Compara los objetos de los 4 buckets reales contra todas las columnas de
 * tablas que guardan URLs de archivos. Lo que no este referenciado es basura
 * (subidas reemplazadas, artefactos de pruebas E2E, borrados fallidos).
 *
 * Uso:
 *   node scripts/barrerar-huerfanos.mjs            -> solo reporte (dry-run)
 *   node scripts/barrerar-huerfanos.mjs --borrar   -> elimina los huerfanos
 *
 * Revisa SIEMPRE el dry-run antes de usar --borrar.
 */

import fs from "node:fs"
import path from "node:path"

const RAIZ = process.cwd()
const envPath = path.join(RAIZ, ".env.local")

if (!fs.existsSync(envPath)) {
  console.error("No se encontro .env.local en", RAIZ)
  process.exit(1)
}

for (const linea of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
  const m = linea.match(/^([A-Z_]+)=(.*)$/)
  if (m) process.env[m[1]] ??= m[2].trim().replace(/^["']|["']$/g, "")
}

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!URL_BASE || !SERVICE_KEY) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local")
  process.exit(1)
}

const BUCKETS = ["noticias-imagenes", "normativa-pdf", "galeria", "documentos"]

const REFERENCIAS = {
  "noticias-imagenes": [
    ["noticias", ["imagen_principal"]],
    ["autoridades", ["foto"]],
    ["usuarios", ["avatar_url"]],
    ["configuracion", ["logo_url", "alcalde_foto", "fondo_url"]],
  ],
  "normativa-pdf": [["normativa", ["archivo_pdf"]]],
  galeria: [["galeria", ["imagen"]]],
  documentos: [
    ["tramites", ["formulario_pdf"]],
    ["transparencia", ["archivo_pdf"]],
    ["contrataciones", ["archivo_pdf"]],
    ["concejo_sesiones", ["acta_pdf"]],
  ],
}

const BORRAR = process.argv.includes("--borrar")

const headers = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
}

function urlPublica(bucket, name) {
  return `${URL_BASE}/storage/v1/object/public/${bucket}/${name}`
}

async function listarBucket(bucket) {
  const objetos = []
  const limit = 1000
  for (let offset = 0; offset < 20000; offset += limit) {
    const res = await fetch(`${URL_BASE}/storage/v1/object/list/${bucket}`, {
      method: "POST",
      headers,
      body: JSON.stringify({ prefix: "", limit, offset, withMetadata: true }),
    })
    if (!res.ok) throw new Error(`list ${bucket}: ${res.status} ${await res.text()}`)
    const data = await res.json()
    if (!Array.isArray(data) || data.length === 0) break
    objetos.push(...data)
    if (data.length < limit) break
  }
  return objetos
}

async function referenciasBucket(bucket) {
  const set = new Set()
  for (const [tabla, columnas] of REFERENCIAS[bucket] ?? []) {
    for (const columna of columnas) {
      const url = `${URL_BASE}/rest/v1/${tabla}?select=id,${columna}`
      const res = await fetch(url, { headers })
      if (!res.ok) continue
      const filas = await res.json()
      if (!Array.isArray(filas)) continue
      for (const fila of filas) {
        const valor = fila[columna]
        if (typeof valor === "string" && valor) set.add(valor)
      }
    }
  }
  return set
}

async function eliminar(bucket, path) {
  const res = await fetch(`${URL_BASE}/storage/v1/object/${bucket}`, {
    method: "DELETE",
    headers,
    body: JSON.stringify({ prefixes: [path] }),
  })
  if (!res.ok) throw new Error(`delete ${bucket}/${path}: ${res.status} ${await res.text()}`)
}

async function main() {
  let totalHuerfanos = 0
  let totalBytes = 0

  for (const bucket of BUCKETS) {
    const objetos = await listarBucket(bucket)
    const refs = await referenciasBucket(bucket)
    const huerfanos = objetos.filter((o) => !refs.has(urlPublica(bucket, o.name)))

    let bytes = 0
    for (const o of huerfanos) bytes += Number(o.metadata?.size ?? 0)

    totalHuerfanos += huerfanos.length
    totalBytes += bytes

    console.log(`\n${bucket}: ${objetos.length} objetos, ${huerfanos.length} huerfanos (${(bytes / 1048576).toFixed(2)} MB)`)
    for (const o of huerfanos) {
      console.log(`   - ${o.name}  (${Number(o.metadata?.size ?? 0)} bytes)`)
    }

    if (BORRAR && huerfanos.length > 0) {
      const paths = huerfanos.map((o) => o.name)
      await eliminar(bucket, paths)
      console.log(`   -> ${paths.length} eliminados`)
    }
  }

  console.log(`\nTotal: ${totalHuerfanos} huerfanos, ${(totalBytes / 1048576).toFixed(2)} MB`)
  if (!BORRAR && totalHuerfanos > 0) {
    console.log("Dry-run. Revisa la lista y ejecuta con --borrar para eliminarlos.")
  }
}

main().catch((e) => {
  console.error(e.message)
  process.exit(1)
})
