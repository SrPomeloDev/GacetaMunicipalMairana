"use client"

import { useCallback, useEffect, useMemo, useRef, useState, Suspense } from "react"
import { cn } from "@/lib/utils"
import { SearchInput } from "@/components/ui/search-input"
import { Select } from "@/components/ui/select"
import { Pagination } from "@/components/ui/pagination"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, SlidersHorizontal, X, Filter, Download, Eye } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { formatDate, getEstadoColor, getEstadoLabel } from "@/lib/utils"
import type { Normativa, CategoriaNormativa } from "@/types"

const estadoOptions = [
  { value: "vigente", label: "Vigente" },
  { value: "derogada", label: "Derogada" },
  { value: "modificada", label: "Modificada" },
  { value: "suspendida", label: "Suspendida" },
  { value: "abrogada", label: "Abrogada" },
]

const PAGE_SIZE = 10

function NormativaContent() {
  const searchParams = useSearchParams()
  const [normativas, setNormativas] = useState<Normativa[]>([])
  const [categorias, setCategorias] = useState<CategoriaNormativa[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState(searchParams.get("q") ?? "")
  const [categoria, setCategoria] = useState(searchParams.get("categoria") ?? "")
  const [estado, setEstado] = useState(searchParams.get("estado") ?? "")
  const [fechaDesde, setFechaDesde] = useState("")
  const [fechaHasta, setFechaHasta] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const categoriaOptions = categorias.map((c) => ({ value: c.slug, label: c.nombre }))

  useEffect(() => {
    if (searchParams.get("buscar") === "1" || searchParams.get("q")) {
      setTimeout(() => searchRef.current?.focus(), 100)
    }
  }, [searchParams])

  const fetchData = useCallback(async () => {
    const [normativaRes, catRes] = await Promise.all([
      supabase
        .from("normativa")
        .select("*")
        .eq("publicada", true)
        .order("fecha_publicacion", { ascending: false, nullsFirst: false }),
      supabase.from("categorias_normativa").select("*").order("orden"),
    ])
    if (normativaRes.error) {
      setError(normativaRes.error.message)
    } else {
      setNormativas(normativaRes.data || [])
    }
    if (catRes.error) {
      setError(catRes.error.message)
    } else {
      setCategorias(catRes.data || [])
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    const run = async () => {
      await fetchData()
    }
    run()
  }, [fetchData])

  const catById = useMemo(() => {
    const map: Record<string, CategoriaNormativa> = {}
    categorias.forEach((c) => { map[c.id] = c })
    return map
  }, [categorias])

  const activeFilters: { label: string; key: string }[] = []
  if (categoria) activeFilters.push({
    label: categoriaOptions.find(o => o.value === categoria)?.label || categoria,
    key: "categoria",
  })
  if (estado) activeFilters.push({
    label: estadoOptions.find(o => o.value === estado)?.label || estado,
    key: "estado",
  })
  if (fechaDesde || fechaHasta) {
    const r = [fechaDesde, fechaHasta].filter(Boolean).join(" - ")
    activeFilters.push({ label: `Fecha: ${r}`, key: "fecha" })
  }

  const removeFilter = (key: string) => {
    if (key === "categoria") setCategoria("")
    if (key === "estado") setEstado("")
    if (key === "fecha") { setFechaDesde(""); setFechaHasta("") }
  }

  const clearAll = () => {
    setCategoria("")
    setEstado("")
    setFechaDesde("")
    setFechaHasta("")
    setSearch("")
  }

  const filteredResults = useMemo(() => {
    return normativas.filter((item) => {
      if (search) {
        const q = search.toLowerCase()
        const match = item.titulo.toLowerCase().includes(q) ||
          item.numero.toLowerCase().includes(q) ||
          (item.resumen?.toLowerCase().includes(q) ?? false)
        if (!match) return false
      }
      if (categoria) {
        const cat = catById[item.categoria_id]
        if (!cat || cat.slug !== categoria) return false
      }
      if (estado && item.estado !== estado) return false
      if (fechaDesde && item.fecha_publicacion && item.fecha_publicacion < fechaDesde) return false
      if (fechaHasta && item.fecha_publicacion && item.fecha_publicacion > fechaHasta) return false
      return true
    })
  }, [normativas, search, categoria, estado, fechaDesde, fechaHasta, catById])

  const totalPages = Math.max(1, Math.ceil(filteredResults.length / PAGE_SIZE))
  const page = Math.min(currentPage, totalPages)
  const pageItems = filteredResults.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground font-serif">Normativa Municipal</h1>
        <div className="mt-2 h-1 w-20 rounded-full bg-primary" />
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Consultá la base de datos de leyes, decretos, ordenanzas y resoluciones municipales del Gobierno Autónomo Municipal de Mairana.
        </p>
      </div>

      <div className="mb-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <SearchInput
              ref={searchRef}
              placeholder="Buscar por título, número o contenido..."
              value={search}
              onChange={setSearch}
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            className={cn(showFilters && "bg-primary text-primary-foreground")}
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {showFilters && (
          <Card>
            <CardContent className="p-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Select
                  placeholder="Categoría"
                  options={categoriaOptions}
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                />
                <Select
                  placeholder="Estado"
                  options={estadoOptions}
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                />
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Desde</label>
                  <input
                    type="date"
                    value={fechaDesde}
                    onChange={(e) => setFechaDesde(e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Hasta</label>
                  <input
                    type="date"
                    value={fechaHasta}
                    onChange={(e) => setFechaHasta(e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <Button variant="ghost" size="sm" onClick={clearAll}>
                  <X className="mr-1 h-3 w-3" /> Limpiar filtros
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            {activeFilters.map((f) => (
              <span
                key={f.key}
                className="inline-flex items-center gap-1 rounded-full border bg-primary/5 px-3 py-1 text-xs font-medium text-primary"
              >
                {f.label}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={() => removeFilter(f.key)}
                />
              </span>
            ))}
            <button
              onClick={clearAll}
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              Limpiar todo
            </button>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {loading ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/40 animate-pulse" />
              <p className="mt-4 text-lg font-medium text-foreground">Cargando normativa...</p>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/40" />
              <p className="mt-4 text-lg font-medium text-foreground">Error al cargar</p>
              <p className="mt-1 text-sm text-muted-foreground">{error}</p>
              <Button variant="outline" className="mt-4" onClick={() => { setLoading(true); fetchData() }}>
                Reintentar
              </Button>
            </CardContent>
          </Card>
        ) : filteredResults.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/40" />
              <p className="mt-4 text-lg font-medium text-foreground">Sin resultados</p>
              <p className="mt-1 text-sm text-muted-foreground">
                No se encontraron normativas con los filtros seleccionados.
              </p>
              <Button variant="outline" className="mt-4" onClick={clearAll}>
                Limpiar filtros
              </Button>
            </CardContent>
          </Card>
        ) : (
          pageItems.map((item) => {
            const cat = catById[item.categoria_id]
            return (
              <Card key={item.id} className="transition-all hover:shadow-md hover:-translate-y-0.5">
                <CardContent className="flex items-start gap-4 p-5">
                  <Link href={`/normativa/${item.slug}`} className="flex flex-1 min-w-0 items-start gap-4 group">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted-foreground">{item.numero}</p>
                      <h3 className="mt-0.5 font-semibold text-card-foreground truncate group-hover:text-primary transition-colors">{item.titulo}</h3>
                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">{cat?.nombre || "Normativa"}</span>
                        <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", getEstadoColor(item.estado))}>
                          {getEstadoLabel(item.estado)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {item.fecha_publicacion ? formatDate(item.fecha_publicacion, "short") : "-"}
                        </span>
                      </div>
                    </div>
                  </Link>
                  <div className="flex items-center gap-1 shrink-0">
                    <Link
                      href={`/normativa/${item.slug}`}
                      className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
                      aria-label="Ver normativa"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    {item.archivo_pdf && (
                      <a
                        href={item.archivo_pdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
                        aria-label="Descargar PDF"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {!loading && !error && filteredResults.length > 0 && (
        <div className="mt-8 text-center">
          <p className="mb-6 text-sm text-muted-foreground">
            Mostrando {pageItems.length} de {filteredResults.length} resultados
          </p>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  )
}

export default function NormativaPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 text-muted-foreground">Cargando...</div>}>
      <NormativaContent />
    </Suspense>
  )
}
