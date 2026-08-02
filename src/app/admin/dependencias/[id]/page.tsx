"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/toast"
import { Skeleton } from "@/components/ui/skeleton"
import { slugify } from "@/lib/utils"

const TIPOS_OPTIONS = [
  { value: "ejecutivo", label: "Ejecutivo" },
  { value: "legislativo", label: "Legislativo" },
  { value: "administrativo", label: "Administrativo" },
]

export default function DependenciaFormPage() {
  const params = useParams()
  const router = useRouter()
  const isNew = params.id === "nueva"
  const { addToast } = useToast()

  const [formData, setFormData] = useState({
    nombre: "",
    slug: "",
    tipo: "ejecutivo",
    descripcion: "",
    telefono: "",
    correo: "",
    horario: "",
    orden: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(!isNew)

  useEffect(() => {
    if (isNew) return
    const load = async () => {
      const res = await fetch(`/api/admin/dependencias/${params.id}`)
      const data = await res.json()
      if (!res.ok) {
        addToast(data.error || "Error al cargar", "error")
        router.push("/admin/dependencias")
        return
      }
      setFormData({
        nombre: data.nombre,
        slug: data.slug,
        tipo: data.tipo,
        descripcion: data.descripcion || "",
        telefono: data.telefono || "",
        correo: data.correo || "",
        horario: data.horario || "",
        orden: String(data.orden ?? 0),
      })
      setLoading(false)
    }
    load()
  }, [isNew, params.id, router, addToast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "nombre" && !prev.slug ? { slug: slugify(value) } : {}),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.nombre.trim()) {
      addToast("El nombre es obligatorio", "error")
      return
    }
    setSubmitting(true)
    try {
      const method = isNew ? "POST" : "PATCH"
      const res = await fetch(isNew ? "/api/admin/dependencias" : `/api/admin/dependencias/${params.id}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (!res.ok) {
        addToast(data.error || "Error al guardar", "error")
        return
      }
      addToast(isNew ? "Dependencia creada" : "Dependencia actualizada", "success")
      router.push("/admin/dependencias")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{isNew ? "Nueva Dependencia" : "Editar Dependencia"}</h1>
        <Link href="/admin/dependencias">
          <Button variant="outline">Cancelar</Button>
        </Link>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Datos de la Dependencia</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Ej: Secretaría de Salud" required />
              </div>
              <div className="space-y-2">
                <Label>Slug (URL)</Label>
                <Input name="slug" value={formData.slug} onChange={handleChange} placeholder="seccion-de-salud" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select name="tipo" value={formData.tipo} onChange={handleChange} options={TIPOS_OPTIONS} />
              </div>
              <div className="space-y-2">
                <Label>Orden</Label>
                <Input type="number" min="0" name="orden" value={formData.orden} onChange={handleChange} placeholder="0" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows={3}
                className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Descripción de la dependencia..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input name="telefono" value={formData.telefono} onChange={handleChange} placeholder="Opcional" />
              </div>
              <div className="space-y-2">
                <Label>Correo</Label>
                <Input type="email" name="correo" value={formData.correo} onChange={handleChange} placeholder="Opcional" />
              </div>
              <div className="space-y-2">
                <Label>Horario</Label>
                <Input name="horario" value={formData.horario} onChange={handleChange} placeholder="Lun a Vie 08:00-16:00" />
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="flex gap-4 justify-end">
          <Link href="/admin/dependencias">
            <Button type="button" variant="outline">Cancelar</Button>
          </Link>
          <Button type="submit" loading={submitting}>
            {isNew ? "Crear Dependencia" : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </div>
  )
}
