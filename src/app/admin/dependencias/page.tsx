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
import type { Column } from "@/components/ui/data-table"
import type { Dependencia } from "@/types"

const TIPO_LABEL: Record<string, string> = {
  ejecutivo: "Ejecutivo", legislativo: "Legislativo", administrativo: "Administrativo",
}

const TIPO_COLOR: Record<string, string> = {
  ejecutivo: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400",
  legislativo: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400",
  administrativo: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400",
}

export default function DependenciasListPage() {
  const [dependencias, setDependencias] = useState<Dependencia[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<Dependencia | null>(null)
  const { addToast } = useToast()

  const fetchDependencias = useCallback(async () => {
    const res = await fetch("/api/admin/dependencias")
    if (!res.ok) {
      const data = await res.json()
      addToast(data.error || "Error al cargar dependencias", "error")
    } else {
      setDependencias(await res.json())
    }
    setLoading(false)
  }, [addToast])

  useEffect(() => {
    const run = async () => {
      await fetchDependencias()
    }
    run()
  }, [fetchDependencias])

  const handleDelete = async () => {
    if (!deleteTarget) return
    const res = await fetch(`/api/admin/dependencias/${deleteTarget.id}`, { method: "DELETE" })
    const data = await res.json()
    if (!res.ok) {
      addToast(data.error || "Error al eliminar", "error")
      return
    }
    addToast("Dependencia eliminada", "success")
    setDeleteTarget(null)
    fetchDependencias()
  }

  const filtered = dependencias.filter((d) => {
    const q = search.toLowerCase()
    return !q || d.nombre.toLowerCase().includes(q) || d.slug.toLowerCase().includes(q)
  })

  const columns: Column<Dependencia>[] = [
    { key: "orden", label: "Orden", render: (val) => <span className="text-muted-foreground text-xs">#{val as string}</span> },
    { key: "nombre", label: "Nombre", render: (val) => <span className="font-medium">{val as string}</span> },
    { key: "slug", label: "Slug", render: (val) => <span className="text-muted-foreground text-xs">{val as string}</span> },
    { key: "tipo", label: "Tipo", render: (val) => (
      <Badge className={TIPO_COLOR[val as string] || ""}>{TIPO_LABEL[val as string] || val as string}</Badge>
    )},
    { key: "telefono", label: "Teléfono", render: (val) => val ? <span className="text-sm">{val as string}</span> : <span className="text-xs text-muted-foreground">-</span> },
    { key: "acciones", label: "Acciones", render: (_val, row) => (
      <div className="flex gap-2">
        <Link href={`/admin/dependencias/${(row as Dependencia).id}`}>
          <Button variant="outline" size="sm">Editar</Button>
        </Link>
        <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(row as Dependencia)}>Eliminar</Button>
      </div>
    )},
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Dependencias</h1>
        <Link href="/admin/dependencias/nueva">
          <Button>Nueva Dependencia</Button>
        </Link>
      </div>
      <SearchInput value={search} onChange={setSearch} placeholder="Buscar dependencia..." />
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
        </div>
      ) : (
        <DataTable columns={columns} data={filtered} />
      )}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar dependencia"
        description={`¿Seguro que deseas eliminar "${deleteTarget?.nombre}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
