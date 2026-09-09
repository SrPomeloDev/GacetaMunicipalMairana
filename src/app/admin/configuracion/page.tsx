"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUpload } from "@/components/admin/file-upload"
import { useToast } from "@/components/ui/toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Save, Building2, Share2, Palette } from "lucide-react"

const DEFAULT_CONFIG = {
  municipio: "Gobierno Autónomo Municipal de Mairana",
  lema: "Capital Tabacalera de Bolivia",
  direccion: "",
  telefono: "",
  email: "",
  facebook: "",
  twitter: "",
  youtube: "",
  instagram: "",
  color_primario: "#EA580C",
  logo_url: null as string | null,
}

export default function AdminConfiguracionPage() {
  const { addToast } = useToast()

  const [form, setForm] = useState({ ...DEFAULT_CONFIG })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/admin/configuracion")
      const data = await res.json()
      if (!res.ok) {
        addToast(data.error || "Error al cargar configuración", "error")
        setLoading(false)
        return
      }
      if (data) {
        setForm({
          municipio: data.municipio,
          lema: data.lema || "",
          direccion: data.direccion || "",
          telefono: data.telefono || "",
          email: data.email || "",
          facebook: data.facebook || "",
          twitter: data.twitter || "",
          youtube: data.youtube || "",
          instagram: data.instagram || "",
          color_primario: data.color_primario || "#EA580C",
          logo_url: data.logo_url,
        })
      }
      setLoading(false)
    }
    load()
  }, [addToast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch("/api/admin/configuracion", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: 1, ...form }),
      })
      const data = await res.json()
      if (!res.ok) {
        addToast(
          data.error?.includes("does not exist")
            ? "La tabla 'configuracion' no existe. Ejecuta la migración 00003_configuracion.sql en Supabase SQL Editor."
            : (data.error || "Error al guardar"),
          "error"
        )
        return
      }
      addToast("Configuración guardada", "success")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Configuración</h1>
          <p className="text-sm text-muted-foreground">Configuración general del municipio</p>
        </div>
        <Button type="submit" loading={saving}>
          <Save className="mr-2 h-4 w-4" />
          Guardar Cambios
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Información del Municipio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cfg-municipio">Nombre del Municipio</Label>
              <Input id="cfg-municipio" value={form.municipio} onChange={(e) => setForm((prev) => ({ ...prev, municipio: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cfg-lema">Lema</Label>
              <Input id="cfg-lema" value={form.lema} onChange={(e) => setForm((prev) => ({ ...prev, lema: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cfg-direccion">Dirección</Label>
            <Input id="cfg-direccion" value={form.direccion} onChange={(e) => setForm((prev) => ({ ...prev, direccion: e.target.value }))} placeholder="Plaza Principal s/n, Mairana, Santa Cruz" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cfg-telefono">Teléfono</Label>
              <Input id="cfg-telefono" value={form.telefono} onChange={(e) => setForm((prev) => ({ ...prev, telefono: e.target.value }))} placeholder="+591 ..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cfg-email">Email</Label>
              <Input id="cfg-email" type="email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} placeholder="info@mairana.gob.bo" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            Redes Sociales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cfg-facebook">Facebook</Label>
              <Input id="cfg-facebook" value={form.facebook} onChange={(e) => setForm((prev) => ({ ...prev, facebook: e.target.value }))} placeholder="https://facebook.com/..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cfg-twitter">Twitter / X</Label>
              <Input id="cfg-twitter" value={form.twitter} onChange={(e) => setForm((prev) => ({ ...prev, twitter: e.target.value }))} placeholder="https://x.com/..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cfg-youtube">YouTube</Label>
              <Input id="cfg-youtube" value={form.youtube} onChange={(e) => setForm((prev) => ({ ...prev, youtube: e.target.value }))} placeholder="https://youtube.com/@..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cfg-instagram">Instagram</Label>
              <Input id="cfg-instagram" value={form.instagram} onChange={(e) => setForm((prev) => ({ ...prev, instagram: e.target.value }))} placeholder="https://instagram.com/..." />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            Personalización
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="space-y-2 flex-1">
              <Label htmlFor="cfg-color">Color Institucional</Label>
              <div className="flex items-center gap-3">
                <input
                  id="cfg-color-picker"
                  aria-label="Selector de color institucional"
                  type="color"
                  value={form.color_primario}
                  onChange={(e) => setForm((prev) => ({ ...prev, color_primario: e.target.value }))}
                  className="h-10 w-14 cursor-pointer rounded-md border border-input bg-background p-1"
                />
                <Input id="cfg-color" value={form.color_primario} onChange={(e) => setForm((prev) => ({ ...prev, color_primario: e.target.value }))} className="max-w-[140px]" />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cfg-logo">Logo del Municipio</Label>
            <FileUpload
              id="cfg-logo"
              bucket="noticias-imagenes"
              accept="image/*"
              value={form.logo_url}
              onChange={(url) => setForm((prev) => ({ ...prev, logo_url: url }))}
              label="Logo"
            />
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
