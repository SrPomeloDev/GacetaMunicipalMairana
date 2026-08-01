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

const ESTADOS_OPTIONS = [
  { value: "vigente", label: "Vigente" },
  { value: "derogada", label: "Derogada" },
  { value: "modificada", label: "Modificada" },
  { value: "suspendida", label: "Suspendida" },
  { value: "abrogada", label: "Abrogada" },
]

export default function NormativaFormPage() {
  const params = useParams()
  const router = useRouter()
  const isNew = params.id === "nueva"
  const { addToast } = useToast()
  const supabase = createClient()

  const [categorias, setCategorias] = useState<{ value: string; label: string }[]>([])
  const [dependencias, setDependencias] = useState<{ value: string; label: string }[]>([])
  const [formData, setFormData] = useState({
    numero: "",
    slug: "",
    titulo: "",
    resumen: "",
    contenido_texto: "",
    categoria_id: "",
    dependencia_id: "",
    estado: "vigente",
    fecha_aprobacion: "",
    fecha_publicacion: "",
    fecha_vigencia: "",
    numero_paginas: "",
    archivo_pdf: null as string | null,
    publicada: false,
  })
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [slugTouched, setSlugTouched] = useState(false)

  useEffect(() => {
    const init = async () => {
      const [catRes, depRes, normativaRes] = await Promise.all([
        supabase.from("categorias_normativa").select("id,nombre").order("orden"),
        supabase.from("dependencias").select("id,nombre").order("orden"),
        isNew
          ? Promise.resolve({ data: null, error: null })
          : supabase.from("normativa").select("*").eq("id", params.id as string).single(),
      ])
      if (catRes.error) addToast(catRes.error.message, "error")
      if (depRes.error) addToast(depRes.error.message, "error")
      setCategorias((catRes.data || []).map((c) => ({ value: c.id, label: c.nombre })))
      setDependencias((depRes.data || []).map((d) => ({ value: d.id, label: d.nombre })))

      if (normativaRes.error) {
        addToast(normativaRes.error.message, "error")
        if (!isNew) router.push("/admin/normativa")
      } else if (normativaRes.data) {
        const n = normativaRes.data
        setFormData({
          numero: n.numero,
          slug: n.slug,
          titulo: n.titulo,
          resumen: n.resumen || "",
          contenido_texto: n.contenido_texto || "",
          categoria_id: n.categoria_id || "",
          dependencia_id: n.dependencia_id || "",
          estado: n.estado,
          fecha_aprobacion: n.fecha_aprobacion || "",
          fecha_publicacion: n.fecha_publicacion || "",
          fecha_vigencia: n.fecha_vigencia || "",
          numero_paginas: n.numero_paginas ? String(n.numero_paginas) : "",
          archivo_pdf: n.archivo_pdf,
          publicada: n.publicada,
        })
      }
      setLoading(false)
    }
    init()
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
    if (!formData.titulo.trim() || !formData.numero.trim()) {
      addToast("El título y el número son obligatorios", "error")
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        numero: formData.numero,
        slug: formData.slug || slugify(formData.titulo),
        titulo: formData.titulo,
        resumen: formData.resumen || null,
        contenido_texto: formData.contenido_texto || null,
        categoria_id: formData.categoria_id || null,
        dependencia_id: formData.dependencia_id || null,
        estado: formData.estado,
        fecha_aprobacion: formData.fecha_aprobacion || null,
        fecha_publicacion: formData.fecha_publicacion || null,
        fecha_vigencia: formData.fecha_vigencia || null,
        numero_paginas: formData.numero_paginas ? Number(formData.numero_paginas) : null,
        archivo_pdf: formData.archivo_pdf,
        publicada: formData.publicada,
      }
      const { error } = isNew
        ? await supabase.from("normativa").insert(payload)
        : await supabase.from("normativa").update(payload).eq("id", params.id as string)
      if (error) {
        addToast(error.message.includes("duplicate") ? "Ya existe una normativa con ese número o slug" : error.message, "error")
        return
      }
      addToast(isNew ? "Normativa creada" : "Normativa actualizada", "success")
      router.push("/admin/normativa")
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
        <h1 className="text-2xl font-bold">{isNew ? "Nueva Normativa" : "Editar Normativa"}</h1>
        <Link href="/admin/normativa">
          <Button variant="outline">Cancelar</Button>
        </Link>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Datos Generales</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Número</Label>
                <Input name="numero" value={formData.numero} onChange={handleChange} placeholder="Ej: 045/2026" required />
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select name="estado" value={formData.estado} onChange={handleChange} options={ESTADOS_OPTIONS} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Título</Label>
              <Input name="titulo" value={formData.titulo} onChange={handleChange} placeholder="Título completo de la norma" required />
            </div>
            <div className="space-y-2">
              <Label>Slug (URL)</Label>
              <Input name="slug" value={formData.slug} onChange={(e) => { setSlugTouched(true); handleChange(e) }} placeholder="ordenanza-045-2026" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoría</Label>
                <Select name="categoria_id" value={formData.categoria_id} onChange={handleChange} options={categorias} placeholder="Seleccionar categoría" />
              </div>
              <div className="space-y-2">
                <Label>Dependencia</Label>
                <Select name="dependencia_id" value={formData.dependencia_id} onChange={handleChange} options={dependencias} placeholder="Seleccionar dependencia" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Fecha de Aprobación</Label>
                <Input type="date" name="fecha_aprobacion" value={formData.fecha_aprobacion} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label>Fecha de Publicación</Label>
                <Input type="date" name="fecha_publicacion" value={formData.fecha_publicacion} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label>Fecha de Vigencia</Label>
                <Input type="date" name="fecha_vigencia" value={formData.fecha_vigencia} onChange={handleChange} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Número de Páginas</Label>
                <Input type="number" min="1" name="numero_paginas" value={formData.numero_paginas} onChange={handleChange} placeholder="0" />
              </div>
              <div className="flex items-end gap-2 pb-1">
                <input type="checkbox" name="publicada" id="publicada" checked={formData.publicada} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500" />
                <Label htmlFor="publicada">Publicada (visible al público)</Label>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Documento y Contenido</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Archivo PDF</Label>
              <FileUpload
                bucket="normativa-pdf"
                accept="application/pdf"
                value={formData.archivo_pdf}
                onChange={(url) => setFormData((prev) => ({ ...prev, archivo_pdf: url }))}
                label="PDF"
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
                placeholder="Resumen breve de la norma"
              />
            </div>
            <div className="space-y-2">
              <Label>Texto (opcional, si no se sube PDF)</Label>
              <textarea
                name="contenido_texto"
                value={formData.contenido_texto}
                onChange={handleChange}
                rows={10}
                className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
                placeholder="Contenido textual de la norma..."
              />
            </div>
          </CardContent>
        </Card>
        <div className="flex gap-4 justify-end">
          <Link href="/admin/normativa">
            <Button type="button" variant="outline">Cancelar</Button>
          </Link>
          <Button type="submit" loading={submitting}>
            {isNew ? "Crear Normativa" : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </div>
  )
}
