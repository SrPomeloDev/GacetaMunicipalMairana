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
import { slugify } from "@/lib/utils"

const CATEGORIAS_OPTIONS = [
  { value: "institucional", label: "Institucional" },
  { value: "evento", label: "Evento" },
  { value: "programa", label: "Programa" },
  { value: "comunicado", label: "Comunicado" },
  { value: "cultura", label: "Cultura" },
]

export default function NoticiaFormPage() {
  const params = useParams()
  const router = useRouter()
  const isNew = params.id === "nueva"
  const { addToast } = useToast()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    titulo: "",
    slug: "",
    resumen: "",
    contenido: "",
    categoria: "institucional",
    destacada: false,
    publicada: false,
    fecha_publicacion: "",
    imagen_principal: null as string | null,
  })
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(!isNew)
  const [slugTouched, setSlugTouched] = useState(false)

  useEffect(() => {
    if (isNew) return
    const load = async () => {
      const { data, error } = await supabase
        .from("noticias")
        .select("*")
        .eq("id", params.id as string)
        .single()
      if (error) {
        addToast(error.message, "error")
        router.push("/admin/noticias")
        return
      }
      setFormData({
        titulo: data.titulo,
        slug: data.slug,
        resumen: data.resumen || "",
        contenido: data.contenido || "",
        categoria: data.categoria,
        destacada: data.destacada,
        publicada: data.publicada,
        fecha_publicacion: data.fecha_publicacion ? data.fecha_publicacion.slice(0, 16) : "",
        imagen_principal: data.imagen_principal,
      })
      setLoading(false)
    }
    load()
  }, [isNew, params.id, supabase, router, addToast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined
    setFormData((prev) => {
      const next = { ...prev, [name]: checked !== undefined ? checked : value }
      if (name === "titulo" && !slugTouched) {
        next.slug = slugify(value)
      }
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.titulo.trim()) {
      addToast("El título es obligatorio", "error")
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        titulo: formData.titulo,
        slug: formData.slug || slugify(formData.titulo),
        resumen: formData.resumen || null,
        contenido: formData.contenido || null,
        categoria: formData.categoria,
        destacada: formData.destacada,
        publicada: formData.publicada,
        fecha_publicacion: formData.fecha_publicacion ? new Date(formData.fecha_publicacion).toISOString() : null,
        imagen_principal: formData.imagen_principal,
      }
      const { error } = isNew
        ? await supabase.from("noticias").insert(payload)
        : await supabase.from("noticias").update(payload).eq("id", params.id as string)
      if (error) {
        addToast(error.message.includes("duplicate") ? "Ya existe una noticia con ese título/slug" : error.message, "error")
        return
      }
      addToast(isNew ? "Noticia creada" : "Noticia actualizada", "success")
      router.push("/admin/noticias")
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
        <h1 className="text-2xl font-bold">{isNew ? "Nueva Noticia" : "Editar Noticia"}</h1>
        <Link href="/admin/noticias">
          <Button variant="outline">Cancelar</Button>
        </Link>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Información General</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input name="titulo" value={formData.titulo} onChange={handleChange} placeholder="Título de la noticia" required />
            </div>
            <div className="space-y-2">
              <Label>Slug (URL)</Label>
              <Input name="slug" value={formData.slug} onChange={(e) => { setSlugTouched(true); handleChange(e) }} placeholder="titulo-de-la-noticia" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoría</Label>
                <Select name="categoria" value={formData.categoria} onChange={handleChange} options={CATEGORIAS_OPTIONS} />
              </div>
              <div className="space-y-2">
                <Label>Fecha de Publicación</Label>
                <Input type="datetime-local" name="fecha_publicacion" value={formData.fecha_publicacion} onChange={handleChange} />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <input type="checkbox" name="destacada" id="destacada" checked={formData.destacada} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500" />
                <Label htmlFor="destacada">Noticia destacada</Label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" name="publicada" id="publicada" checked={formData.publicada} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500" />
                <Label htmlFor="publicada">Publicada (visible al público)</Label>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Contenido</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Imagen Principal</Label>
              <FileUpload
                bucket="noticias-imagenes"
                accept="image/*"
                value={formData.imagen_principal}
                onChange={(url) => setFormData((prev) => ({ ...prev, imagen_principal: url }))}
                label="Imagen"
              />
            </div>
            <div className="space-y-2">
              <Label>Resumen</Label>
              <textarea
                name="resumen"
                value={formData.resumen}
                onChange={handleChange}
                rows={3}
                className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
                placeholder="Resumen breve de la noticia"
              />
            </div>
            <div className="space-y-2">
              <Label>Contenido</Label>
              <textarea
                name="contenido"
                value={formData.contenido}
                onChange={handleChange}
                rows={15}
                className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
                placeholder="Contenido completo de la noticia..."
              />
            </div>
          </CardContent>
        </Card>
        <div className="flex gap-4 justify-end">
          <Link href="/admin/noticias">
            <Button type="button" variant="outline">Cancelar</Button>
          </Link>
          <Button type="submit" loading={submitting}>
            {isNew ? "Crear Noticia" : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </div>
  )
}
