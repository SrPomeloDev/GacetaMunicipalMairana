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
import { createClient } from "@/lib/supabase/client"
import type { Column } from "@/components/ui/data-table"
import type { Autoridad } from "@/types"

const TIPO_LABEL: Record<string, string> = {
  alcalde: "Alcalde", concejal: "Concejal", secretario: "Secretario",
  director: "Director", jefe_unidad: "Jefe de Unidad", subalcalde: "Subalcalde",
}

const TIPO_COLOR: Record<string, string> = {
  alcalde: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400",
  concejal: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400",
  secretario: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400",
  director: "bg-primary/10 text-primary-foreground border-primary/20 dark:bg-primary/20 dark:text-primary-foreground",
  jefe_unidad: "bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-400",
  subalcalde: "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400",
}

export default function AutoridadesListPage() {
  const [autoridades, setAutoridades] = useState<Autoridad[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<Autoridad | null>(null)
  const { addToast } = useToast()
  const supabase = createClient()

  const fetchAutoridades = useCallback(async () => {
    const { data, error } = await supabase.from("autoridades").select("*").order("orden")
    if (error) {
      addToast(error.message, "error")
    } else {
      setAutoridades(data || [])
    }
    setLoading(false)
  }, [supabase, addToast])

  useEffect(() => {
    const run = async () => {
      await fetchAutoridades()
    }
    run()
  }, [fetchAutoridades])

  const handleDelete = async () => {
    if (!deleteTarget) return
    const { error } = await supabase.from("autoridades").delete().eq("id", deleteTarget.id)
    if (error) {
      addToast(error.message, "error")
    } else {
      addToast("Autoridad eliminada", "success")
      setDeleteTarget(null)
      fetchAutoridades()
    }
  }

  const toggleActivo = async (a: Autoridad) => {
    const { error } = await supabase.from("autoridades").update({ activo: !a.activo }).eq("id", a.id)
    if (error) {
      addToast(error.message, "error")
    } else {
      fetchAutoridades()
    }
  }

  const filtered = autoridades.filter((a) => {
    const q = search.toLowerCase()
    return !q || a.nombre_completo.toLowerCase().includes(q) || a.cargo.toLowerCase().includes(q)
  })

  const columns: Column<Autoridad>[] = [
    { key: "foto", label: "Foto", render: (val) => val ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={val} alt="" className="h-9 w-9 rounded-full object-cover" />
    ) : (
      <span className="text-xs text-muted-foreground">-</span>
    )},
    { key: "orden", label: "Orden", render: (val) => <span className="text-muted-foreground text-xs">#{val}</span> },
    { key: "nombre_completo", label: "Nombre" },
    { key: "cargo", label: "Cargo", render: (val) => <span className="font-medium">{val}</span> },
    { key: "tipo_autoridad", label: "Tipo", render: (val) => (
      <Badge className={TIPO_COLOR[val] || ""}>{TIPO_LABEL[val] || val}</Badge>
    )},
    { key: "activo", label: "Estado", render: (_val, row) => (
      <Button
        variant={row.activo ? "success" : "secondary"}
        size="sm"
        onClick={() => toggleActivo(row)}
      >
        {row.activo ? "Activo" : "Inactivo"}
      </Button>
    )},
    { key: "acciones", label: "Acciones", render: (_val, row) => (
      <div className="flex gap-2">
        <Link href={`/admin/autoridades/${(row as Autoridad).id}`}>
          <Button variant="outline" size="sm">Editar</Button>
        </Link>
        <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(row as Autoridad)}>Eliminar</Button>
      </div>
    )},
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Autoridades</h1>
        <Link href="/admin/autoridades/nueva">
          <Button>Nueva Autoridad</Button>
        </Link>
      </div>
      <SearchInput value={search} onChange={setSearch} placeholder="Buscar autoridad..." />
      <div className="rounded-lg border bg-card p-3 text-sm text-muted-foreground">
        El campo &quot;Orden&quot; determina la posición en la vista pública (menor número = primero).
      </div>
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
        </div>
      ) : (
        <DataTable columns={columns} data={filtered} />
      )}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar autoridad"
        description={`¿Seguro que deseas eliminar a "${deleteTarget?.nombre_completo}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
