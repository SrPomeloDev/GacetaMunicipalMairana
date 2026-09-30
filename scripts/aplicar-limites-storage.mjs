#!/usr/bin/env node
/**
 * Aplica los limites de tamano y MIME de cada bucket de Supabase Storage.
 *
 * Lee la definicion de src/lib/storage-limits.ts, asi que la app y la base de datos
 * no pueden quedar desincronizadas. Usa la Storage API (PUT /storage/v1/bucket/{id})
 * en vez de SQL, porque Supabase bloquea la escritura directa con triggers de
 * proteccion sobre storage.buckets.
 *
 * NO toca los objetos ya subidos: file_size_limit y allowed_mime_types solo se
 * evaluan en el momento de una subida nueva.
 *
 * Uso:
 *   node --experimental-strip-types scripts/aplicar-limites-storage.mjs
 */

import fs from "node:fs"
import path from "node:path"
import { pathToFileURL } from "node:url"

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

const { BUCKETS } = await import(
  pathToFileURL(path.join(RAIZ, "src/lib/storage-limits.ts")).href
)

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

async function main() {
  const antes = Object.fromEntries(
    (await api("GET", "/storage/v1/bucket")).map((b) => [b.id, b])
  )

  for (const [bucket, config] of Object.entries(BUCKETS)) {
    if (!antes[bucket]) {
      console.log(`${bucket}: no existe, se omite`)
      continue
    }

    const previo = antes[bucket]
    const cambia =
      previo.file_size_limit !== config.bytes ||
      JSON.stringify(previo.allowed_mime_types) !== JSON.stringify(config.mimeTypes)

    if (!cambia) {
      console.log(`${bucket}: ya esta en ${config.mb}MB, sin cambios`)
      continue
    }

    const res = await api("PUT", `/storage/v1/bucket/${bucket}`, {
      id: bucket,
      name: bucket,
      public: true,
      file_size_limit: config.bytes,
      allowed_mime_types: config.mimeTypes,
    })

    console.log(
      `${bucket}: ${previo.file_size_limit ?? "sin limite"} -> ${config.bytes} bytes (${config.mb}MB), ` +
        `${previo.allowed_mime_types?.length ?? 0} -> ${config.mimeTypes.length} MIME  [${res?.message ?? "ok"}]`
    )
  }

  console.log("\nEstado final:")
  for (const b of await api("GET", "/storage/v1/bucket")) {
    console.log(
      `  ${b.id.padEnd(20)} ${String(b.file_size_limit ?? "sin limite").padEnd(10)} ` +
        `${(b.allowed_mime_types ?? []).join(", ")}`
    )
  }
}

main().catch((e) => {
  console.error(e.message)
  process.exit(1)
})
