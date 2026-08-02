"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { useToast } from "@/components/ui/toast"
import { formatDate } from "@/lib/utils"
import type { Column } from "@/components/ui/data-table"

interface Contratacion {
  id: string
  titulo: string
  slug: string
  tipo: string
  modalidad: string | null
  objeto: string | null
  monto: number | null
  empresa_adjudicada: string | null
  fecha_publicacion: string
  fecha_presentacion: string | null
  fecha_adjudicacion: string | null
  archivo_pdf: string | null
  estado: string
  publicada: boolean
}

const TIPO_LABEL: Record<string, string> = {
  licitacion: "Licitación",
  apoyo_nacional: "Apoyo Nacional",
  compras_menores: "Compras Menores",
  contratacion_directa: "Contratación Directa",
  emergencia: "Emergencia",
}

const ESTADO_LABEL: Record<string, { label: string; className: string }> = {
  borrador: { label: "Borrador", className: "bg-muted text-muted-foreground" },
  publicada: { label: "Publicada", className: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300" },
  adjudicada: { label: "Adjudicada", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" },
  desierta: { label: "Desierta", className: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" },
  concluida: { label: "Concluida", className: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300" },
}

export default function ContratacionesPage() {
  const [contrataciones, setContrataciones] = useState<Contratacion[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<Contratacion | null>(null)
  const { addToast } = useToast()

  const fetchContrataciones = useCallback(async () => {
    const res = await fetch("/api/admin/contrataciones")
    if (!res.ok) {
      const data = await res.json()
      addToast(data.error || "Error al cargar contrataciones", "error")
    } else {
      setContrataciones(await res.json())
    }
    setLoading(false)
  }, [addToast])

  useEffect(() => {
    const run = async () => {
      await fetchContrataciones()
    }
    run()
  }, [fetchContrataciones])

  const handleDelete = async () => {
    if (!deleteTarget) return
    const res = await fetch(`/api/admin/contrataciones/${deleteTarget.id}`, { method: "DELETE" })
    const data = await res.json()
    if (!res.ok) {
      addToast(data.error || "Error al eliminar", "error")
      return
    }
    addToast("Contratación eliminada", "success")
    setDeleteTarget(null)
    fetchContrataciones()
  }

  const columns: Column<Contratacion>[] = [
    { key: "titulo", label: "Título", render: (val, row) => (
      <div className="flex items-center gap-2">
        <span className="font-medium line-clamp-1">{val as string}</span>
        {(row as Contratacion).publicada ? (
          <Badge variant="outline" className="text-xs">Pública</Badge>
        ) : (
          <Badge variant="secondary" className="text-xs">Borrador</Badge>
        )}
      </div>
    )},
    { key: "tipo", label: "Tipo", render: (val) => <span className="text-sm">{TIPO_LABEL[val as string] || val as string}</span> },
    { key: "monto", label: "Monto", render: (val) => val !== null && val !== undefined
      ? <span className="text-sm font-mono">Bs. {(val as number).toLocaleString("es-BO", { minimumFractionDigits: 2 })}</span>
      : <span className="text-xs text-muted-foreground">-</span> },
    { key: "empresa_adjudicada", label: "Adjudicatario", render: (val) => val ? <span className="text-sm line-clamp-1">{val as string}</span> : <span className="text-xs text-muted-foreground">-</span> },
    { key: "fecha_publicacion", label: "Publicación", render: (val) => <span className="text-sm">{formatDate(val as string, "short")}</span> },
    { key: "estado", label: "Estado", render: (val) => {
      const e = ESTADO_LABEL[val as string]
      return e ? <Badge className={e.className}>{e.label}</Badge> : <Badge variant="secondary">{val as string}</Badge>
    }},
    { key: "acciones", label: "Acciones", render: (_val, row) => (
      <div className="flex gap-2">
        <Link href={`/admin/contrataciones/${(row as Contratacion).id}`}>
          <Button variant="outline" size="sm">Editar</Button>
        </Link>
        <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(row as Contratacion)}>Eliminar</Button>
      </div>
    )},
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Contrataciones</h1>
          <p className="mt-1 text-sm text-muted-foreground">Licitaciones, compras menores y contrataciones directas del municipio.</p>
        </div>
        <Link href="/admin/contrataciones/nueva">
          <Button>Nueva Contratación</Button>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
        </div>
      ) : contrataciones.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center">
          <p className="text-lg font-medium text-foreground">No hay contrataciones registradas</p>
          <p className="mt-1 text-sm text-muted-foreground">Las convocatorias públicas aparecerán aquí.</p>
          <Link href="/admin/contrataciones/nueva" className="mt-4"><Button>Nueva Contratación</Button></Link>
        </div>
      ) : (
        <DataTable columns={columns} data={contrataciones} />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar contratación"
        description={`¿Seguro que deseas eliminar "${deleteTarget?.titulo}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
