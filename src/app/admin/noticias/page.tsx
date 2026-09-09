"use client"

import { useCallback, useEffect, useMemo, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SearchInput } from "@/components/ui/search-input"
import { Select } from "@/components/ui/select"
import { DataTable } from "@/components/ui/data-table"
import { Pagination } from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { useToast } from "@/components/ui/toast"
import { formatDate } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useCurrentUser, can } from "@/hooks/use-current-user"
import { ExternalLink, Pencil, Plus, Trash2 } from "lucide-react"
import type { Column } from "@/components/ui/data-table"
import type { Noticia } from "@/types"

const CATEGORIA_LABEL: Record<string, string> = {
  institucional: "Institucional", evento: "Evento", programa: "Programa",
  comunicado: "Comunicado", cultura: "Cultura",
}

const PAGE_SIZE = 20
const LIST_COLUMNS = "id,titulo,slug,categoria,publicada,destacada,fecha_publicacion,created_at"

function NoticiasListContent() {
  const searchParams = useSearchParams()
  const { user } = useCurrentUser()
  const puedePublicar = can(user, "noticias", "publicar")
  const [noticias, setNoticias] = useState<Noticia[]>([])
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [sortColumn, setSortColumn] = useState("fecha_publicacion")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [categoriaFilter, setCategoriaFilter] = useState("todas")
  const [publicadaFilter, setPublicadaFilter] = useState(() =>
    searchParams.get("publicada") === "false" ? "no" : "todas"
  )
  const [destacadaFilter, setDestacadaFilter] = useState("todas")
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Noticia | null>(null)
  const { addToast } = useToast()
  const supabase = useMemo(() => createClient(), [])

  const fetchNoticias = useCallback(async () => {
    setLoading(true)
    let query = supabase.from("noticias").select(LIST_COLUMNS, { count: "exact" })
    const q = search.trim().replace(/[%(),]/g, "")
    if (q) {
      query = query.or(`titulo.ilike.%${q}%,resumen.ilike.%${q}%`)
    }
    if (categoriaFilter !== "todas") query = query.eq("categoria", categoriaFilter as Noticia["categoria"])
    if (publicadaFilter !== "todas") query = query.eq("publicada", publicadaFilter === "si")
    if (destacadaFilter !== "todas") query = query.eq("destacada", destacadaFilter === "si")
    query = query.order(sortColumn, { ascending: sortDirection === "asc", nullsFirst: false })
    const from = (page - 1) * PAGE_SIZE
    const { data, error, count } = await query.range(from, from + PAGE_SIZE - 1)
    if (error) {
      addToast(error.message, "error")
    } else {
      setNoticias((data as Noticia[]) ?? [])
      setTotalCount(count ?? 0)
    }
    setLoading(false)
  }, [supabase, addToast, page, search, categoriaFilter, publicadaFilter, destacadaFilter, sortColumn, sortDirection])

  useEffect(() => {
    const run = async () => {
      await fetchNoticias()
    }
    run()
  }, [fetchNoticias])

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 300)
    return () => clearTimeout(t)
  }, [searchInput])

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
    setPage(1)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    const { error } = await supabase.from("noticias").delete().eq("id", deleteTarget.id)
    if (error) {
      addToast(error.message, "error")
    } else {
      addToast("Noticia eliminada", "success")
      setDeleteTarget(null)
      if (noticias.length === 1 && page > 1) {
        setPage(page - 1)
      } else {
        fetchNoticias()
      }
    }
  }

  const togglePublicada = async (noticia: Noticia) => {
    if (togglingId) return
    if (!puedePublicar) {
      addToast("No tienes permiso para publicar noticias", "error")
      return
    }
    setTogglingId(noticia.id)
    try {
      const { error } = await supabase
        .from("noticias")
        .update({ publicada: !noticia.publicada })
        .eq("id", noticia.id)
      if (error) {
        addToast(error.message, "error")
      } else {
        addToast(noticia.publicada ? "Noticia despublicada" : "Noticia publicada", "success")
        fetchNoticias()
      }
    } finally {
      setTogglingId(null)
    }
  }

  const toggleDestacada = async (noticia: Noticia) => {
    if (togglingId) return
    setTogglingId(noticia.id)
    try {
      const { error } = await supabase
        .from("noticias")
        .update({ destacada: !noticia.destacada })
        .eq("id", noticia.id)
      if (error) {
        addToast(error.message, "error")
      } else {
        addToast(noticia.destacada ? "Quitada de destacadas" : "Marcada como destacada", "success")
        fetchNoticias()
      }
    } finally {
      setTogglingId(null)
    }
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  const columns: Column<Noticia>[] = [
    { key: "titulo", label: "Título", sortable: true, render: (val) => (
      <span className="font-medium truncate max-w-xs block">{val}</span>
    )},
    { key: "categoria", label: "Categoría", render: (val) => (
      <Badge variant="outline">{CATEGORIA_LABEL[val] || val}</Badge>
    )},
    { key: "publicada", label: "Estado", render: (_val, row) => (
      <Button
        variant={row.publicada ? "success" : "secondary"}
        size="sm"
        onClick={() => togglePublicada(row)}
        disabled={togglingId === row.id || !puedePublicar}
        title={puedePublicar ? (row.publicada ? "Hacer clic para despublicar" : "Hacer clic para publicar") : "Sin permiso para publicar"}
      >
        {row.publicada ? "Publicada" : "Borrador"}
      </Button>
    )},
    { key: "destacada", label: "Destacada", render: (_val, row) => (
      <Button
        variant={row.destacada ? "success" : "secondary"}
        size="sm"
        onClick={() => toggleDestacada(row)}
        disabled={togglingId === row.id}
        title={row.destacada ? "Quitar de destacadas" : "Marcar como destacada"}
      >
        {row.destacada ? "Destacada" : "No"}
      </Button>
    )},
    { key: "fecha_publicacion", label: "Fecha", sortable: true, render: (val) => val ? formatDate(val, "short") : "-" },
    { key: "created_at", label: "Creada", sortable: true, render: (val) => val ? formatDate(val, "short") : "-" },
    { key: "acciones", label: "Acciones", render: (_val, row) => (
      <div className="flex gap-1">
        <Link href={`/noticias/${(row as Noticia).slug}`} target="_blank">
          <Button variant="ghost" size="icon-sm" aria-label="Ver" title="Ver">
            <ExternalLink className="h-4 w-4" />
          </Button>
        </Link>
        <Link href={`/admin/noticias/${(row as Noticia).id}`}>
          <Button variant="outline" size="icon-sm" aria-label="Editar" title="Editar">
            <Pencil className="h-4 w-4" />
          </Button>
        </Link>
        <Button variant="ghost" size="icon-sm" aria-label="Eliminar" title="Eliminar" className="text-destructive hover:text-destructive" onClick={() => setDeleteTarget(row as Noticia)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    )},
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Noticias</h1>
        <Link href="/admin/noticias/nueva">
          <Button><Plus className="h-4 w-4" />Nueva Noticia</Button>
        </Link>
      </div>
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <div className="flex-1">
          <SearchInput value={searchInput} onChange={setSearchInput} placeholder="Buscar noticia..." />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Select
            className="sm:w-48"
            value={categoriaFilter}
            onChange={(e) => { setCategoriaFilter(e.target.value); setPage(1) }}
            options={[{ value: "todas", label: "Todas las categorías" }, ...Object.entries(CATEGORIA_LABEL).map(([value, label]) => ({ value, label }))]}
          />
          <Select
            className="sm:w-44"
            value={publicadaFilter}
            onChange={(e) => { setPublicadaFilter(e.target.value); setPage(1) }}
            options={[
              { value: "todas", label: "Todas" },
              { value: "si", label: "Publicadas" },
              { value: "no", label: "Borradores" },
            ]}
          />
          <Select
            className="sm:w-44"
            value={destacadaFilter}
            onChange={(e) => { setDestacadaFilter(e.target.value); setPage(1) }}
            options={[
              { value: "todas", label: "Todas" },
              { value: "si", label: "Destacadas" },
              { value: "no", label: "No destacadas" },
            ]}
          />
        </div>
      </div>
      <DataTable
        columns={columns}
        data={noticias}
        onSort={handleSort}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        loading={loading}
      />
      <div className="flex flex-col items-center gap-2">
        <p className="text-sm text-muted-foreground">Mostrando {noticias.length} de {totalCount} registros</p>
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar noticia"
        description={`¿Seguro que deseas eliminar "${deleteTarget?.titulo}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

export default function NoticiasListPage() {
  return (
    <Suspense fallback={<div className="space-y-4">Cargando noticias...</div>}>
      <NoticiasListContent />
    </Suspense>
  )
}
