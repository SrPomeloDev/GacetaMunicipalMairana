"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
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
import { Skeleton } from "@/components/ui/skeleton"
import type { Transparencia } from "@/types"
import { useDirtyGuard } from "@/hooks/use-dirty-guard"
import { ArrowLeft, Save } from "lucide-react"

const CATEGORIAS_OPTIONS = [
  { value: "presupuesto", label: "Presupuesto" },
  { value: "poa", label: "POA" },
  { value: "pei", label: "PEI" },
  { value: "contratacion", label: "Contratación" },
  { value: "auditoria", label: "Auditoría" },
  { value: "financiero", label: "Financiero" },
  { value: "declaracion", label: "Declaración" },
  { value: "informe", label: "Informe" },
]

export default function EditarDocumentoPage() {
  const params = useParams()
  const router = useRouter()
  const { addToast } = useToast()

  const [form, setForm] = useState({
    titulo: "",
    categoria: "presupuesto",
    descripcion: "",
    archivo_pdf: null as string | null,
    fecha: "",
    publicada: true,
  })
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [dirty, setDirty] = useState(false)
  useDirtyGuard(dirty)

  const patch = (p: Partial<typeof form>) => {
    setDirty(true)
    setForm((prev) => ({ ...prev, ...p }))
  }

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/admin/transparencia/${params.id}`)
      const data = await res.json()
      if (!res.ok) {
        addToast(data.error || "Error al cargar", "error")
        router.push("/admin/transparencia")
        return
      }
      setForm({
        titulo: data.titulo,
        categoria: data.categoria,
        descripcion: data.descripcion || "",
        archivo_pdf: data.archivo_pdf,
        fecha: data.fecha || "",
        publicada: data.publicada,
      })
      setLoading(false)
    }
    load()
  }, [params.id, router, addToast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.titulo.trim() || !form.archivo_pdf) {
      addToast("El título y el archivo PDF son obligatorios", "error")
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch(`/api/admin/transparencia/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: form.titulo,
          categoria: form.categoria as Transparencia["categoria"],
          descripcion: form.descripcion || null,
          archivo_pdf: form.archivo_pdf,
          fecha: form.fecha || null,
          publicada: form.publicada,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        addToast(data.error || "Error al guardar", "error")
        return
      }
      addToast("Documento actualizado", "success")
      router.push("/admin/transparencia")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/transparencia">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Editar Documento</h1>
          <p className="text-sm text-muted-foreground">Modificar documento de transparencia</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Documento</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input value={form.titulo} onChange={(e) => patch({ titulo: e.target.value })} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoría</Label>
                <Select value={form.categoria} onChange={(e) => patch({ categoria: e.target.value })} options={CATEGORIAS_OPTIONS} />
              </div>
              <div className="space-y-2">
                <Label>Fecha</Label>
                <Input type="date" value={form.fecha} onChange={(e) => patch({ fecha: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea rows={3} value={form.descripcion} onChange={(e) => patch({ descripcion: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Archivo PDF</Label>
              <FileUpload
                bucket="documentos"
                accept="application/pdf"
                value={form.archivo_pdf}
                onChange={(url) => patch({ archivo_pdf: url })}
                label="PDF"
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="publicada"
                checked={form.publicada}
                onChange={(e) => patch({ publicada: e.target.checked })}
              />
              <Label htmlFor="publicada" className="cursor-pointer">Publicada (visible al público)</Label>
            </div>
            <div className="sticky bottom-0 -mx-6 mt-6 flex items-center justify-end gap-3 border-t border-border bg-background/95 px-6 py-4 backdrop-blur">
              <Link href="/admin/transparencia">
                <Button type="button" variant="outline">Cancelar</Button>
              </Link>
              <Button type="submit" loading={submitting}>
                <Save className="mr-2 h-4 w-4" />
                Guardar Cambios
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
