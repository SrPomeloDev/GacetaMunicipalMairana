"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SearchInput } from "@/components/ui/search-input"
import { DataTable } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { useToast } from "@/components/ui/toast"
import { formatDate, getEstadoColor, getEstadoLabel } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import type { Column } from "@/components/ui/data-table"
import type { Normativa } from "@/types"

export default function NormativaListPage() {
  const [normativas, setNormativas] = useState<Normativa[]>([])
  const [categorias, setCategorias] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<Normativa | null>(null)
  const { addToast } = useToast()
  const supabase = createClient()

  const fetchData = useCallback(async () => {
    const [normativaRes, catRes] = await Promise.all([
      supabase.from("normativa").select("*").order("fecha_publicacion", { ascending: false, nullsFirst: false }),
      supabase.from("categorias_normativa").select("id,nombre"),
    ])
    if (normativaRes.error) {
      addToast(normativaRes.error.message, "error")
    } else {
      setNormativas(normativaRes.data || [])
    }
    if (catRes.error) {
      addToast(catRes.error.message, "error")
    } else {
      const map: Record<string, string> = {}
      catRes.data?.forEach((c) => { map[c.id] = c.nombre })
      setCategorias(map)
    }
    setLoading(false)
  }, [supabase, addToast])

  useEffect(() => {
    const run = async () => {
      await fetchData()
    }
    run()
  }, [fetchData])

  const handleDelete = async () => {
    if (!deleteTarget) return
    const { error } = await supabase.from("normativa").delete().eq("id", deleteTarget.id)
    if (error) {
      addToast(error.message, "error")
    } else {
      addToast("Normativa eliminada", "success")
      setDeleteTarget(null)
      fetchData()
    }
  }

  const filtered = normativas.filter((n) => {
    const q = search.toLowerCase()
    return !q || n.titulo.toLowerCase().includes(q) || n.numero.toLowerCase().includes(q)
  })

  const columns: Column<Normativa>[] = [
    { key: "numero", label: "Número" },
    { key: "titulo", label: "Título", render: (val) => (
      <span className="font-medium truncate max-w-xs block">{val}</span>
    )},
    { key: "categoria_id", label: "Categoría", render: (val) => <span>{categorias[val] || "-"}</span> },
    { key: "estado", label: "Estado", render: (val) => (
      <Badge className={getEstadoColor(val)}>{getEstadoLabel(val)}</Badge>
    )},
    { key: "fecha_publicacion", label: "Fecha", render: (val) => val ? formatDate(val, "short") : "-" },
    { key: "acciones", label: "Acciones", render: (_val, row) => (
      <div className="flex gap-2">
        <Link href={`/admin/normativa/${(row as Normativa).id}`}>
          <Button variant="outline" size="sm">Editar</Button>
        </Link>
        <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(row as Normativa)}>Eliminar</Button>
      </div>
    )},
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Normativa</h1>
        <Link href="/admin/normativa/nueva">
          <Button>Nueva Normativa</Button>
        </Link>
      </div>
      <SearchInput value={search} onChange={setSearch} placeholder="Buscar normativa..." />
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
        </div>
      ) : (
        <DataTable columns={columns} data={filtered} />
      )}
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
