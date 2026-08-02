"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { useToast } from "@/components/ui/toast"
import type { Column } from "@/components/ui/data-table"
import type { ComisionConcejal } from "@/types"
import { cn } from "@/lib/utils"

export default function ComisionesPage() {
  const pathname = usePathname()
  const [comisiones, setComisiones] = useState<ComisionConcejal[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<ComisionConcejal | null>(null)
  const { addToast } = useToast()

  const fetchComisiones = useCallback(async () => {
    const res = await fetch("/api/admin/concejo/comisiones")
    if (!res.ok) {
      const data = await res.json()
      addToast(data.error || "Error al cargar comisiones", "error")
    } else {
      setComisiones(await res.json())
    }
    setLoading(false)
  }, [addToast])

  useEffect(() => {
    const run = async () => {
      await fetchComisiones()
    }
    run()
  }, [fetchComisiones])

  const handleDelete = async () => {
    if (!deleteTarget) return
    const res = await fetch(`/api/admin/concejo/comisiones/${deleteTarget.id}`, { method: "DELETE" })
    const data = await res.json()
    if (!res.ok) {
      addToast(data.error || "Error al eliminar", "error")
      return
    }
    addToast("Comisión eliminada", "success")
    setDeleteTarget(null)
    fetchComisiones()
  }

  interface ComisionRow extends ComisionConcejal {
    autoridad?: { nombre_completo?: string } | null
  }

  const columns: Column<ComisionRow>[] = [
    { key: "comision", label: "Comisión", render: (val) => <span className="font-medium">{val as string}</span> },
    { key: "cargo_comision", label: "Cargo", render: (val) => val ? <Badge variant="outline">{val as string}</Badge> : <span className="text-xs text-muted-foreground">-</span> },
    {
      key: "autoridad",
      label: "Concejal",
      render: (_val, row) => row.autoridad?.nombre_completo ? <span className="text-sm">{row.autoridad.nombre_completo}</span> : <span className="text-xs text-muted-foreground">-</span>,
    },
    { key: "acciones", label: "Acciones", render: (_val, row) => (
      <div className="flex gap-2">
        <Link href={`/admin/concejo/comisiones/${(row as ComisionConcejal).id}`}>
          <Button variant="outline" size="sm">Editar</Button>
        </Link>
        <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(row as ComisionConcejal)}>Eliminar</Button>
      </div>
    )},
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Comisiones del Concejo</h1>
        <Link href="/admin/concejo/comisiones/nueva">
          <Button>Nueva Comisión</Button>
        </Link>
      </div>

      <div className="flex gap-2">
        <Link href="/admin/concejo" className={cn("rounded-lg px-4 py-2 text-sm font-medium border", pathname === "/admin/concejo" ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:border-primary/40")}>
          Sesiones
        </Link>
        <Link href="/admin/concejo/comisiones" className={cn("rounded-lg px-4 py-2 text-sm font-medium border", pathname === "/admin/concejo/comisiones" ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:border-primary/40")}>
          Comisiones
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
        </div>
      ) : comisiones.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center">
          <p className="text-lg font-medium text-foreground">No hay comisiones registradas</p>
          <p className="mt-1 text-sm text-muted-foreground">Las comisiones del concejo aparecerán aquí.</p>
          <Link href="/admin/concejo/comisiones/nueva" className="mt-4"><Button>Nueva Comisión</Button></Link>
        </div>
      ) : (
        <DataTable columns={columns} data={comisiones} />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar comisión"
        description={`¿Seguro que deseas eliminar la comisión "${deleteTarget?.comision}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
