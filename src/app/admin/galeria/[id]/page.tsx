"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUpload } from "@/components/admin/file-upload"
import { useToast } from "@/components/ui/toast"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/lib/supabase/client"
import { ArrowLeft, Save } from "lucide-react"

export default function EditarGaleriaPage() {
  const params = useParams()
  const router = useRouter()
  const { addToast } = useToast()
  const supabase = createClient()

  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    album: "General",
    imagen: null as string | null,
    fecha: "",
    orden: "0",
  })
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase.from("galeria").select("*").eq("id", params.id as string).single()
      if (error) {
        addToast(error.message, "error")
        router.push("/admin/galeria")
        return
      }
      setForm({
        titulo: data.titulo,
        descripcion: data.descripcion || "",
        album: data.album,
        imagen: data.imagen,
        fecha: data.fecha || "",
        orden: String(data.orden ?? 0),
      })
      setLoading(false)
    }
    load()
  }, [params.id, supabase, router, addToast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.titulo.trim() || !form.imagen) {
      addToast("El título y la imagen son obligatorios", "error")
      return
    }
    setSubmitting(true)
    try {
      const { error } = await supabase.from("galeria").update({
        titulo: form.titulo,
        descripcion: form.descripcion || null,
        imagen: form.imagen,
        album: form.album || "General",
        fecha: form.fecha || null,
        orden: form.orden ? Number(form.orden) : 0,
      }).eq("id", params.id as string)
      if (error) {
        addToast(error.message, "error")
        return
      }
      addToast("Imagen actualizada", "success")
      router.push("/admin/galeria")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/galeria">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Editar Imagen</h1>
          <p className="text-sm text-muted-foreground">Modificar información de la imagen</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información de la Imagen</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input value={form.titulo} onChange={(e) => setForm((prev) => ({ ...prev, titulo: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea rows={3} value={form.descripcion} onChange={(e) => setForm((prev) => ({ ...prev, descripcion: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Álbum</Label>
              <Input value={form.album} onChange={(e) => setForm((prev) => ({ ...prev, album: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Imagen</Label>
              <FileUpload
                bucket="galeria"
                accept="image/*"
                value={form.imagen}
                onChange={(url) => setForm((prev) => ({ ...prev, imagen: url }))}
                label="Imagen"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha</Label>
                <Input type="date" value={form.fecha} onChange={(e) => setForm((prev) => ({ ...prev, fecha: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Orden</Label>
                <Input type="number" min="0" value={form.orden} onChange={(e) => setForm((prev) => ({ ...prev, orden: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-4">
              <Button type="submit" loading={submitting}>
                <Save className="mr-2 h-4 w-4" />
                Guardar Cambios
              </Button>
              <Link href="/admin/galeria">
                <Button variant="outline" type="button">Cancelar</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
