"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { SearchInput } from "@/components/ui/search-input"
import { DataTable } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { useToast } from "@/components/ui/toast"
import { formatDate } from "@/lib/utils"
import type { Column } from "@/components/ui/data-table"
import type { Suscripcion } from "@/types"

export default function SuscripcionesPage() {
  const [suscripciones, setSuscripciones] = useState<Suscripcion[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<string[]>([])
  const [deleteAll, setDeleteAll] = useState(false)
  const { addToast } = useToast()

  const fetchSuscripciones = useCallback(async () => {
    const res = await fetch("/api/admin/suscripciones")
    if (!res.ok) {
      const data = await res.json()
      addToast(data.error || "Error al cargar suscripciones", "error")
    } else {
      setSuscripciones(await res.json())
    }
    setLoading(false)
  }, [addToast])

  useEffect(() => {
    const run = async () => {
      await fetchSuscripciones()
    }
    run()
  }, [fetchSuscripciones])

  const toggleActivo = async (s: Suscripcion) => {
    const res = await fetch(`/api/admin/suscripciones/${s.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activo: !s.activo }),
    })
    const data = await res.json()
    if (!res.ok) {
      addToast(data.error || "Error al actualizar", "error")
      return
    }
    addToast(s.activo ? "Suscripción desactivada" : "Suscripción activada", "success")
    fetchSuscripciones()
  }

  const handleDeleteSelected = async () => {
    if (selected.length === 0) return
    const res = await fetch("/api/admin/suscripciones", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selected }),
    })
    const data = await res.json()
    if (!res.ok) {
      addToast(data.error || "Error al eliminar", "error")
      return
    }
    addToast(data.message || "Suscripciones eliminadas", "success")
    setSelected([])
    setDeleteAll(false)
    fetchSuscripciones()
  }

  const exportCSV = () => {
    const headers = ["email", "categorias", "activo", "fecha"]
    const rows = suscripciones.map((s) => [s.email, (s.categorias || []).join(";"), s.activo ? "si" : "no", s.created_at])
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n")
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `suscripciones-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const filtered = suscripciones.filter((s) => {
    const q = search.toLowerCase()
    return !q || s.email.toLowerCase().includes(q)
  })

  const activas = suscripciones.filter((s) => s.activo).length

  const columns: Column<Suscripcion>[] = [
    {
      key: "select",
      label: "",
      render: (_val, row) => {
        const id = (row as Suscripcion).id
        return (
          <input
            type="checkbox"
            checked={selected.includes(id)}
            onChange={(e) => {
              setSelected((prev) => (e.target.checked ? [...prev, id] : prev.filter((x) => x !== id)))
            }}
            className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
          />
        )
      },
    },
    { key: "email", label: "Correo", render: (val) => <span className="font-medium">{val as string}</span> },
    {
      key: "categorias",
      label: "Categorías",
      render: (val) => {
        const cats = (val as string[]) || []
        return cats.length === 0 ? <span className="text-xs text-muted-foreground">Todas</span> : (
          <div className="flex flex-wrap gap-1">
            {cats.map((c) => <Badge key={c} variant="outline" className="capitalize">{c}</Badge>)}
          </div>
        )
      },
    },
    {
      key: "activo",
      label: "Estado",
      render: (val) => val
        ? <Badge variant="default" className="bg-emerald-600">Activa</Badge>
        : <Badge variant="secondary">Inactiva</Badge>,
    },
    { key: "created_at", label: "Fecha", render: (val) => <span className="text-sm text-muted-foreground">{formatDate(val as string, "short")}</span> },
    {
      key: "acciones",
      label: "Acciones",
      render: (_val, row) => {
        const s = row as Suscripcion
        return (
          <Button variant="outline" size="sm" onClick={() => toggleActivo(s)}>
            {s.activo ? "Desactivar" : "Activar"}
          </Button>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Suscripciones</h1>
          <p className="text-sm text-muted-foreground">{suscripciones.length} suscriptores · {activas} activos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCSV} disabled={suscripciones.length === 0}>
            Exportar CSV
          </Button>
          <Button variant="destructive" onClick={() => setDeleteAll(true)} disabled={selected.length === 0}>
            Eliminar seleccionadas ({selected.length})
          </Button>
        </div>
      </div>

      <SearchInput value={search} onChange={setSearch} placeholder="Buscar por correo..." />

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
        </div>
      ) : suscripciones.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center">
          <p className="text-lg font-medium text-foreground">No hay suscripciones</p>
          <p className="mt-1 text-sm text-muted-foreground">Las personas que se suscriban desde la página pública aparecerán aquí.</p>
        </div>
      ) : (
        <DataTable columns={columns} data={filtered} />
      )}

      <ConfirmDialog
        open={deleteAll}
        title="Eliminar suscripciones"
        description={`¿Seguro que deseas eliminar ${selected.length} suscripción(es)? Esta acción no se puede deshacer.`}
        onConfirm={handleDeleteSelected}
        onCancel={() => setDeleteAll(false)}
      />
    </div>
  )
}
