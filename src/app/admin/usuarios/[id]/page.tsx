"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Select } from "@/components/ui/select"
import { useToast } from "@/components/ui/toast"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/lib/supabase/client"
import { ArrowLeft, Save } from "lucide-react"
import type { Usuario } from "@/types"
import { permisosPorRol, tipoPermisos, ROLES, type Permisos } from "@/lib/roles"
import { PermisosEditor } from "@/components/admin/permisos-editor"
import { useDirtyGuard } from "@/hooks/use-dirty-guard"

const ROLES_OPTIONS = [
  { value: "admin", label: "Administrador" },
  { value: "editor", label: "Editor" },
  { value: "publicador", label: "Publicador" },
]

function clonarPermisos(permisos: Permisos): Permisos {
  return JSON.parse(JSON.stringify(permisos)) as Permisos
}

export default function EditarUsuarioPage() {
  const params = useParams()
  const router = useRouter()
  const { addToast } = useToast()
  const supabase = createClient()

  const [dependencias, setDependencias] = useState<{ value: string; label: string }[]>([])
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    rol: "editor",
    dependencia_id: "",
    activo: true,
  })
  const [permisos, setPermisos] = useState<Permisos>(() => clonarPermisos(permisosPorRol("editor")))
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [dirty, setDirty] = useState(false)
  useDirtyGuard(dirty)
  const [pass1, setPass1] = useState("")
  const [pass2, setPass2] = useState("")
  const [resetting, setResetting] = useState(false)

  useEffect(() => {
    const init = async () => {
      const [depRes, userRes, metaRes] = await Promise.all([
        supabase.from("dependencias").select("id,nombre").order("orden"),
        supabase.from("usuarios").select("*").eq("id", params.id as string).single(),
        fetch(`/api/admin/usuarios/${params.id}`).then((r) => r.json()),
      ])
      if (depRes.error) addToast(depRes.error.message, "error")
      setDependencias((depRes.data || []).map((d) => ({ value: d.id, label: d.nombre })))

      if (userRes.error) {
        addToast(userRes.error.message, "error")
        router.push("/admin/usuarios")
        return
      }
      const u = userRes.data as Usuario
      const savedPermisos = tipoPermisos(metaRes.permisos)
      setForm({
        nombre: u.nombre,
        email: u.email || "",
        rol: u.rol,
        dependencia_id: u.dependencia_id || "",
        activo: u.activo,
      })
      setPermisos(clonarPermisos(savedPermisos ?? permisosPorRol(u.rol)))
      setLoading(false)
    }
    init()
  }, [params.id, supabase, router, addToast])

  const handleRolChange = (rol: string) => {
    setDirty(true)
    setForm((prev) => ({ ...prev, rol }))
    setPermisos(clonarPermisos(permisosPorRol(rol)))
  }

  const handlePermisosChange = (p: Permisos) => {
    setDirty(true)
    setPermisos(p)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nombre.trim()) {
      addToast("El nombre es obligatorio", "error")
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch(`/api/admin/usuarios/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.nombre,
          rol: form.rol,
          dependencia_id: form.dependencia_id || null,
          activo: form.activo,
          permisos,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        addToast(data.error || "Error al actualizar usuario", "error")
        return
      }
      addToast("Usuario actualizado", "success")
      router.push("/admin/usuarios")
    } finally {
      setSubmitting(false)
    }
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pass1.length < 8) {
      addToast("La contraseña debe tener al menos 8 caracteres", "error")
      return
    }
    if (pass1 !== pass2) {
      addToast("Las contraseñas no coinciden", "error")
      return
    }
    setResetting(true)
    try {
      const res = await fetch(`/api/admin/usuarios/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pass1 }),
      })
      const data = await res.json()
      if (!res.ok) {
        addToast(data.error || "Error al restablecer la contraseña", "error")
        return
      }
      setPass1("")
      setPass2("")
      addToast("Contraseña restablecida. Pasala al funcionario para que entre y la cambie en Mi Perfil.", "success")
    } finally {
      setResetting(false)
    }
  }

  if (loading) {
    return <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/usuarios">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Editar Usuario</h1>
          <p className="text-sm text-muted-foreground">Modificar datos y permisos del usuario</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos de la Cuenta</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Nombre Completo</Label>
              <Input value={form.nombre} onChange={(e) => { setDirty(true); setForm((prev) => ({ ...prev, nombre: e.target.value })) }} required />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} disabled className="disabled:opacity-60" />
              <p className="text-xs text-muted-foreground">El email no se puede cambiar.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Rol</Label>
                <Select value={form.rol} onChange={(e) => handleRolChange(e.target.value)} options={ROLES_OPTIONS} />
                <p className="text-xs text-muted-foreground">{ROLES[form.rol]?.descripcion}</p>
              </div>
              <div className="space-y-2">
                <Label>Dependencia</Label>
                <Select value={form.dependencia_id} onChange={(e) => { setDirty(true); setForm((prev) => ({ ...prev, dependencia_id: e.target.value })) }} options={dependencias} placeholder="Sin dependencia" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="activo"
                checked={form.activo}
                onChange={(e) => { setDirty(true); setForm((prev) => ({ ...prev, activo: e.target.checked })) }}
              />
              <Label htmlFor="activo" className="cursor-pointer">Cuenta activa</Label>
            </div>
            <div className="sticky bottom-0 -mx-6 mt-6 flex items-center justify-end gap-3 border-t border-border bg-background/95 px-6 py-4 backdrop-blur">
              <Link href="/admin/usuarios">
                <Button type="button" variant="outline">Cancelar</Button>
              </Link>
              <Button type="submit" loading={submitting}>
                <Save className="mr-2 h-4 w-4" />
                Guardar Cambios
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Permisos por Módulo</CardTitle>
          <p className="text-sm text-muted-foreground">
            Acciones específicas que puede realizar este usuario en cada módulo. Se suman a los
            permisos predeterminados de su rol.
          </p>
        </CardHeader>
        <CardContent>
          <PermisosEditor permisos={permisos} rol={form.rol} onChange={handlePermisosChange} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Restablecer Contraseña</CardTitle>
          <p className="text-sm text-muted-foreground">
            Fijá una clave temporal y pasala al funcionario. Él podrá cambiarla en Mi Perfil.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordReset} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nueva Contraseña</Label>
              <Input type="password" value={pass1} onChange={(e) => setPass1(e.target.value)} placeholder="Mínimo 8 caracteres" minLength={8} />
            </div>
            <div className="space-y-2">
              <Label>Confirmar Contraseña</Label>
              <Input type="password" value={pass2} onChange={(e) => setPass2(e.target.value)} placeholder="Repetí la nueva contraseña" minLength={8} />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" variant="outline" loading={resetting}>
                Restablecer Contraseña
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
