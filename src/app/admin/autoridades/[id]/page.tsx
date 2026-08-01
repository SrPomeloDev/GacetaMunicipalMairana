"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUpload } from "@/components/admin/file-upload"
import { useToast } from "@/components/ui/toast"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/lib/supabase/client"

const TIPOS_OPTIONS = [
  { value: "alcalde", label: "Alcalde" },
  { value: "concejal", label: "Concejal" },
  { value: "secretario", label: "Secretario" },
  { value: "director", label: "Director" },
  { value: "jefe_unidad", label: "Jefe de Unidad" },
  { value: "subalcalde", label: "Subalcalde" },
]

export default function AutoridadFormPage() {
  const params = useParams()
  const router = useRouter()
  const isNew = params.id === "nueva"
  const { addToast } = useToast()
  const supabase = createClient()

  const [dependencias, setDependencias] = useState<{ value: string; label: string }[]>([])
  const [formData, setFormData] = useState({
    nombre_completo: "",
    cargo: "",
    tipo_autoridad: "concejal",
    foto: null as string | null,
    biografia: "",
    formacion: "",
    funciones: "",
    telefono: "",
    correo: "",
    dependencia_id: "",
    activo: true,
    orden: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const [depRes, autoridadRes] = await Promise.all([
        supabase.from("dependencias").select("id,nombre").order("orden"),
        isNew
          ? Promise.resolve({ data: null, error: null })
          : supabase.from("autoridades").select("*").eq("id", params.id as string).single(),
      ])
      if (depRes.error) addToast(depRes.error.message, "error")
      setDependencias((depRes.data || []).map((d) => ({ value: d.id, label: d.nombre })))

      if (autoridadRes.error) {
        addToast(autoridadRes.error.message, "error")
        if (!isNew) router.push("/admin/autoridades")
      } else if (autoridadRes.data) {
        const a = autoridadRes.data
        setFormData({
          nombre_completo: a.nombre_completo,
          cargo: a.cargo,
          tipo_autoridad: a.tipo_autoridad,
          foto: a.foto,
          biografia: a.biografia || "",
          formacion: a.formacion || "",
          funciones: a.funciones || "",
          telefono: a.telefono || "",
          correo: a.correo || "",
          dependencia_id: a.dependencia_id || "",
          activo: a.activo,
          orden: String(a.orden ?? 0),
        })
      }
      setLoading(false)
    }
    init()
  }, [isNew, params.id, supabase, router, addToast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined
    setFormData((prev) => ({ ...prev, [name]: checked !== undefined ? checked : value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.nombre_completo.trim() || !formData.cargo.trim()) {
      addToast("El nombre y el cargo son obligatorios", "error")
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        nombre_completo: formData.nombre_completo,
        cargo: formData.cargo,
        tipo_autoridad: formData.tipo_autoridad,
        foto: formData.foto,
        biografia: formData.biografia || null,
        formacion: formData.formacion || null,
        funciones: formData.funciones || null,
        telefono: formData.telefono || null,
        correo: formData.correo || null,
        dependencia_id: formData.dependencia_id || null,
        activo: formData.activo,
        orden: formData.orden ? Number(formData.orden) : 0,
      }
      const { error } = isNew
        ? await supabase.from("autoridades").insert(payload)
        : await supabase.from("autoridades").update(payload).eq("id", params.id as string)
      if (error) {
        addToast(error.message, "error")
        return
      }
      addToast(isNew ? "Autoridad creada" : "Autoridad actualizada", "success")
      router.push("/admin/autoridades")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="space-y-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{isNew ? "Nueva Autoridad" : "Editar Autoridad"}</h1>
        <Link href="/admin/autoridades">
          <Button variant="outline">Cancelar</Button>
        </Link>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Datos Personales</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre Completo</Label>
                <Input name="nombre_completo" value={formData.nombre_completo} onChange={handleChange} placeholder="Nombre y apellidos" required />
              </div>
              <div className="space-y-2">
                <Label>Tipo de Autoridad</Label>
                <Select name="tipo_autoridad" value={formData.tipo_autoridad} onChange={handleChange} options={TIPOS_OPTIONS} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cargo</Label>
                <Input name="cargo" value={formData.cargo} onChange={handleChange} placeholder="Ej: Alcalde Municipal" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Foto de la Autoridad</Label>
              <FileUpload
                bucket="noticias-imagenes"
                accept="image/*"
                value={formData.foto}
                onChange={(url) => setFormData((prev) => ({ ...prev, foto: url }))}
                label="Foto"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Dependencia</Label>
                <Select name="dependencia_id" value={formData.dependencia_id} onChange={handleChange} options={dependencias} placeholder="Sin dependencia" />
              </div>
              <div className="space-y-2">
                <Label>Orden en la vista pública</Label>
                <Input type="number" min="0" name="orden" value={formData.orden} onChange={handleChange} placeholder="0" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" name="activo" id="activo" checked={formData.activo} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500" />
              <Label htmlFor="activo">Activa (visible al público)</Label>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Contacto y Perfil</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input name="telefono" value={formData.telefono} onChange={handleChange} placeholder="Opcional" />
              </div>
              <div className="space-y-2">
                <Label>Correo</Label>
                <Input type="email" name="correo" value={formData.correo} onChange={handleChange} placeholder="Opcional" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Biografía</Label>
              <textarea
                name="biografia"
                value={formData.biografia}
                onChange={handleChange}
                rows={3}
                className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
                placeholder="Reseña biográfica..."
              />
            </div>
            <div className="space-y-2">
              <Label>Formación</Label>
              <textarea
                name="formacion"
                value={formData.formacion}
                onChange={handleChange}
                rows={2}
                className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
                placeholder="Formación académica..."
              />
            </div>
            <div className="space-y-2">
              <Label>Funciones</Label>
              <textarea
                name="funciones"
                value={formData.funciones}
                onChange={handleChange}
                rows={3}
                className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
                placeholder="Funciones principales..."
              />
            </div>
          </CardContent>
        </Card>
        <div className="flex gap-4 justify-end">
          <Link href="/admin/autoridades">
            <Button type="button" variant="outline">Cancelar</Button>
          </Link>
          <Button type="submit" loading={submitting}>
            {isNew ? "Crear Autoridad" : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </div>
  )
}
