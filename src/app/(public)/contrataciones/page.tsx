"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { cn, formatDate } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import PageHeader from "@/components/layout/page-header"
import { Gavel, Download, Calendar, Search, FileText, BadgeCheck } from "lucide-react"
import type { Contratacion } from "@/types"

const TIPO_LABEL: Record<string, string> = {
  licitacion: "Licitación",
  apoyo_nacional: "Apoyo Nacional",
  compras_menores: "Compras Menores",
  contratacion_directa: "Contratación Directa",
  emergencia: "Emergencia",
}

const ESTADO_LABEL: Record<string, string> = {
  publicada: "En convocatoria",
  adjudicada: "Adjudicada",
  desierta: "Desierta",
  concluida: "Concluida",
}

const ESTADO_COLOR: Record<string, string> = {
  publicada: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  adjudicada: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  desierta: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  concluida: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
}

export default function ContratacionesPublicPage() {
  const [contrataciones, setContrataciones] = useState<Contratacion[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTipo, setActiveTipo] = useState("Todas")
  const [search, setSearch] = useState("")

  const fetchContrataciones = useCallback(async () => {
    const res = await fetch("/api/contrataciones")
    if (res.ok) {
      setContrataciones(await res.json())
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    const run = async () => {
      await fetchContrataciones()
    }
    run()
  }, [fetchContrataciones])

  const tipos = useMemo(() => {
    const set = new Set<string>()
    contrataciones.forEach((c) => set.add(TIPO_LABEL[c.tipo] || c.tipo))
    return ["Todas", ...Array.from(set)]
  }, [contrataciones])

  const filtered = contrataciones.filter((c) => {
    const matchTipo = activeTipo === "Todas" || (TIPO_LABEL[c.tipo] || c.tipo) === activeTipo
    const q = search.toLowerCase()
    const matchSearch = !q ||
      c.titulo.toLowerCase().includes(q) ||
      (c.objeto || "").toLowerCase().includes(q) ||
      (c.empresa_adjudicada || "").toLowerCase().includes(q)
    return matchTipo && matchSearch
  })

  return (
    <div className="pb-16">
      <PageHeader
        title="Contrataciones Públicas"
        description="Convocatorias para la contratación de bienes, obras y servicios del Gobierno Autónomo Municipal de Mairana, en el marco de la Ley N° 1178 y las normas del SABS."
        crumbs={[{ label: "Contrataciones" }]}
        icon={<Gavel className="hidden h-8 w-8 text-primary sm:block" />}
      >
        <div className="flex items-center gap-2 rounded-xl border border-primary/15 bg-card/80 px-4 py-2 backdrop-blur">
          <BadgeCheck className="h-4 w-4 text-primary" />
          <span className="text-2xl font-extrabold font-serif text-foreground">{contrataciones.length}</span>
          <span className="text-xs text-muted-foreground">convocatorias públicas</span>
        </div>
      </PageHeader>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-8">
          <div className="flex flex-wrap gap-2">
            {tipos.map((tipo) => (
              <button
                key={tipo}
                onClick={() => setActiveTipo(tipo)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  activeTipo === tipo
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                )}
              >
                {tipo}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar convocatorias..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-5">
                  <div className="h-5 w-3/4 rounded bg-muted animate-pulse" />
                  <div className="mt-3 h-4 w-full rounded bg-muted/60 animate-pulse" />
                  <div className="mt-3 h-4 w-1/2 rounded bg-muted/60 animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 text-center">
            <Gavel className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-lg font-medium text-foreground">No se encontraron convocatorias</p>
            <p className="text-sm text-muted-foreground mt-1">Revisá nuevamente más adelante o ajustá los filtros</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((c) => (
              <Card key={c.id} className="group transition-all hover:shadow-md">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-card-foreground">{c.titulo}</h3>
                        {c.archivo_pdf && (
                          <a
                            href={c.archivo_pdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            className={cn(
                              buttonVariants({ variant: "ghost", size: "icon-sm" }),
                              "shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                            )}
                            aria-label="Descargar documento"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                      {c.objeto && (
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{c.objeto}</p>
                      )}
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                          {TIPO_LABEL[c.tipo] || c.tipo}
                        </span>
                        <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", ESTADO_COLOR[c.estado])}>
                          {ESTADO_LABEL[c.estado] || c.estado}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {c.fecha_publicacion ? formatDate(c.fecha_publicacion, "short") : "-"}
                        </span>
                      </div>
                      {c.monto !== null && c.monto !== undefined && (
                        <p className="mt-2 text-sm font-mono font-medium text-foreground">
                          Bs. {c.monto.toLocaleString("es-BO", { minimumFractionDigits: 2 })}
                        </p>
                      )}
                      {c.empresa_adjudicada && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Adjudicado a: <span className="font-medium text-foreground">{c.empresa_adjudicada}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
