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

const ROLES_OPTIONS = [
  { value: "admin", label: "Administrador" },
  { value: "editor", label: "Editor" },
  { value: "publicador", label: "Publicador" },
]

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
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const [depRes, userRes] = await Promise.all([
        supabase.from("dependencias").select("id,nombre").order("orden"),
        supabase.from("usuarios").select("*").eq("id", params.id as string).single(),
      ])
      if (depRes.error) addToast(depRes.error.message, "error")
      setDependencias((depRes.data || []).map((d) => ({ value: d.id, label: d.nombre })))

      if (userRes.error) {
        addToast(userRes.error.message, "error")
        router.push("/admin/usuarios")
        return
      }
      const u = userRes.data as Usuario
      setForm({
        nombre: u.nombre,
        email: u.email || "",
        rol: u.rol,
        dependencia_id: u.dependencia_id || "",
        activo: u.activo,
      })
      setLoading(false)
    }
    init()
  }, [params.id, supabase, router, addToast])

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

  if (loading) {
    return <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/usuarios">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
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
              <Input value={form.nombre} onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} disabled className="disabled:opacity-60" />
              <p className="text-xs text-muted-foreground">El email no se puede cambiar.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Rol</Label>
                <Select value={form.rol} onChange={(e) => setForm((prev) => ({ ...prev, rol: e.target.value }))} options={ROLES_OPTIONS} />
              </div>
              <div className="space-y-2">
                <Label>Dependencia</Label>
                <Select value={form.dependencia_id} onChange={(e) => setForm((prev) => ({ ...prev, dependencia_id: e.target.value }))} options={dependencias} placeholder="Sin dependencia" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="activo"
                checked={form.activo}
                onCheckedChange={(checked) => setForm((prev) => ({ ...prev, activo: checked === true }))}
              />
              <Label htmlFor="activo" className="cursor-pointer">Cuenta activa</Label>
            </div>
            <div className="flex gap-4">
              <Button type="submit" loading={submitting}>
                <Save className="mr-2 h-4 w-4" />
                Guardar Cambios
              </Button>
              <Link href="/admin/usuarios">
                <Button variant="outline" type="button">Cancelar</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
