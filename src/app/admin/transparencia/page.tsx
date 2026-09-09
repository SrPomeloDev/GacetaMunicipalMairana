"use client"

import { useCallback, useEffect, useMemo, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import type { Column } from "@/components/ui/data-table"
import { Pagination } from "@/components/ui/pagination"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { useToast } from "@/components/ui/toast"
import { formatDate } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useCurrentUser, can } from "@/hooks/use-current-user"
import { Search, Plus, Pencil, Trash2, FileText } from "lucide-react"
import type { Transparencia } from "@/types"

const categorias: Record<string, { label: string; color: string }> = {
  presupuesto: { label: "Presupuesto", color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300" },
  poa: { label: "POA", color: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300" },
  pei: { label: "PEI", color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300" },
  contratacion: { label: "Contratación", color: "bg-primary text-primary-foreground" },
  auditoria: { label: "Auditoría", color: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" },
  financiero: { label: "Financiero", color: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300" },
  declaracion: { label: "Declaración", color: "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300" },
  informe: { label: "Informe", color: "bg-muted text-muted-foreground" },
}

const PAGE_SIZE = 20
const LIST_COLUMNS = "id,titulo,categoria,fecha,publicada,created_at"

function AdminTransparenciaContent() {
  const searchParams = useSearchParams()
  const { user } = useCurrentUser()
  const puedePublicar = can(user, "transparencia", "publicar")
  const [docs, setDocs] = useState<Transparencia[]>([])
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [sortColumn, setSortColumn] = useState("fecha")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [categoriaFilter, setCategoriaFilter] = useState("todas")
  const [publicadaFilter, setPublicadaFilter] = useState(() =>
    searchParams.get("publicada") === "false" ? "no" : "todas"
  )
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Transparencia | null>(null)
  const { addToast } = useToast()
  const supabase = useMemo(() => createClient(), [])

  const fetchDocs = useCallback(async () => {
    setLoading(true)
    let query = supabase.from("transparencia").select(LIST_COLUMNS, { count: "exact" })
    const q = search.trim().replace(/[%(),]/g, "")
    if (q) {
      query = query.ilike("titulo", `%${q}%`)
    }
    if (categoriaFilter !== "todas") query = query.eq("categoria", categoriaFilter as Transparencia["categoria"])
    if (publicadaFilter !== "todas") query = query.eq("publicada", publicadaFilter === "si")
    query = query.order(sortColumn, { ascending: sortDirection === "asc", nullsFirst: false })
    const from = (page - 1) * PAGE_SIZE
    const { data, error, count } = await query.range(from, from + PAGE_SIZE - 1)
    if (error) {
      addToast(error.message, "error")
    } else {
      setDocs((data as Transparencia[]) ?? [])
      setTotalCount(count ?? 0)
    }
    setLoading(false)
  }, [supabase, addToast, page, search, categoriaFilter, publicadaFilter, sortColumn, sortDirection])

  useEffect(() => {
    const run = async () => {
      await fetchDocs()
    }
    run()
  }, [fetchDocs])

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
    const { error } = await supabase.from("transparencia").delete().eq("id", deleteTarget.id)
    if (error) {
      addToast(error.message, "error")
      return
    }
    addToast("Documento eliminado", "success")
    setDeleteTarget(null)
    if (docs.length === 1 && page > 1) {
      setPage(page - 1)
    } else {
      fetchDocs()
    }
  }

  const togglePublicada = async (doc: Transparencia) => {
    if (togglingId) return
    if (!puedePublicar) {
      addToast("No tienes permiso para publicar documentos", "error")
      return
    }
    setTogglingId(doc.id)
    try {
      const { error } = await supabase
        .from("transparencia")
        .update({ publicada: !doc.publicada })
        .eq("id", doc.id)
      if (error) {
        addToast(error.message, "error")
      } else {
        fetchDocs()
      }
    } finally {
      setTogglingId(null)
    }
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  const columns: Column<Transparencia>[] = [
    { key: "titulo", label: "Título", sortable: true, render: (val) => (
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="font-medium">{val}</span>
      </div>
    )},
    { key: "categoria", label: "Categoría", render: (val) => (
      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${categorias[val as string]?.color || "bg-muted text-muted-foreground"}`}>
        {categorias[val as string]?.label || val}
      </span>
    )},
    { key: "fecha", label: "Fecha", sortable: true, render: (val) => (
      <span className="text-muted-foreground">{val ? formatDate(val as string, "short") : "-"}</span>
    )},
    { key: "created_at", label: "Creado", sortable: true, render: (val) => (
      <span className="text-muted-foreground">{val ? formatDate(val as string, "short") : "-"}</span>
    )},
    { key: "publicada", label: "Publicado", render: (_val, row) => (
      <Button
        variant={row.publicada ? "success" : "secondary"}
        size="sm"
        onClick={() => togglePublicada(row)}
        disabled={togglingId === row.id || !puedePublicar}
        title={puedePublicar ? "Clic para cambiar" : "Sin permiso para publicar"}
      >
        {row.publicada ? "Sí" : "No"}
      </Button>
    )},
    { key: "acciones", label: "Acciones", render: (_val, row) => (
      <div className="flex gap-2">
        <Link href={`/admin/transparencia/${row.id}`}>
          <Button variant="ghost" size="icon-sm" title="Editar">
            <Pencil className="h-4 w-4" />
          </Button>
        </Link>
        <Button variant="ghost" size="icon-sm" className="text-destructive" title="Eliminar" onClick={() => setDeleteTarget(row)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    )},
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Transparencia</h1>
          <p className="text-sm text-muted-foreground">Gestión de documentos de transparencia</p>
        </div>
        <Link href="/admin/transparencia/nueva">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Documento
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-10"
                placeholder="Buscar documentos..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Select
                className="sm:w-48"
                value={categoriaFilter}
                onChange={(e) => { setCategoriaFilter(e.target.value); setPage(1) }}
                options={[{ value: "todas", label: "Todas las categorías" }, ...Object.entries(categorias).map(([value, c]) => ({ value, label: c.label }))]}
              />
              <Select
                className="sm:w-44"
                value={publicadaFilter}
                onChange={(e) => { setPublicadaFilter(e.target.value); setPage(1) }}
                options={[
                  { value: "todas", label: "Todos" },
                  { value: "si", label: "Publicados" },
                  { value: "no", label: "No publicados" },
                ]}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={docs}
            onSort={handleSort}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            loading={loading}
            emptyMessage="No se encontraron documentos"
          />
          <div className="flex flex-col items-center gap-2 pt-4">
            <p className="text-sm text-muted-foreground">Mostrando {docs.length} de {totalCount} registros</p>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar documento"
        description={`¿Seguro que deseas eliminar "${deleteTarget?.titulo}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

export default function AdminTransparenciaPage() {
  return (
    <Suspense fallback={<div className="space-y-4">Cargando documentos...</div>}>
      <AdminTransparenciaContent />
    </Suspense>
  )
}
