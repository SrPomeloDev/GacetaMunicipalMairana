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
import { formatDate } from "@/lib/utils"
import type { Column } from "@/components/ui/data-table"
import type { SesionConcejo } from "@/types"
import { cn } from "@/lib/utils"

const TIPO_LABEL: Record<string, string> = {
  ordinaria: "Ordinaria", extraordinaria: "Extraordinaria",
  audiencia_publica: "Audiencia Pública", instalacion: "Instalación",
}

export default function ConcejoPage() {
  const pathname = usePathname()
  const [sesiones, setSesiones] = useState<SesionConcejo[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<SesionConcejo | null>(null)
  const { addToast } = useToast()

  const fetchSesiones = useCallback(async () => {
    const res = await fetch("/api/admin/concejo/sesiones")
    if (!res.ok) {
      const data = await res.json()
      addToast(data.error || "Error al cargar sesiones", "error")
    } else {
      setSesiones(await res.json())
    }
    setLoading(false)
  }, [addToast])

  useEffect(() => {
    const run = async () => {
      await fetchSesiones()
    }
    run()
  }, [fetchSesiones])

  const handleDelete = async () => {
    if (!deleteTarget) return
    const res = await fetch(`/api/admin/concejo/sesiones/${deleteTarget.id}`, { method: "DELETE" })
    const data = await res.json()
    if (!res.ok) {
      addToast(data.error || "Error al eliminar", "error")
      return
    }
    addToast("Sesión eliminada", "success")
    setDeleteTarget(null)
    fetchSesiones()
  }

  const columns: Column<SesionConcejo>[] = [
    { key: "numero_sesion", label: "Sesión", render: (val) => <span className="font-medium">{val as string}</span> },
    { key: "fecha", label: "Fecha", render: (val) => <span className="text-sm">{formatDate(val as string, "short")}</span> },
    { key: "tipo", label: "Tipo", render: (val) => <Badge variant="secondary">{TIPO_LABEL[val as string] || val as string}</Badge> },
    { key: "agenda", label: "Agenda", render: (val) => val ? <span className="text-sm line-clamp-1">{val as string}</span> : <span className="text-xs text-muted-foreground">-</span> },
    { key: "acta_pdf", label: "Acta", render: (val) => val ? (
      <a href={val as string} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">Ver PDF</a>
    ) : <span className="text-xs text-muted-foreground">-</span> },
    { key: "acciones", label: "Acciones", render: (_val, row) => (
      <div className="flex gap-2">
        <Link href={`/admin/concejo/sesiones/${(row as SesionConcejo).id}`}>
          <Button variant="outline" size="sm">Editar</Button>
        </Link>
        <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(row as SesionConcejo)}>Eliminar</Button>
      </div>
    )},
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Concejo Municipal</h1>
        <Link href="/admin/concejo/sesiones/nueva">
          <Button>Nueva Sesión</Button>
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
      ) : sesiones.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center">
          <p className="text-lg font-medium text-foreground">No hay sesiones registradas</p>
          <p className="mt-1 text-sm text-muted-foreground">Las sesiones del concejo aparecerán aquí.</p>
          <Link href="/admin/concejo/sesiones/nueva" className="mt-4"><Button>Nueva Sesión</Button></Link>
        </div>
      ) : (
        <DataTable columns={columns} data={sesiones} />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar sesión"
        description={`¿Seguro que deseas eliminar "${deleteTarget?.numero_sesion}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
