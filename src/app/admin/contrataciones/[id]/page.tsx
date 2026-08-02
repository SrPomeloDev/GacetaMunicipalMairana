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
import { FileUpload } from "@/components/admin/file-upload"
import { Checkbox } from "@/components/ui/checkbox"

const TIPO_OPTIONS = [
  { value: "licitacion", label: "Licitación" },
  { value: "apoyo_nacional", label: "Apoyo Nacional" },
  { value: "compras_menores", label: "Compras Menores" },
  { value: "contratacion_directa", label: "Contratación Directa" },
  { value: "emergencia", label: "Emergencia" },
]

const ESTADO_OPTIONS = [
  { value: "borrador", label: "Borrador" },
  { value: "publicada", label: "Publicada" },
  { value: "adjudicada", label: "Adjudicada" },
  { value: "desierta", label: "Desierta" },
  { value: "concluida", label: "Concluida" },
]

export default function ContratacionFormPage() {
  const params = useParams()
  const router = useRouter()
  const isNew = params.id === "nueva"
  const { addToast } = useToast()

  const [formData, setFormData] = useState({
    titulo: "",
    tipo: "licitacion",
    modalidad: "",
    objeto: "",
    monto: "",
    empresa_adjudicada: "",
    fecha_publicacion: new Date().toISOString().slice(0, 10),
    fecha_presentacion: "",
    fecha_adjudicacion: "",
    archivo_pdf: "",
    estado: "publicada",
    publicada: true,
  })
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(!isNew)

  useEffect(() => {
    if (isNew) return
    const load = async () => {
      const res = await fetch(`/api/admin/contrataciones/${params.id}`)
      const data = await res.json()
      if (!res.ok) {
        addToast(data.error || "Error al cargar", "error")
        router.push("/admin/contrataciones")
        return
      }
      setFormData({
        titulo: data.titulo || "",
        tipo: data.tipo || "licitacion",
        modalidad: data.modalidad || "",
        objeto: data.objeto || "",
        monto: data.monto !== null && data.monto !== undefined ? String(data.monto) : "",
        empresa_adjudicada: data.empresa_adjudicada || "",
        fecha_publicacion: data.fecha_publicacion ? data.fecha_publicacion.slice(0, 10) : new Date().toISOString().slice(0, 10),
        fecha_presentacion: data.fecha_presentacion ? data.fecha_presentacion.slice(0, 10) : "",
        fecha_adjudicacion: data.fecha_adjudicacion ? data.fecha_adjudicacion.slice(0, 10) : "",
        archivo_pdf: data.archivo_pdf || "",
        estado: data.estado || "publicada",
        publicada: data.publicada ?? true,
      })
      setLoading(false)
    }
    load()
  }, [isNew, params.id, router, addToast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.titulo.trim()) {
      addToast("El título es obligatorio", "error")
      return
    }
    setSubmitting(true)
    try {
      const body = {
        ...formData,
        monto: formData.monto.trim() ? Number(formData.monto) : null,
      }
      const res = await fetch(isNew ? "/api/admin/contrataciones" : `/api/admin/contrataciones/${params.id}`, {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        addToast(data.error || "Error al guardar", "error")
        return
      }
      addToast(isNew ? "Contratación creada" : "Contratación actualizada", "success")
      router.push("/admin/contrataciones")
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
        <h1 className="text-2xl font-bold">{isNew ? "Nueva Contratación" : "Editar Contratación"}</h1>
        <Link href="/admin/contrataciones">
          <Button variant="outline">Cancelar</Button>
        </Link>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Datos de la Contratación</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input name="titulo" value={formData.titulo} onChange={handleChange} placeholder="Ej: Licitación para el asfaltado de la Av. Principal" required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select name="tipo" value={formData.tipo} onChange={handleChange} options={TIPO_OPTIONS} />
              </div>
              <div className="space-y-2">
                <Label>Modalidad</Label>
                <Input name="modalidad" value={formData.modalidad} onChange={handleChange} placeholder="Ej: ANPE 01/2026" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Objeto de la contratación</Label>
              <textarea
                name="objeto"
                value={formData.objeto}
                onChange={handleChange}
                rows={3}
                className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Descripción del bien, obra o servicio a contratar..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Monto referencial (Bs.)</Label>
                <Input type="number" step="0.01" min="0" name="monto" value={formData.monto} onChange={handleChange} placeholder="Ej: 125000" />
              </div>
              <div className="space-y-2">
                <Label>Empresa adjudicada</Label>
                <Input name="empresa_adjudicada" value={formData.empresa_adjudicada} onChange={handleChange} placeholder="Razón social (si aplica)" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Fecha de publicación</Label>
                <Input type="date" name="fecha_publicacion" value={formData.fecha_publicacion} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label>Fecha límite presentación</Label>
                <Input type="date" name="fecha_presentacion" value={formData.fecha_presentacion} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label>Fecha adjudicación</Label>
                <Input type="date" name="fecha_adjudicacion" value={formData.fecha_adjudicacion} onChange={handleChange} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select name="estado" value={formData.estado} onChange={handleChange} options={ESTADO_OPTIONS} />
              </div>
              <div className="flex items-end gap-2 pb-2">
                <Checkbox
                  id="publicada"
                  checked={formData.publicada}
                  onChange={(e) => setFormData((prev) => ({ ...prev, publicada: e.target.checked }))}
                />
                <Label htmlFor="publicada" className="cursor-pointer">Publicada (visible al público)</Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Documento (PDF)</Label>
              <FileUpload
                bucket="documentos"
                value={formData.archivo_pdf}
                onChange={(url) => setFormData((prev) => ({ ...prev, archivo_pdf: url ?? "" }))}
                accept=".pdf"
              />
            </div>
          </CardContent>
        </Card>
        <div className="flex gap-4 justify-end">
          <Link href="/admin/contrataciones">
            <Button type="button" variant="outline">Cancelar</Button>
          </Link>
          <Button type="submit" loading={submitting}>
            {isNew ? "Crear Contratación" : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </div>
  )
}
