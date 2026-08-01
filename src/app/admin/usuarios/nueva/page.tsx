"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select } from "@/components/ui/select"
import { useToast } from "@/components/ui/toast"
import { createClient } from "@/lib/supabase/client"
import { ArrowLeft, Save, UserPlus } from "lucide-react"

const ROLES_OPTIONS = [
  { value: "editor", label: "Editor" },
  { value: "publicador", label: "Publicador" },
  { value: "admin", label: "Administrador" },
]

export default function NuevoUsuarioPage() {
  const router = useRouter()
  const { addToast } = useToast()
  const supabase = createClient()

  const [dependencias, setDependencias] = useState<{ value: string; label: string }[]>([])
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
    rol: "editor",
    dependencia_id: "",
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const loadDeps = async () => {
      const { data, error } = await supabase.from("dependencias").select("id,nombre").order("orden")
      if (error) {
        addToast(error.message, "error")
        return
      }
      setDependencias((data || []).map((d) => ({ value: d.id, label: d.nombre })))
    }
    loadDeps()
  }, [supabase, addToast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nombre.trim() || !form.email.trim() || form.password.length < 6) {
      addToast("Completa nombre, email y una contraseña de al menos 6 caracteres", "error")
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch("/api/admin/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        addToast(data.error || "Error al crear usuario", "error")
        return
      }
      addToast(`Usuario "${form.nombre}" creado`, "success")
      router.push("/admin/usuarios")
    } finally {
      setSubmitting(false)
    }
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
          <h1 className="text-2xl font-bold">Nuevo Usuario</h1>
          <p className="text-sm text-muted-foreground">Crear cuenta de acceso al panel</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Datos de la Cuenta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Nombre Completo</Label>
              <Input value={form.nombre} onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))} placeholder="Nombre y apellidos" required />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} placeholder="usuario@mairana.gob.bo" required />
            </div>
            <div className="space-y-2">
              <Label>Contraseña</Label>
              <Input type="password" value={form.password} onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} placeholder="Mínimo 6 caracteres" required />
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
            <div className="flex gap-4">
              <Button type="submit" loading={submitting}>
                <Save className="mr-2 h-4 w-4" />
                Crear Usuario
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
