"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Pagination } from "@/components/ui/pagination"
import { Card, CardContent } from "@/components/ui/card"
import PageHeader from "@/components/layout/page-header"
import { Reveal } from "@/components/ui/reveal"
import { Image as ImageIcon, Calendar, ArrowRight, Newspaper, Megaphone } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Noticia } from "@/types"

const CATEGORIA_LABEL: Record<string, string> = {
  institucional: "Institucional", evento: "Evento", programa: "Programa",
  comunicado: "Comunicado", cultura: "Cultura",
}

const PAGE_SIZE = 9

export default function NoticiasPage() {
  const [noticias, setNoticias] = useState<Noticia[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState("Todas")
  const [currentPage, setCurrentPage] = useState(1)
  const supabase = createClient()

  const fetchNoticias = useCallback(async () => {
    const { data, error } = await supabase
      .from("noticias")
      .select("*")
      .eq("publicada", true)
      .order("fecha_publicacion", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
    if (!error && data) setNoticias(data)
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    const run = async () => {
      await fetchNoticias()
    }
    run()
  }, [fetchNoticias])

  const categories = useMemo(() => {
    const set = new Set<string>()
    noticias.forEach((n) => set.add(CATEGORIA_LABEL[n.categoria] || n.categoria))
    return ["Todas", ...Array.from(set)]
  }, [noticias])

  const filtered = useMemo(() => {
    return activeCategory === "Todas"
      ? noticias
      : noticias.filter((n) => (CATEGORIA_LABEL[n.categoria] || n.categoria) === activeCategory)
  }, [noticias, activeCategory])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const page = Math.min(currentPage, totalPages)
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="pb-16">
      <PageHeader
        title="Noticias del Municipio"
        description="Mantenete informado sobre las últimas novedades, eventos y comunicados oficiales del Gobierno Autónomo Municipal de Mairana."
        crumbs={[{ label: "Noticias" }]}
        icon={<Megaphone className="hidden h-8 w-8 text-primary sm:block" />}
      >
        <div className="flex items-center gap-2 rounded-xl border border-primary/15 bg-card/80 px-4 py-2 backdrop-blur">
          <Newspaper className="h-4 w-4 text-primary" />
          <span className="text-2xl font-extrabold font-serif text-foreground">{noticias.length}</span>
          <span className="text-xs text-muted-foreground">publicaciones</span>
        </div>
      </PageHeader>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap gap-2 pt-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => { setActiveCategory(cat); setCurrentPage(1) }}
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

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-0">
                <div className="aspect-video bg-muted/50 animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-4 w-24 rounded bg-muted/50 animate-pulse" />
                  <div className="h-5 w-3/4 rounded bg-muted/50 animate-pulse" />
                  <div className="h-4 w-full rounded bg-muted/40 animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center">
          <Newspaper className="h-12 w-12 text-muted-foreground/50 mb-3" />
          <p className="text-lg font-medium text-foreground">No hay noticias publicadas</p>
          <p className="text-sm text-muted-foreground mt-1">Las noticias publicadas desde el panel de administración aparecerán aquí.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pageItems.map((item, i) => (
            <Reveal key={item.id} delay={(i % 3) * 90}>
            <Link href={`/noticias/${item.slug}`}>
              <Card className="group h-full overflow-hidden hover:shadow-md">
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center overflow-hidden">
                  {item.imagen_principal ? (
                    <img
                      src={item.imagen_principal}
                      alt={item.titulo}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="h-10 w-10 text-muted-foreground/50" />
                  )}
                </div>
                <CardContent className="p-5">
                  <div className="mb-3 inline-block rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                    {CATEGORIA_LABEL[item.categoria] || item.categoria}
                  </div>
                  <h3 className="mb-2 text-lg font-semibold leading-snug text-card-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {item.titulo}
                  </h3>
                  {item.resumen && (
                    <p className="mb-4 text-sm leading-relaxed text-muted-foreground line-clamp-2">{item.resumen}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {item.fecha_publicacion
                        ? new Date(item.fecha_publicacion).toLocaleDateString("es-BO", { day: "numeric", month: "long", year: "numeric" })
                        : new Date(item.created_at).toLocaleDateString("es-BO", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                    <span className="flex items-center gap-1 text-sm font-medium text-primary">
                      Leer más <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
            </Reveal>
          ))}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="mt-8 text-center">
          <p className="mb-4 text-sm text-muted-foreground">
            Mostrando {pageItems.length} de {filtered.length} noticias
          </p>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
      </div>
    </div>
  )
}
