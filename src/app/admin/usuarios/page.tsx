"use client"

import { useCallback, useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import type { Column } from "@/components/ui/data-table"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { IconBox } from "@/components/ui/icon-box"
import { useToast } from "@/components/ui/toast"
import { createClient } from "@/lib/supabase/client"
import { Search, Plus, Pencil, Trash2, CheckCircle2, XCircle, User } from "lucide-react"
import type { Usuario } from "@/types"

const roles: Record<string, { label: string; color: string }> = {
  admin: { label: "Administrador", color: "bg-primary text-primary-foreground" },
  editor: { label: "Editor", color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300" },
  publicador: { label: "Publicador", color: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300" },
}

function AdminUsuariosContent() {
  const searchParams = useSearchParams()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [search, setSearch] = useState("")
  const [activoFilter, setActivoFilter] = useState(() =>
    searchParams.get("activo") === "false" ? "inactivo" : "todos"
  )
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<Usuario | null>(null)
  const { addToast } = useToast()
  const supabase = createClient()

  const fetchUsuarios = useCallback(async () => {
    const { data, error } = await supabase.from("usuarios").select("*").order("created_at", { ascending: false })
    if (error) {
      addToast(error.message, "error")
    } else {
      setUsuarios(data || [])
    }
    setLoading(false)
  }, [supabase, addToast])

  useEffect(() => {
    const run = async () => {
      await fetchUsuarios()
    }
    run()
  }, [fetchUsuarios])

  const handleDelete = async () => {
    if (!deleteTarget) return
    const res = await fetch(`/api/admin/usuarios/${deleteTarget.id}`, { method: "DELETE" })
    const data = await res.json()
    if (!res.ok) {
      addToast(data.error || "Error al eliminar usuario", "error")
      return
    }
    addToast("Usuario eliminado", "success")
    setDeleteTarget(null)
    fetchUsuarios()
  }

  const filtered = usuarios.filter((u) =>
    (activoFilter === "todos" || (activoFilter === "inactivo" ? !u.activo : u.activo)) &&
    (u.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(search.toLowerCase()))
  )

  const columns: Column<Usuario>[] = [
    { key: "nombre", label: "Usuario", render: (val, row) => (
      <div className="flex items-center gap-2">
        <IconBox size="sm" shape="full">
          {row.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={row.avatar_url} alt={row.nombre} className="h-8 w-8 rounded-full object-cover" />
          ) : (
            <User className="h-4 w-4" />
          )}
        </IconBox>
        <span className="font-medium">{val}</span>
      </div>
    )},
    { key: "email", label: "Email", render: (val) => (
      <span className="text-muted-foreground">{val || "-"}</span>
    )},
    { key: "rol", label: "Rol", render: (val) => (
      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${roles[val as string]?.color || "bg-muted text-muted-foreground"}`}>
        {roles[val as string]?.label || val}
      </span>
    )},
    { key: "activo", label: "Estado", render: (val) => (
      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
        val ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300" : "bg-muted text-muted-foreground"
      }`}>
        {val ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
        {val ? "Activo" : "Inactivo"}
      </span>
    )},
    { key: "acciones", label: "Acciones", render: (_val, row) => (
      <div className="flex gap-2">
        <Link href={`/admin/usuarios/${row.id}`}>
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
          <h1 className="text-2xl font-bold">Usuarios</h1>
          <p className="text-sm text-muted-foreground">Gestión de usuarios del sistema</p>
        </div>
        <Link href="/admin/usuarios/nueva">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Usuario
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-10"
                placeholder="Buscar usuarios..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select
              className="sm:w-44"
              value={activoFilter}
              onChange={(e) => setActivoFilter(e.target.value)}
              options={[
                { value: "todos", label: "Todos" },
                { value: "activo", label: "Activos" },
                { value: "inactivo", label: "Inactivos" },
              ]}
              aria-label="Filtrar por estado"
            />
          </div>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={filtered} loading={loading} emptyMessage="No se encontraron usuarios" />
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar usuario"
        description={`¿Seguro que deseas eliminar a "${deleteTarget?.nombre}"? Perderá acceso al sistema. Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

export default function AdminUsuariosPage() {
  return (
    <Suspense fallback={<div className="space-y-4">Cargando usuarios...</div>}>
      <AdminUsuariosContent />
    </Suspense>
  )
}
