"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import type { Column } from "@/components/ui/data-table"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { useToast } from "@/components/ui/toast"
import { Search, Plus, Pencil, Trash2, CheckCircle2, XCircle } from "lucide-react"
import type { Tramite } from "@/types"

export default function AdminTramitesPage() {
  const [tramites, setTramites] = useState<Tramite[]>([])
  const [dependencias, setDependencias] = useState<Record<string, string>>({})
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Tramite | null>(null)
  const { addToast } = useToast()

  const fetchTramites = useCallback(async () => {
    const [trRes, depRes] = await Promise.all([
      fetch("/api/admin/tramites"),
      fetch("/api/admin/dependencias"),
    ])
    const trData = await trRes.json()
    const depData = await depRes.json()
    if (!trRes.ok) {
      addToast(trData.error || "Error al cargar trámites", "error")
    } else {
      setTramites(trData || [])
    }
    if (!depRes.ok) {
      addToast(depData.error || "Error al cargar dependencias", "error")
    } else {
      const map: Record<string, string> = {}
      depData?.forEach((d: { id: string; nombre: string }) => { map[d.id] = d.nombre })
      setDependencias(map)
    }
    setLoading(false)
  }, [addToast])

  useEffect(() => {
    const run = async () => {
      await fetchTramites()
    }
    run()
  }, [fetchTramites])

  const handleDelete = async () => {
    if (!deleteTarget) return
    const res = await fetch(`/api/admin/tramites/${deleteTarget.id}`, { method: "DELETE" })
    const data = await res.json()
    if (!res.ok) {
      addToast(data.error || "Error al eliminar", "error")
      return
    }
    addToast("Trámite eliminado", "success")
    setDeleteTarget(null)
    fetchTramites()
  }

  const toggleActivo = async (t: Tramite) => {
    if (togglingId) return
    setTogglingId(t.id)
    try {
      const res = await fetch(`/api/admin/tramites/${t.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activo: !t.activo }),
      })
      if (!res.ok) {
        const data = await res.json()
        addToast(data.error || "Error al actualizar", "error")
      } else {
        fetchTramites()
      }
    } finally {
      setTogglingId(null)
    }
  }

  const filtered = tramites.filter((t) => t.titulo.toLowerCase().includes(search.toLowerCase()))

  const columns: Column<Tramite>[] = [
    { key: "titulo", label: "Título", render: (val) => (
      <span className="font-medium">{val}</span>
    )},
    { key: "dependencia_id", label: "Dependencia", render: (val) => (
      <span className="text-muted-foreground">{val ? dependencias[val as string] || "-" : "-"}</span>
    )},
    { key: "tiempo_estimado", label: "Tiempo", render: (val) => (
      <span className="text-muted-foreground">{val || "-"}</span>
    )},
    { key: "costo", label: "Costo", render: (val) => val || "-" },
    { key: "activo", label: "Estado", render: (_val, row) => (
      <Button
        variant={row.activo ? "success" : "secondary"}
        size="sm"
        onClick={() => toggleActivo(row)}
        disabled={togglingId === row.id}
        title="Clic para cambiar estado"
      >
        {row.activo ? <CheckCircle2 className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
        {row.activo ? "Activo" : "Inactivo"}
      </Button>
    )},
    { key: "acciones", label: "Acciones", render: (_val, row) => (
      <div className="flex gap-2">
        <Link href={`/admin/tramites/${row.id}`}>
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
          <h1 className="text-2xl font-bold">Trámites</h1>
          <p className="text-sm text-muted-foreground">Gestión de trámites municipales</p>
        </div>
        <Link href="/admin/tramites/nueva">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Trámite
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-10"
                placeholder="Buscar trámites..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={filtered} loading={loading} emptyMessage="No se encontraron trámites" />
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar trámite"
        description={`¿Seguro que deseas eliminar "${deleteTarget?.titulo}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
