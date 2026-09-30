"use client"

import { useEffect, useState } from "react"
import { HardDrive, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatearMB } from "@/lib/storage-limits"

interface BucketInfo {
  bucket: string
  objetos: number
  bytes: number
}

interface StorageStats {
  usado_bytes: number
  cuota_bytes: number
  pct: number
  exceeded: boolean
  en_aviso: boolean
  por_bucket: BucketInfo[]
}

const ETIQUETAS: Record<string, string> = {
  "noticias-imagenes": "Imágenes de noticias y perfil",
  galeria: "Galería de fotos",
  "normativa-pdf": "PDFs de normativa",
  documentos: "Trámites y documentos",
}

async function fetchStorageStats(): Promise<StorageStats | null> {
  try {
    const res = await fetch("/api/admin/dashboard/stats")
    if (!res.ok) return null
    const data = await res.json()
    return data?.storage ? (data.storage as StorageStats) : null
  } catch {
    return null
  }
}

export function StorageQuotaBar() {
  const [stats, setStats] = useState<StorageStats | null>(null)
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    let vivo = true

    fetchStorageStats()
      .then((s) => {
        if (vivo && s) setStats(s)
      })
      .catch(() => undefined)

    return () => {
      vivo = false
    }
  }, [])

  const recargar = async () => {
    setCargando(true)
    try {
      const s = await fetchStorageStats()
      if (s) setStats(s)
    } finally {
      setCargando(false)
    }
  }

  if (cargando && !stats) {
    return (
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="h-4 w-48 animate-pulse rounded bg-muted" />
        <div className="mt-3 h-2 w-full animate-pulse rounded bg-muted" />
      </div>
    )
  }

  if (!stats) return null

  const pct = Math.min(100, Math.max(0, stats.pct))
  const critico = stats.exceeded || pct >= 90
  const aviso = !critico && pct >= 75

  return (
    <section
      className={cn(
        "rounded-xl border bg-card p-4",
        critico ? "border-destructive/50" : aviso ? "border-amber-500/50" : "border-border"
      )}
      aria-label="Uso de almacenamiento"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <HardDrive className={cn("h-4 w-4", critico ? "text-destructive" : aviso ? "text-amber-600" : "text-muted-foreground")} />
          <h2 className="text-sm font-semibold">Almacenamiento del portal</h2>
        </div>
        <button
          type="button"
          onClick={() => void recargar()}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <RefreshCw className={cn("h-3 w-3", cargando && "animate-spin")} />
          Actualizar
        </button>
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-2 text-sm">
        <span className="font-medium tabular-nums">
          {formatearMB(stats.usado_bytes)}
          <span className="font-normal text-muted-foreground"> de {formatearMB(stats.cuota_bytes)}</span>
        </span>
        <span className={cn("text-xs font-medium tabular-nums", critico ? "text-destructive" : aviso ? "text-amber-600" : "text-muted-foreground")}>
          {pct}% usado
        </span>
      </div>

      <div
        className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Uso de almacenamiento: ${pct}%`}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all",
            critico ? "bg-destructive" : aviso ? "bg-amber-500" : "bg-primary"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>

      {critico && (
        <p className="mt-2 text-xs text-destructive">
          {stats.exceeded
            ? "Se alcanzó el límite. Las nuevas subidas будут rechazadas hasta liberar espacio."
            : "Queda muy poco espacio. Las nuevas subidas fallarán pronto."}
        </p>
      )}

      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-4">
        {stats.por_bucket.map((b) => (
          <div key={b.bucket} className="min-w-0">
            <dt className="truncate text-muted-foreground">{ETIQUETAS[b.bucket] ?? b.bucket}</dt>
            <dd className="tabular-nums">
              {formatearMB(b.bytes)}
              <span className="text-muted-foreground"> · {b.objetos} obj.</span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
