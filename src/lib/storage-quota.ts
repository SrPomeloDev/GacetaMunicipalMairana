import { createAdminClient } from "@/lib/supabase/admin"
import { BUCKET_NAMES, STORAGE_AVISO_BYTES, STORAGE_QUOTA_BYTES, type BucketNombre } from "@/lib/storage-limits"

export interface UsoBucket {
  bucket: BucketNombre
  objetos: number
  bytes: number
}

export interface EstadoStorage {
  totalBytes: number
  quotaBytes: number
  pct: number
  exceeded: boolean
  enAviso: boolean
  porBucket: UsoBucket[]
  calculadoEn: string
}

export type ResultadoCuota =
  | { ok: true }
  | {
      ok: false
      status: number
      error: string
      codigo: "CUOTA_LLENA"
      limiteMb: number
      restanteMb: number
      estado: EstadoStorage
    }

const CACHE_MS = 60_000

let cache: { estado: EstadoStorage; expira: number } | null = null

async function listarBucket(bucket: string): Promise<{ objetos: number; bytes: number }> {
  const admin = createAdminClient()
  let objetos = 0
  let bytes = 0
  const pageSize = 1000

  for (let offset = 0; offset < 20000; offset += pageSize) {
    const { data, error } = await admin.storage
      .from(bucket)
      .list("", { limit: pageSize, offset })
    if (error) throw new Error(error.message)
    if (!Array.isArray(data) || data.length === 0) break
    for (const item of data) {
      if (item.id === null) continue
      objetos += 1
      const meta = item.metadata as { size?: unknown } | null
      const size = Number(meta?.size ?? 0)
      bytes += Number.isFinite(size) ? size : 0
    }
    if (data.length < pageSize) break
  }

  return { objetos, bytes }
}

export async function getUsoStorage(forzar = false): Promise<EstadoStorage> {
  const ahora = Date.now()
  if (!forzar && cache && cache.expira > ahora) return cache.estado

  const porBucket: UsoBucket[] = []
  for (const bucket of BUCKET_NAMES) {
    const r = await listarBucket(bucket)
    porBucket.push({ bucket, objetos: r.objetos, bytes: r.bytes })
  }

  const totalBytes = porBucket.reduce((acc, b) => acc + b.bytes, 0)
  const estado: EstadoStorage = {
    totalBytes,
    quotaBytes: STORAGE_QUOTA_BYTES,
    pct: Math.min(100, Math.round((totalBytes / STORAGE_QUOTA_BYTES) * 100)),
    exceeded: totalBytes >= STORAGE_QUOTA_BYTES,
    enAviso: totalBytes >= STORAGE_AVISO_BYTES,
    porBucket,
    calculadoEn: new Date(ahora).toISOString(),
  }

  cache = { estado, expira: ahora + CACHE_MS }
  return estado
}

export async function checkCuotaStorage(bytesExtra: number): Promise<ResultadoCuota> {
  const estado = await getUsoStorage()
  const proyectado = estado.totalBytes + bytesExtra

  if (proyectado >= estado.quotaBytes) {
    const restante = Math.max(0, estado.quotaBytes - estado.totalBytes)
    return {
      ok: false,
      status: 507,
      estado,
      codigo: "CUOTA_LLENA",
      limiteMb: Math.round(estado.quotaBytes / 1048576),
      restanteMb: Math.round((restante / 1048576) * 10) / 10,
      error:
        restante === 0
          ? "Se alcanzó el límite de almacenamiento del portal (200 MB). Borra archivos antiguos o contacta al administrador."
          : `No hay espacio suficiente en el portal. Quedan ${(restante / 1048576).toFixed(1)} MB de los 200 MB disponibles.`,
    }
  }

  return { ok: true }
}

export function invalidarCacheStorage() {
  cache = null
}
