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
import { useDirtyGuard } from "@/hooks/use-dirty-guard"
import { ArrowLeft, Save } from "lucide-react"

export default function EditarGaleriaPage() {
  const params = useParams()
  const router = useRouter()
  const { addToast } = useToast()

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
  const [dirty, setDirty] = useState(false)
  useDirtyGuard(dirty)

  const patch = (p: Partial<typeof form>) => {
    setDirty(true)
    setForm((prev) => ({ ...prev, ...p }))
  }

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/admin/galeria/${params.id}`)
      const data = await res.json()
      if (!res.ok) {
        addToast(data.error || "Error al cargar", "error")
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
  }, [params.id, router, addToast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.titulo.trim() || !form.imagen) {
      addToast("El título y la imagen son obligatorios", "error")
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch(`/api/admin/galeria/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: form.titulo,
          descripcion: form.descripcion || null,
          imagen: form.imagen,
          album: form.album || "General",
          fecha: form.fecha || null,
          orden: form.orden ? Number(form.orden) : 0,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        addToast(data.error || "Error al guardar", "error")
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
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Volver
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
              <Input value={form.titulo} onChange={(e) => patch({ titulo: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea rows={3} value={form.descripcion} onChange={(e) => patch({ descripcion: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Álbum</Label>
              <Input value={form.album} onChange={(e) => patch({ album: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Imagen</Label>
              <FileUpload
                bucket="galeria"
                accept="image/*"
                value={form.imagen}
                onChange={(url) => patch({ imagen: url })}
                label="Imagen"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha</Label>
                <Input type="date" value={form.fecha} onChange={(e) => patch({ fecha: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Orden</Label>
                <Input type="number" min="0" value={form.orden} onChange={(e) => patch({ orden: e.target.value })} />
              </div>
            </div>
            <div className="sticky bottom-0 -mx-6 mt-6 flex items-center justify-end gap-3 border-t border-border bg-background/95 px-6 py-4 backdrop-blur">
              <Link href="/admin/galeria">
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
