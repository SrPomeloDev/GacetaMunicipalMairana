"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SearchInput } from "@/components/ui/search-input"
import { DataTable } from "@/components/ui/data-table"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { useToast } from "@/components/ui/toast"
import type { Column } from "@/components/ui/data-table"
import type { CategoriaNormativa } from "@/types"

export default function CategoriasListPage() {
  const [categorias, setCategorias] = useState<CategoriaNormativa[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<CategoriaNormativa | null>(null)
  const { addToast } = useToast()

  const fetchCategorias = useCallback(async () => {
    const res = await fetch("/api/admin/categorias")
    if (!res.ok) {
      const data = await res.json()
      addToast(data.error || "Error al cargar categorías", "error")
    } else {
      setCategorias(await res.json())
    }
    setLoading(false)
  }, [addToast])

  useEffect(() => {
    const run = async () => {
      await fetchCategorias()
    }
    run()
  }, [fetchCategorias])

  const handleDelete = async () => {
    if (!deleteTarget) return
    const res = await fetch(`/api/admin/categorias/${deleteTarget.id}`, { method: "DELETE" })
    const data = await res.json()
    if (!res.ok) {
      addToast(data.error || "Error al eliminar", "error")
      return
    }
    addToast("Categoría eliminada", "success")
    setDeleteTarget(null)
    fetchCategorias()
  }

  const filtered = categorias.filter((c) => {
    const q = search.toLowerCase()
    return !q || c.nombre.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
  })

  const columns: Column<CategoriaNormativa>[] = [
    { key: "orden", label: "Orden", render: (val) => <span className="text-muted-foreground text-xs">#{val as string}</span> },
    { key: "nombre", label: "Nombre", render: (val) => <span className="font-medium">{val as string}</span> },
    { key: "slug", label: "Slug", render: (val) => <span className="text-muted-foreground text-xs">{val as string}</span> },
    { key: "color", label: "Color", render: (val) => (
      <div className="flex items-center gap-2">
        <span className="h-4 w-4 rounded-full border border-border" style={{ backgroundColor: val as string }} />
        <span className="text-xs text-muted-foreground">{val as string}</span>
      </div>
    )},
    { key: "descripcion", label: "Descripción", render: (val) => val ? <span className="text-sm line-clamp-1">{val as string}</span> : <span className="text-xs text-muted-foreground">-</span> },
    { key: "acciones", label: "Acciones", render: (_val, row) => (
      <div className="flex gap-2">
        <Link href={`/admin/categorias/${(row as CategoriaNormativa).id}`}>
          <Button variant="outline" size="sm">Editar</Button>
        </Link>
        <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(row as CategoriaNormativa)}>Eliminar</Button>
      </div>
    )},
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Categorías de Normativa</h1>
        <Link href="/admin/categorias/nueva">
          <Button>Nueva Categoría</Button>
        </Link>
      </div>
      <SearchInput value={search} onChange={setSearch} placeholder="Buscar categoría..." />
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
        </div>
      ) : (
        <DataTable columns={columns} data={filtered} />
      )}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar categoría"
        description={`¿Seguro que deseas eliminar "${deleteTarget?.nombre}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
