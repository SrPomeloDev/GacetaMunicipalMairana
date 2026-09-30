#!/usr/bin/env node
/**
 * Elimina los buckets de storage que la app nunca usa (creados por 00002).
 *
 * Supabase bloquea el DELETE directo sobre storage.buckets desde SQL con el trigger
 * storage.protect_delete(), asi que el borrado tiene que ir por la Storage API.
 *
 * Uso:
 *   node scripts/eliminar-buckets-huerfanos.mjs            -> solo reporte (dry-run)
 *   node scripts/eliminar-buckets-huerfanos.mjs --borrar   -> los elimina de verdad
 *
 * Por seguridad, aborta si un bucket NO esta vacio, salvo que se pase --forzar.
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

const BUCKETS_HUERFANOS = ["pdfs", "imagenes", "firmas", "actas"]

const BORRAR = process.argv.includes("--borrar")
const FORZAR = process.argv.includes("--forzar")

const headers = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
}

async function api(method, ruta, cuerpo) {
  const res = await fetch(`${URL_BASE}${ruta}`, {
    method,
    headers,
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  })
  if (!res.ok) throw new Error(`${method} ${ruta}: ${res.status} ${await res.text()}`)
  return res.status === 204 ? null : res.json()
}

async function contarObjetos(bucket) {
  const objetos = []
  const limit = 1000
  for (let offset = 0; offset < 20000; offset += limit) {
    const data = await api("POST", `/storage/v1/object/list/${bucket}`, {
      prefix: "",
      limit,
      offset,
      withMetadata: true,
    })
    if (!Array.isArray(data) || data.length === 0) break
    objetos.push(...data)
    if (data.length < limit) break
  }
  return objetos
}

async function main() {
  const existentes = (await api("GET", "/storage/v1/bucket")).map((b) => b.id)
  const presentes = BUCKETS_HUERFANOS.filter((b) => existentes.includes(b))

  if (presentes.length === 0) {
    console.log("No quedan buckets huerfanos. Nada que hacer.")
    return
  }

  console.log(`Buckets huerfanos encontrados: ${presentes.join(", ")}\n`)

  let pendientes = 0

  for (const bucket of presentes) {
    const objetos = await contarObjetos(bucket)

    if (objetos.length > 0 && !FORZAR) {
      console.log(`${bucket}: ${objetos.length} objetos. Se omite (usa --forzar si de verdad quieres borrarlo).`)
      for (const o of objetos) console.log(`   - ${o.name}`)
      pendientes++
      continue
    }

    if (BORRAR) {
      await api("DELETE", `/storage/v1/bucket/${bucket}`)
      console.log(`${bucket}: ${objetos.length} objetos -> eliminado`)
    } else {
      console.log(`${bucket}: ${objetos.length} objetos -> se eliminaria`)
    }
  }

  if (!BORRAR) {
    console.log("\nDry-run. Revisa la salida y ejecuta con --borrar para eliminar los buckets.")
  } else if (pendientes > 0) {
    console.log(`\n${pendientes} bucket(s) omitidos por tener contenido.`)
  }
}

main().catch((e) => {
  console.error(e.message)
  process.exit(1)
})
