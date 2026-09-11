"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUpload } from "@/components/admin/file-upload"
import { useToast } from "@/components/ui/toast"
import { hoyLocalISO } from "@/lib/utils"
import { ArrowLeft, Save } from "lucide-react"

export default function NuevaGaleriaPage() {
  const router = useRouter()
  const { addToast } = useToast()

  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    album: "General",
    imagen: null as string | null,
    fecha: hoyLocalISO(),
    orden: "0",
  })
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.titulo.trim() || !form.imagen) {
      addToast("El título y la imagen son obligatorios", "error")
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch("/api/admin/galeria", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: form.titulo,
          descripcion: form.descripcion || null,
          imagen: form.imagen,
          album: form.album || "General",
          fecha: form.fecha || hoyLocalISO(),
          orden: form.orden ? Number(form.orden) : 0,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        addToast(data.error || "Error al guardar", "error")
        return
      }
      addToast("Imagen guardada en la galería", "success")
      router.push("/admin/galeria")
    } finally {
      setSubmitting(false)
    }
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
          <h1 className="text-2xl font-bold">Nueva Imagen</h1>
          <p className="text-sm text-muted-foreground">Agregar imagen a la galería</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información de la Imagen</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título</Label>
              <Input
                id="titulo"
                placeholder="Título de la imagen"
                value={form.titulo}
                onChange={(e) => handleChange("titulo", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                placeholder="Descripción de la imagen"
                rows={3}
                value={form.descripcion}
                onChange={(e) => handleChange("descripcion", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="album">Álbum</Label>
              <Input
                id="album"
                placeholder="Ej: Eventos, Obras, Cultura"
                value={form.album}
                onChange={(e) => handleChange("album", e.target.value)}
              />
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
                <Label htmlFor="fecha">Fecha</Label>
                <Input
                  id="fecha"
                  type="date"
                  value={form.fecha}
                  onChange={(e) => handleChange("fecha", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="orden">Orden</Label>
                <Input
                  id="orden"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.orden}
                  onChange={(e) => handleChange("orden", e.target.value)}
                />
              </div>
            </div>

            <div className="sticky bottom-0 -mx-6 mt-6 flex items-center justify-end gap-3 border-t border-border bg-background/95 px-6 py-4 backdrop-blur">
              <Link href="/admin/galeria">
                <Button type="button" variant="outline">Cancelar</Button>
              </Link>
              <Button type="submit" loading={submitting}>
                <Save className="mr-2 h-4 w-4" />
                Guardar Imagen
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
