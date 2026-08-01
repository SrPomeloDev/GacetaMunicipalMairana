"use client"

import { useState } from "react"
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

export default function NuevoDocumentoPage() {
  const router = useRouter()
  const { addToast } = useToast()
  const supabase = createClient()

  const [form, setForm] = useState({
    titulo: "",
    categoria: "presupuesto",
    descripcion: "",
    archivo_pdf: null as string | null,
    fecha: new Date().toISOString().slice(0, 10),
    publicada: true,
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.titulo.trim() || !form.archivo_pdf) {
      addToast("El título y el archivo PDF son obligatorios", "error")
      return
    }
    setSubmitting(true)
    try {
      const { error } = await supabase.from("transparencia").insert({
        titulo: form.titulo,
        categoria: form.categoria,
        descripcion: form.descripcion || null,
        archivo_pdf: form.archivo_pdf,
        fecha: form.fecha || new Date().toISOString().slice(0, 10),
        publicada: form.publicada,
      })
      if (error) {
        addToast(error.message, "error")
        return
      }
      addToast("Documento creado", "success")
      router.push("/admin/transparencia")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/transparencia">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Nuevo Documento</h1>
          <p className="text-sm text-muted-foreground">Subir documento de transparencia</p>
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
              <Input value={form.titulo} onChange={(e) => setForm((prev) => ({ ...prev, titulo: e.target.value }))} placeholder="Ej: Presupuesto General 2026" required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoría</Label>
                <Select value={form.categoria} onChange={(e) => setForm((prev) => ({ ...prev, categoria: e.target.value }))} options={CATEGORIAS_OPTIONS} />
              </div>
              <div className="space-y-2">
                <Label>Fecha</Label>
                <Input type="date" value={form.fecha} onChange={(e) => setForm((prev) => ({ ...prev, fecha: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea rows={3} value={form.descripcion} onChange={(e) => setForm((prev) => ({ ...prev, descripcion: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Archivo PDF</Label>
              <FileUpload
                bucket="documentos"
                accept="application/pdf"
                value={form.archivo_pdf}
                onChange={(url) => setForm((prev) => ({ ...prev, archivo_pdf: url }))}
                label="PDF"
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="publicada"
                checked={form.publicada}
                onCheckedChange={(checked) => setForm((prev) => ({ ...prev, publicada: checked === true }))}
              />
              <Label htmlFor="publicada" className="cursor-pointer">Publicada (visible al público)</Label>
            </div>
            <div className="flex gap-4">
              <Button type="submit" loading={submitting}>
                <Save className="mr-2 h-4 w-4" />
                Guardar Documento
              </Button>
              <Link href="/admin/transparencia">
                <Button variant="outline" type="button">Cancelar</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
