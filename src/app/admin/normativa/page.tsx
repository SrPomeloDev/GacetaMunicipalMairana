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
import { useCurrentUser } from "@/hooks/use-current-user"
import { formatDate, getEstadoColor, getEstadoLabel } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { Pencil, Plus, Trash2 } from "lucide-react"
import type { Column } from "@/components/ui/data-table"
import type { Normativa } from "@/types"

const PAGE_SIZE = 20
const ESTADOS = ["vigente", "derogada", "modificada", "suspendida", "abrogada"]
const LIST_COLUMNS = "id,numero,titulo,categoria_id,estado,fecha_publicacion,publicada,estado_aprobacion,motivo_rechazo,created_by"
const APROBACION_BADGES: Record<string, { label: string; className: string }> = {
  pendiente: { label: "Pendiente", className: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" },
  aprobado: { label: "Aprobada", className: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300" },
  rechazado: { label: "Rechazada", className: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" },
}

function NormativaListContent() {
  const searchParams = useSearchParams()
  const { user } = useCurrentUser()
  const [normativas, setNormativas] = useState<Normativa[]>([])
  const [categorias, setCategorias] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [sortColumn, setSortColumn] = useState("fecha_publicacion")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [estadoFilter, setEstadoFilter] = useState("todas")
  const [categoriaFilter, setCategoriaFilter] = useState("todas")
  const [publicadaFilter, setPublicadaFilter] = useState(() =>
    searchParams.get("publicada") === "false" ? "no" : "todas"
  )
  const [aprobacionFilter, setAprobacionFilter] = useState(() => {
    const v = searchParams.get("estado_aprobacion")
    return v === "pendiente" || v === "rechazado" || v === "aprobado" ? v : "todas"
  })
  const [deleteTarget, setDeleteTarget] = useState<Normativa | null>(null)
  const { addToast } = useToast()
  const supabase = useMemo(() => createClient(), [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    let query = supabase.from("normativa").select(LIST_COLUMNS, { count: "exact" })
    const q = search.trim().replace(/[%(),]/g, "")
    if (q) {
      query = query.or(`titulo.ilike.%${q}%,numero.ilike.%${q}%`)
    }
    if (estadoFilter !== "todas") query = query.eq("estado", estadoFilter as Normativa["estado"])
    if (categoriaFilter !== "todas") query = query.eq("categoria_id", categoriaFilter)
    if (publicadaFilter !== "todas") query = query.eq("publicada", publicadaFilter === "si")
    if (aprobacionFilter !== "todas") query = query.eq("estado_aprobacion", aprobacionFilter as Normativa["estado_aprobacion"])
    query = query.order(sortColumn, { ascending: sortDirection === "asc", nullsFirst: false })
    const from = (page - 1) * PAGE_SIZE
    const { data, error, count } = await query.range(from, from + PAGE_SIZE - 1)
    if (error) {
      addToast(error.message, "error")
    } else {
      setNormativas((data as Normativa[]) ?? [])
      setTotalCount(count ?? 0)
    }
    setLoading(false)
  }, [supabase, addToast, page, search, estadoFilter, categoriaFilter, publicadaFilter, aprobacionFilter, sortColumn, sortDirection])

  const fetchCategorias = useCallback(async () => {
    const { data, error } = await supabase.from("categorias_normativa").select("id,nombre")
    if (error) {
      addToast(error.message, "error")
    } else {
      const map: Record<string, string> = {}
      data?.forEach((c) => { map[c.id] = c.nombre })
      setCategorias(map)
    }
  }, [supabase, addToast])

  useEffect(() => {
    const run = async () => {
      await fetchCategorias()
    }
    run()
  }, [fetchCategorias])

  useEffect(() => {
    const run = async () => {
      await fetchData()
    }
    run()
  }, [fetchData])

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
    const { error } = await supabase.from("normativa").delete().eq("id", deleteTarget.id)
    if (error) {
      addToast(error.message, "error")
    } else {
      addToast("Normativa eliminada", "success")
      setDeleteTarget(null)
      if (normativas.length === 1 && page > 1) {
        setPage(page - 1)
      } else {
        fetchData()
      }
    }
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  const columns: Column<Normativa>[] = [
    { key: "numero", label: "Número" },
    { key: "titulo", label: "Título", sortable: true, render: (val) => (
      <span className="font-medium truncate max-w-xs block">{val}</span>
    )},
    { key: "categoria_id", label: "Categoría", render: (val) => <span>{categorias[val] || "-"}</span> },
    { key: "estado", label: "Estado", sortable: true, render: (val) => (
      <Badge className={getEstadoColor(val)}>{getEstadoLabel(val)}</Badge>
    )},
    { key: "fecha_publicacion", label: "Fecha", sortable: true, render: (val) => val ? formatDate(val, "short") : "-" },
    { key: "estado_aprobacion", label: "Aprobación", render: (val, row) => {
      const item = APROBACION_BADGES[val as string] ?? APROBACION_BADGES.pendiente
      const motivo = (row as Normativa).motivo_rechazo
      return (
        <div className="space-y-1">
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${item.className}`}>{item.label}</span>
          {val === "rechazado" && motivo && (
            <p className="max-w-[220px] truncate text-xs text-muted-foreground" title={motivo}>{motivo}</p>
          )}
        </div>
      )
    }},
    { key: "acciones", label: "Acciones", render: (_val, row) => {
      const n = row as Normativa
      const puedeEliminar = !user
        || user.rol === "admin"
        || (n.created_by === user.id && n.estado_aprobacion !== "aprobado" && !n.publicada)
      return (
        <div className="flex gap-1">
          <Link href={`/admin/normativa/${n.id}`}>
            <Button variant="outline" size="icon-sm" aria-label="Editar" title="Editar">
              <Pencil className="h-4 w-4" />
            </Button>
          </Link>
          {puedeEliminar && (
            <Button variant="ghost" size="icon-sm" aria-label="Eliminar" title="Eliminar" className="text-destructive hover:text-destructive" onClick={() => setDeleteTarget(n)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      )
    }},
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Normativa</h1>
        <Link href="/admin/normativa/nueva">
          <Button><Plus className="h-4 w-4" />Nueva Normativa</Button>
        </Link>
      </div>
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <div className="flex-1">
          <SearchInput value={searchInput} onChange={setSearchInput} placeholder="Buscar normativa..." />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Select
            className="sm:w-44"
            value={estadoFilter}
            onChange={(e) => { setEstadoFilter(e.target.value); setPage(1) }}
            options={[{ value: "todas", label: "Todos los estados" }, ...ESTADOS.map((e) => ({ value: e, label: getEstadoLabel(e) }))]}
          />
          <Select
            className="sm:w-52"
            value={categoriaFilter}
            onChange={(e) => { setCategoriaFilter(e.target.value); setPage(1) }}
            options={[{ value: "todas", label: "Todas las categorías" }, ...Object.entries(categorias).map(([id, nombre]) => ({ value: id, label: nombre }))]}
          />
          <Select
            className="sm:w-44"
            value={publicadaFilter}
            onChange={(e) => { setPublicadaFilter(e.target.value); setPage(1) }}
            options={[
              { value: "todas", label: "Todas" },
              { value: "si", label: "Publicadas" },
              { value: "no", label: "No publicadas" },
            ]}
          />
          <Select
            className="sm:w-44"
            value={aprobacionFilter}
            onChange={(e) => { setAprobacionFilter(e.target.value); setPage(1) }}
            options={[
              { value: "todas", label: "Toda aprobación" },
              { value: "pendiente", label: "Pendientes" },
              { value: "aprobado", label: "Aprobadas" },
              { value: "rechazado", label: "Rechazadas" },
            ]}
          />
        </div>
      </div>
      <DataTable
        columns={columns}
        data={normativas}
        onSort={handleSort}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        loading={loading}
      />
      <div className="flex flex-col items-center gap-2">
        <p className="text-sm text-muted-foreground">Mostrando {normativas.length} de {totalCount} registros</p>
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar normativa"
        description={`¿Seguro que deseas eliminar "${deleteTarget?.numero} - ${deleteTarget?.titulo}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

export default function NormativaListPage() {
  return (
    <Suspense fallback={<div className="space-y-4">Cargando normativa...</div>}>
      <NormativaListContent />
    </Suspense>
  )
}
