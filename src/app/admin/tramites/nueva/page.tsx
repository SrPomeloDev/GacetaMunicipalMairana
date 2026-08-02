"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Select } from "@/components/ui/select"
import { FileUpload } from "@/components/admin/file-upload"
import { useToast } from "@/components/ui/toast"
import { createClient } from "@/lib/supabase/client"
import { slugify } from "@/lib/utils"
import { ArrowLeft, Save } from "lucide-react"

export default function NuevoTramitePage() {
  const router = useRouter()
  const { addToast } = useToast()
  const supabase = createClient()

  const [dependencias, setDependencias] = useState<{ value: string; label: string }[]>([])
  const [form, setForm] = useState({
    titulo: "",
    slug: "",
    descripcion: "",
    requisitos: "",
    dependencia_id: "",
    tiempo_estimado: "",
    costo: "",
    formulario_pdf: null as string | null,
    activo: true,
  })
  const [submitting, setSubmitting] = useState(false)
  const [slugTouched, setSlugTouched] = useState(false)

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

  const handleChange = (field: string, value: string | boolean | null) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value }
      if (field === "titulo" && !slugTouched) {
        next.slug = slugify(String(value))
      }
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.titulo.trim()) {
      addToast("El título es obligatorio", "error")
      return
    }
    setSubmitting(true)
    try {
      const { error } = await supabase.from("tramites").insert({
        titulo: form.titulo,
        slug: form.slug || slugify(form.titulo),
        descripcion: form.descripcion || null,
        requisitos: form.requisitos.split("\n").map((r) => r.trim()).filter(Boolean),
        dependencia_id: form.dependencia_id || null,
        tiempo_estimado: form.tiempo_estimado || null,
        costo: form.costo || null,
        formulario_pdf: form.formulario_pdf,
        activo: form.activo,
      })
      if (error) {
        addToast(error.message.includes("duplicate") ? "Ya existe un trámite con ese título" : error.message, "error")
        return
      }
      addToast("Trámite creado", "success")
      router.push("/admin/tramites")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/tramites">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Nuevo Trámite</h1>
          <p className="text-sm text-muted-foreground">Registrar un nuevo trámite municipal</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Trámite</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input value={form.titulo} onChange={(e) => handleChange("titulo", e.target.value)} placeholder="Nombre del trámite" required />
            </div>

            <div className="space-y-2">
              <Label>Slug (URL)</Label>
              <Input value={form.slug} onChange={(e) => { setSlugTouched(true); handleChange("slug", e.target.value) }} placeholder="patente-municipal" />
            </div>

            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea rows={4} value={form.descripcion} onChange={(e) => handleChange("descripcion", e.target.value)} placeholder="Descripción del trámite" />
            </div>

            <div className="space-y-2">
              <Label>Requisitos</Label>
              <Textarea rows={4} value={form.requisitos} onChange={(e) => handleChange("requisitos", e.target.value)} placeholder="Requisitos necesarios (uno por línea)" />
            </div>

            <div className="space-y-2">
              <Label>Dependencia</Label>
              <Select value={form.dependencia_id} onChange={(e) => handleChange("dependencia_id", e.target.value)} options={dependencias} placeholder="Seleccionar dependencia" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tiempo Estimado</Label>
                <Input value={form.tiempo_estimado} onChange={(e) => handleChange("tiempo_estimado", e.target.value)} placeholder="Ej: 5 días hábiles" />
              </div>
              <div className="space-y-2">
                <Label>Costo</Label>
                <Input value={form.costo} onChange={(e) => handleChange("costo", e.target.value)} placeholder="Ej: Bs. 200" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Formulario PDF</Label>
              <FileUpload
                bucket="documentos"
                accept="application/pdf"
                value={form.formulario_pdf}
                onChange={(url) => handleChange("formulario_pdf", url)}
                label="Formulario"
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="activo"
                checked={form.activo}
                onChange={(e) => handleChange("activo", e.target.checked)}
              />
              <Label htmlFor="activo" className="cursor-pointer">Trámite activo</Label>
            </div>

            <div className="flex gap-4">
              <Button type="submit" loading={submitting}>
                <Save className="mr-2 h-4 w-4" />
                Guardar Trámite
              </Button>
              <Link href="/admin/tramites">
                <Button variant="outline" type="button">Cancelar</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
