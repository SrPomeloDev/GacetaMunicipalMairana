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

const COLOR_OPTIONS = [
  { value: "orange", label: "Naranja" },
  { value: "red", label: "Rojo" },
  { value: "blue", label: "Azul" },
  { value: "green", label: "Verde" },
  { value: "purple", label: "Púrpura" },
  { value: "gray", label: "Gris" },
]

export default function CategoriaFormPage() {
  const params = useParams()
  const router = useRouter()
  const isNew = params.id === "nueva"
  const { addToast } = useToast()

  const [formData, setFormData] = useState({
    nombre: "",
    slug: "",
    descripcion: "",
    color: "orange",
    icono: "",
    orden: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(!isNew)

  useEffect(() => {
    if (isNew) return
    const load = async () => {
      const res = await fetch(`/api/admin/categorias/${params.id}`)
      const data = await res.json()
      if (!res.ok) {
        addToast(data.error || "Error al cargar", "error")
        router.push("/admin/categorias")
        return
      }
      setFormData({
        nombre: data.nombre,
        slug: data.slug,
        descripcion: data.descripcion || "",
        color: data.color || "orange",
        icono: data.icono || "",
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
      const res = await fetch(isNew ? "/api/admin/categorias" : `/api/admin/categorias/${params.id}`, {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (!res.ok) {
        addToast(data.error || "Error al guardar", "error")
        return
      }
      addToast(isNew ? "Categoría creada" : "Categoría actualizada", "success")
      router.push("/admin/categorias")
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
        <h1 className="text-2xl font-bold">{isNew ? "Nueva Categoría" : "Editar Categoría"}</h1>
        <Link href="/admin/categorias">
          <Button variant="outline">Cancelar</Button>
        </Link>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Datos de la Categoría</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Ej: Ordenanza Municipal" required />
              </div>
              <div className="space-y-2">
                <Label>Slug (URL)</Label>
                <Input name="slug" value={formData.slug} onChange={handleChange} placeholder="ordenanza" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Color</Label>
                <Select name="color" value={formData.color} onChange={handleChange} options={COLOR_OPTIONS} />
              </div>
              <div className="space-y-2">
                <Label>Icono</Label>
                <Input name="icono" value={formData.icono} onChange={handleChange} placeholder="Nombre de icono (opcional)" />
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
                placeholder="Descripción de la categoría..."
              />
            </div>
            <div className="space-y-2">
              <Label>Orden</Label>
              <Input type="number" min="0" name="orden" value={formData.orden} onChange={handleChange} placeholder="0" />
            </div>
          </CardContent>
        </Card>
        <div className="flex gap-4 justify-end">
          <Link href="/admin/categorias">
            <Button type="button" variant="outline">Cancelar</Button>
          </Link>
          <Button type="submit" loading={submitting}>
            {isNew ? "Crear Categoría" : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </div>
  )
}
