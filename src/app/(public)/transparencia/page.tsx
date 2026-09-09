"use client"

import { useCallback, useEffect, useMemo, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { cn, formatDate } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import PageHeader from "@/components/layout/page-header"
import { IconBox } from "@/components/ui/icon-box"
import { FileText, Download, Calendar, Search, FolderOpen, FileCheck2, Eye, Gavel } from "@/lib/icons"
import { createClient } from "@/lib/supabase/client"
import type { Transparencia } from "@/types"

const CATEGORIA_LABEL: Record<string, string> = {
  presupuesto: "Presupuesto", poa: "POA", pei: "PEI", contratacion: "Contratación",
  auditoria: "Auditoría", financiero: "Financiero", declaracion: "Declaración", informe: "Informe",
}

const categoryColors: Record<string, string> = {
  presupuesto: "bg-primary text-primary-foreground",
  poa: "bg-primary text-primary-foreground",
  pei: "bg-primary text-primary-foreground",
  contratacion: "bg-primary text-primary-foreground",
  auditoria: "bg-primary text-primary-foreground",
  financiero: "bg-primary text-primary-foreground",
  declaracion: "bg-primary text-primary-foreground",
  informe: "bg-primary text-primary-foreground",
}

function categoriaDesdeQuery(param: string | null): string {
  if (!param) return "Todos"
  if (CATEGORIA_LABEL[param]) return CATEGORIA_LABEL[param]
  const lower = param.toLowerCase()
  return Object.values(CATEGORIA_LABEL).find((l) => l.toLowerCase() === lower) ?? "Todos"
}

function TransparenciaContent() {
  const searchParams = useSearchParams()
  const [documents, setDocuments] = useState<Transparencia[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState(() => categoriaDesdeQuery(searchParams.get("categoria")))
  const [search, setSearch] = useState("")
  const supabase = createClient()

  const fetchDocuments = useCallback(async () => {
    const { data, error } = await supabase
      .from("transparencia")
      .select("*")
      .eq("publicada", true)
      .order("fecha", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
    if (error) {
      setError(error.message)
    } else {
      setDocuments(data || [])
      setError(null)
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    const run = async () => {
      await fetchDocuments()
    }
    run()
  }, [fetchDocuments])

  const categories = useMemo(() => {
    const set = new Set<string>()
    documents.forEach((d) => set.add(CATEGORIA_LABEL[d.categoria] || d.categoria))
    return ["Todos", ...Array.from(set)]
  }, [documents])

  const filtered = documents.filter((doc) => {
    const matchCategory = activeCategory === "Todos" || (CATEGORIA_LABEL[doc.categoria] || doc.categoria) === activeCategory
    const q = search.toLowerCase()
    const matchSearch = !q ||
      doc.titulo.toLowerCase().includes(q) ||
      (doc.descripcion || "").toLowerCase().includes(q)
    return matchCategory && matchSearch
  })

  return (
    <div className="pb-16">
      <PageHeader
        title="Transparencia Municipal"
        description="Accedé a la información pública del Gobierno Autónomo Municipal de Mairana: presupuestos, planes, auditorías y más documentos de interés público, en cumplimiento de la Ley N° 482 y la Ley N° 341."
        crumbs={[{ label: "Transparencia" }]}
        icon={
          <Image
            src="/images/transparencia-ley341.png"
            alt="Logo Transparencia Ley 341"
            width={48}
            height={48}
            className="hidden h-12 w-12 rounded-xl border border-border/60 bg-white object-contain p-1 shadow-sm sm:block"
          />
        }
      >
        <div className="flex items-center gap-2 rounded-xl border border-primary/15 bg-card/80 px-4 py-2 backdrop-blur">
          <FileCheck2 className="h-4 w-4 text-primary" />
          <span className="text-2xl font-extrabold font-serif text-foreground">{documents.length}</span>
          <span className="text-xs text-muted-foreground">documentos públicos</span>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-2 backdrop-blur">
          <Eye className="h-4 w-4 text-emerald-600" />
          <span className="text-xs font-medium text-foreground">Acceso libre y gratuito</span>
        </div>
        <Link
          href="/contrataciones"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "flex items-center gap-2 rounded-xl border-primary/30 px-4 py-2 backdrop-blur"
          )}
        >
          <Gavel className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium text-foreground">Ver Contrataciones Públicas</span>
        </Link>
      </PageHeader>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-8">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar documentos..."
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
      ) : error ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground/50 mb-3" />
          <p className="text-lg font-medium text-foreground">Error al cargar</p>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 text-center">
          <FolderOpen className="h-12 w-12 text-muted-foreground/50 mb-3" />
          <p className="text-lg font-medium text-foreground">No se encontraron documentos</p>
          <p className="text-sm text-muted-foreground mt-1">Intentá con otros filtros o términos de búsqueda</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((doc) => (
            <Card key={doc.id} className="group transition-all duration-300 hover:-translate-y-1 hover:shadow-lifted">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <IconBox size="md" className="transition-transform duration-300 group-hover:scale-110 group-hover:shadow-sm">
                    <FileText className="h-5 w-5" />
                  </IconBox>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="line-clamp-2 font-semibold text-card-foreground">{doc.titulo}</h3>
                      {doc.archivo_pdf && (
                        <a
                          href={doc.archivo_pdf}
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
                    {doc.descripcion && (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{doc.descripcion}</p>
                    )}
                    <div className="mt-3 flex items-center gap-3">
                      <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", categoryColors[doc.categoria])}>
                        {CATEGORIA_LABEL[doc.categoria] || doc.categoria}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {doc.fecha ? formatDate(doc.fecha, "long") : "-"}
                      </span>
                    </div>
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

export default function TransparenciaPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-7xl px-4 py-16 text-center text-muted-foreground">
        Cargando Transparencia...
      </div>
    }>
      <TransparenciaContent />
    </Suspense>
  )
}
