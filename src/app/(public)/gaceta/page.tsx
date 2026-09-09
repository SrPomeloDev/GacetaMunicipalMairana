"use client"

import { useCallback, useEffect, useMemo, useRef, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { cn, formatDate, getEstadoColor, getEstadoLabel } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { Select } from "@/components/ui/select"
import { Pagination } from "@/components/ui/pagination"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { NormativaCard } from "@/components/normativa/normativa-card"
import { Reveal } from "@/components/ui/reveal"
import type { Normativa, CategoriaNormativa } from "@/types"
import {
  Search,
  SlidersHorizontal,
  X,
  Filter,
  FileText,
  ShieldCheck,
  ArrowRight,
  Landmark,
  MessageCircle,
  ScrollText,
} from "@/lib/icons"

const estadoOptions = [
  { value: "vigente", label: "Vigente" },
  { value: "derogada", label: "Derogada" },
  { value: "modificada", label: "Modificada" },
  { value: "suspendida", label: "Suspendida" },
  { value: "abrogada", label: "Abrogada" },
]

const PAGE_SIZE = 12

function GacetaContent() {
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
  const [vista, setVista] = useState<"cards" | "lista">("cards")
  const searchRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const categoriaOptions = categorias.map((c) => ({ value: c.slug, label: c.nombre }))

  useEffect(() => {
    if (searchParams.get("buscar") === "1" || searchParams.get("q")) {
      setTimeout(() => searchRef.current?.focus(), 150)
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
      setError(null)
    }
    if (!catRes.error) {
      setCategorias(catRes.data || [])
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    const run = async () => { await fetchData() }
    run()
  }, [fetchData])

  const catById = useMemo(() => {
    const map: Record<string, CategoriaNormativa> = {}
    categorias.forEach((c) => { map[c.id] = c })
    return map
  }, [categorias])

  const activeFilters: { label: string; key: string }[] = []
  if (categoria) activeFilters.push({ label: categoriaOptions.find(o => o.value === categoria)?.label || categoria, key: "categoria" })
  if (estado) activeFilters.push({ label: estadoOptions.find(o => o.value === estado)?.label || estado, key: "estado" })
  if (fechaDesde || fechaHasta) {
    activeFilters.push({ label: `Fecha: ${[fechaDesde, fechaHasta].filter(Boolean).join(" - ")}`, key: "fecha" })
  }

  const removeFilter = (key: string) => {
    if (key === "categoria") setCategoria("")
    if (key === "estado") setEstado("")
    if (key === "fecha") { setFechaDesde(""); setFechaHasta("") }
  }

  const clearAll = () => {
    setCategoria(""); setEstado(""); setFechaDesde(""); setFechaHasta(""); setSearch("")
  }

  const filteredResults = useMemo(() => {
    return normativas.filter((item) => {
      if (search) {
        const q = search.toLowerCase()
        const match =
          item.titulo.toLowerCase().includes(q) ||
          item.numero.toLowerCase().includes(q) ||
          (item.resumen?.toLowerCase().includes(q) ?? false)
        if (!match) return false
      }
      if (categoria) {
        const cat = catById[item.categoria_id ?? '']
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
    <div className="pb-20">
      {/* Hero */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-28 lg:pt-36">
        <Image
          src="/images/plaza.jpg"
          alt=""
          aria-hidden
          fill
          sizes="100vw"
          className="absolute inset-0 h-full w-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background" aria-hidden />
        <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-[radial-gradient(closest-side,rgba(234,88,12,0.15),transparent_70%)]" aria-hidden />

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <Reveal>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-card/80 px-4 py-2 text-xs font-semibold text-primary shadow-sm backdrop-blur-md">
              <ShieldCheck className="h-4 w-4" />
              <span>Publicación Oficial con Validez Jurídica</span>
              <span className="text-primary/40">•</span>
              <span className="text-muted-foreground">G.A.M. Mairana</span>
            </div>
          </Reveal>

          <Reveal>
            <h1 className="font-serif text-4xl font-extrabold leading-none tracking-tight text-foreground sm:text-6xl">
              Gaceta <span className="text-primary">Municipal Oficial</span>
            </h1>
          </Reveal>

          <Reveal>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Repositorio oficial de Leyes Municipales, Ordenanzas y Decretos Ediles del
              Gobierno Autónomo Municipal de Mairana — Provincia Florida, Santa Cruz.
            </p>
          </Reveal>

          {/* Buscador principal */}
          <Reveal>
            <div className="mx-auto mt-10 max-w-2xl">
              <div className="relative flex items-center">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
                  placeholder="Buscar por Ley, Decreto, Ordenanza, palabra clave..."
                  className="w-full rounded-2xl border border-white/50 bg-white/80 py-4 pl-12 pr-4 text-sm text-foreground shadow-lg shadow-primary/5 backdrop-blur-xl placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-white/10 dark:bg-white/10"
                />
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-muted-foreground/70">Atajos:</span>
                {categorias.slice(0, 3).map((cat) => (
                  <button
                    key={cat.slug}
                    onClick={() => { setCategoria(cat.slug); setCurrentPage(1) }}
                    className={cn(
                      "rounded-full border px-3 py-1.5 shadow-sm backdrop-blur-md transition-colors",
                      categoria === cat.slug
                        ? "border-primary/50 bg-primary text-primary-foreground"
                        : "border-white/50 bg-white/75 hover:border-primary/50 hover:text-primary dark:border-white/10 dark:bg-white/10"
                    )}
                  >
                    {cat.nombre}
                  </button>
                ))}
                {categoria && (
                  <button
                    onClick={() => setCategoria("")}
                    className="flex items-center gap-1 rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-destructive transition-colors hover:bg-destructive/20"
                  >
                    <X className="h-3 w-3" /> Quitar filtro
                  </button>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Última promulgación destacada */}
      {!loading && normativas.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/10 via-amber-500/5 to-transparent p-6 sm:p-8">
            <Reveal>
              <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground shadow-sm shadow-primary/30">
                    <ScrollText className="h-3.5 w-3.5" />
                    <span>Última publicación</span>
                  </div>
                  <h3 className="font-serif text-xl font-bold text-foreground">
                    {normativas[0].numero && `N° ${normativas[0].numero} — `}{normativas[0].titulo}
                  </h3>
                  {normativas[0].resumen && (
                    <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
                      {normativas[0].resumen}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {normativas[0].fecha_publicacion
                      ? `Publicada el ${new Date(normativas[0].fecha_publicacion).toLocaleDateString("es-BO", { day: "numeric", month: "long", year: "numeric" })}`
                      : "Publicación reciente en la Gaceta Oficial"}
                  </p>
                </div>
                <Link href={`/normativa/${normativas[0].slug}`} className="shrink-0">
                  <Button className="gap-2 font-bold shadow-md shadow-primary/30">
                    <FileText className="h-4 w-4" />
                    Ver Normativa
                  </Button>
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* Buscador + Listado */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <span className="heading-kicker">Repositorio Legal</span>
            <h2 className="mt-1 font-serif text-2xl font-extrabold text-foreground">Todas las Normativas</h2>
            <div className="section-heading-line" />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className={cn("gap-2 text-xs font-semibold", showFilters && "bg-primary text-primary-foreground border-primary")}
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filtros
              {activeFilters.length > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary-foreground text-xs font-bold text-primary">
                  {activeFilters.length}
                </span>
              )}
            </Button>
          </div>
        </div>

        {showFilters && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Select
                  placeholder="Categoría"
                  options={categoriaOptions}
                  value={categoria}
                  onChange={(e) => { setCategoria(e.target.value); setCurrentPage(1) }}
                />
                <Select
                  placeholder="Estado"
                  options={estadoOptions}
                  value={estado}
                  onChange={(e) => { setEstado(e.target.value); setCurrentPage(1) }}
                />
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Desde</label>
                  <input
                    type="date"
                    value={fechaDesde}
                    onChange={(e) => { setFechaDesde(e.target.value); setCurrentPage(1) }}
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Hasta</label>
                  <input
                    type="date"
                    value={fechaHasta}
                    onChange={(e) => { setFechaHasta(e.target.value); setCurrentPage(1) }}
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            {activeFilters.map((f) => (
              <span
                key={f.key}
                className="inline-flex items-center gap-1 rounded-full border bg-primary px-3 py-1 text-xs font-medium text-primary-foreground"
              >
                {f.label}
                <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => removeFilter(f.key)} />
              </span>
            ))}
            <button onClick={clearAll} className="text-xs text-muted-foreground underline hover:text-foreground">
              Limpiar todo
            </button>
          </div>
        )}

        <div className="space-y-3">
          {loading ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Landmark className="h-12 w-12 animate-pulse text-muted-foreground/40" />
                <p className="mt-4 text-lg font-medium text-foreground">Cargando Gaceta...</p>
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
            <>
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  {filteredResults.length} {filteredResults.length === 1 ? "norma encontrada" : "normas encontradas"}
                </p>
                <div className="inline-flex shrink-0 rounded-lg border border-border bg-card p-0.5" role="tablist" aria-label="Vista de resultados">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={vista === "cards"}
                    onClick={() => setVista("cards")}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                      vista === "cards" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Tarjetas
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={vista === "lista"}
                    onClick={() => setVista("lista")}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                      vista === "lista" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Sumario
                  </button>
                </div>
              </div>
              {vista === "lista" ? (
                <div className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/70 bg-card shadow-card">
                  {pageItems.map((item) => {
                    const cat = catById[item.categoria_id ?? ""]
                    return (
                      <Link
                        key={item.id}
                        href={`/normativa/${item.slug}`}
                        className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/50 sm:gap-4 sm:px-5"
                      >
                        <span className="hidden w-24 shrink-0 font-mono text-xs font-bold text-primary sm:block">
                          {item.numero || "s/n"}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-card-foreground transition-colors group-hover:text-primary">
                            {item.titulo}
                          </span>
                          <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
                            <span className="font-mono font-bold text-primary sm:hidden">{item.numero || "s/n"}</span>
                            <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold", getEstadoColor(item.estado))}>
                              {getEstadoLabel(item.estado)}
                            </span>
                            {cat && <span className="truncate">{cat.nombre}</span>}
                            <span>{formatDate(item.fecha_publicacion ?? new Date().toISOString(), "short")}</span>
                          </span>
                        </span>
                        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
                      </Link>
                    )
                  })}
                </div>
              ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {pageItems.map((item) => {
                const cat = catById[item.categoria_id ?? '']
                return (
                  <Reveal key={item.id}>
                    <NormativaCard
                      normativa={{
                        numero: item.numero,
                        titulo: item.titulo,
                        slug: item.slug,
                        estado: item.estado,
                        categoria: cat ? { nombre: cat.nombre } : null,
                        fecha_publicacion: item.fecha_publicacion ?? new Date().toISOString(),
                        resumen: item.resumen,
                        archivo_pdf: item.archivo_pdf,
                      }}
                    />
                  </Reveal>
                )
              })}
            </div>
              )}
            </>
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

        <div className="mt-10 flex justify-center">
          <Link href="/">
            <Button variant="outline" className="gap-2 border-primary/30 text-xs font-semibold hover:bg-primary/10">
              <ArrowRight className="h-3.5 w-3.5 rotate-180" />
              Volver al Portal Municipal
            </Button>
          </Link>
        </div>
      </section>

      {/* Asistente virtual */}
      <section className="mx-auto max-w-7xl px-4 pb-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/10 via-amber-500/5 to-transparent p-6 sm:p-8">
            <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground shadow-sm shadow-primary/30">
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>Consulta de normativa</span>
                </div>
                <h3 className="font-serif text-xl font-bold text-foreground">
                  ¿Dudas sobre una norma o trámite?
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Orientación sobre leyes, decretos, ordenanzas, trámites y transparencia municipal.
                </p>
              </div>
              <div className="shrink-0">
                <Link href="/asistente">
                  <Button className="gap-2 font-bold shadow-md shadow-primary/30">
                    <MessageCircle className="h-4 w-4" />
                    Abrir consulta
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  )
}

export default function GacetaPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-7xl px-4 py-16 text-center text-muted-foreground">
        Cargando Gaceta Oficial...
      </div>
    }>
      <GacetaContent />
    </Suspense>
  )
}
