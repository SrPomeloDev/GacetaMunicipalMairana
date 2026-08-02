"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { useToast } from "@/components/ui/toast"
import { createClient } from "@/lib/supabase/client"
import { Search, Plus, Pencil, Trash2, CheckCircle2, XCircle, User } from "lucide-react"
import type { Usuario } from "@/types"

const roles: Record<string, { label: string; color: string }> = {
  admin: { label: "Administrador", color: "bg-primary/10 text-primary" },
  editor: { label: "Editor", color: "bg-blue-100 text-blue-700" },
  publicador: { label: "Publicador", color: "bg-green-100 text-green-700" },
}

export default function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [search, setSearch] = useState("")
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
    u.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(search.toLowerCase())
  )

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
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="Buscar usuarios..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium">Nombre</th>
                    <th className="pb-3 font-medium">Email</th>
                    <th className="pb-3 font-medium">Rol</th>
                    <th className="pb-3 font-medium">Estado</th>
                    <th className="pb-3 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user) => (
                    <tr key={user.id} className="border-b last:border-0">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                            {user.avatar_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={user.avatar_url} alt={user.nombre} className="h-8 w-8 rounded-full object-cover" />
                            ) : (
                              <User className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          <span className="font-medium">{user.nombre}</span>
                        </div>
                      </td>
                      <td className="py-3 text-muted-foreground">{user.email || "-"}</td>
                      <td className="py-3">
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${roles[user.rol]?.color || "bg-muted text-muted-foreground"}`}>
                          {roles[user.rol]?.label || user.rol}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          user.activo ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"
                        }`}>
                          {user.activo ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          {user.activo ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <Link href={`/admin/usuarios/${user.id}`}>
                            <Button variant="ghost" size="icon-sm" title="Editar">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="icon-sm" className="text-destructive" title="Eliminar" onClick={() => setDeleteTarget(user)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground">No se encontraron usuarios</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
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
