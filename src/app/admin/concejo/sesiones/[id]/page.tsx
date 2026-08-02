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

const TIPO_OPTIONS = [
  { value: "ordinaria", label: "Ordinaria" },
  { value: "extraordinaria", label: "Extraordinaria" },
  { value: "audiencia_publica", label: "Audiencia Pública" },
  { value: "instalacion", label: "Instalación" },
]

export default function SesionFormPage() {
  const params = useParams()
  const router = useRouter()
  const isNew = params.id === "nueva"
  const { addToast } = useToast()

  const [formData, setFormData] = useState({
    numero_sesion: "",
    fecha: "",
    tipo: "ordinaria",
    agenda: "",
    acta_pdf: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(!isNew)

  useEffect(() => {
    if (isNew) return
    const load = async () => {
      const res = await fetch(`/api/admin/concejo/sesiones/${params.id}`)
      const data = await res.json()
      if (!res.ok) {
        addToast(data.error || "Error al cargar", "error")
        router.push("/admin/concejo")
        return
      }
      setFormData({
        numero_sesion: String(data.numero_sesion ?? ""),
        fecha: data.fecha ? data.fecha.slice(0, 10) : "",
        tipo: data.tipo || "ordinaria",
        agenda: data.agenda || "",
        acta_pdf: data.acta_pdf || "",
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
    if (!formData.numero_sesion.trim() || !formData.fecha) {
      addToast("La sesión y la fecha son obligatorias", "error")
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch(isNew ? "/api/admin/concejo/sesiones" : `/api/admin/concejo/sesiones/${params.id}`, {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (!res.ok) {
        addToast(data.error || "Error al guardar", "error")
        return
      }
      addToast(isNew ? "Sesión creada" : "Sesión actualizada", "success")
      router.push("/admin/concejo")
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
        <h1 className="text-2xl font-bold">{isNew ? "Nueva Sesión" : "Editar Sesión"}</h1>
        <Link href="/admin/concejo">
          <Button variant="outline">Cancelar</Button>
        </Link>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Datos de la Sesión</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Sesión N°</Label>
                <Input name="numero_sesion" value={formData.numero_sesion} onChange={handleChange} placeholder="Ej: 12/2026" required />
              </div>
              <div className="space-y-2">
                <Label>Fecha</Label>
                <Input type="date" name="fecha" value={formData.fecha} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select name="tipo" value={formData.tipo} onChange={handleChange} options={TIPO_OPTIONS} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Agenda</Label>
              <textarea
                name="agenda"
                value={formData.agenda}
                onChange={handleChange}
                rows={4}
                className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Puntos de la agenda de la sesión..."
              />
            </div>
            <div className="space-y-2">
              <Label>Acta (PDF)</Label>
              <FileUpload
                bucket="normativa-pdf"
                value={formData.acta_pdf}
                onChange={(url) => setFormData((prev) => ({ ...prev, acta_pdf: url }))}
                accept=".pdf"
              />
            </div>
          </CardContent>
        </Card>
        <div className="flex gap-4 justify-end">
          <Link href="/admin/concejo">
            <Button type="button" variant="outline">Cancelar</Button>
          </Link>
          <Button type="submit" loading={submitting}>
            {isNew ? "Crear Sesión" : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </div>
  )
}
