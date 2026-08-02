"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUpload } from "@/components/admin/file-upload"
import { useToast } from "@/components/ui/toast"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/lib/supabase/client"
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
  const supabase = createClient()

  const [form, setForm] = useState({ ...DEFAULT_CONFIG })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase.from("configuracion").select("*").eq("id", 1).maybeSingle()
      if (error && !error.message.includes("does not exist")) {
        addToast(error.message, "error")
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
  }, [supabase, addToast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { error } = await supabase.from("configuracion").upsert({
        id: 1,
        ...form,
      })
      if (error) {
        addToast(
          error.message.includes("does not exist")
            ? "La tabla 'configuracion' no existe. Ejecuta la migración 00003_configuracion.sql en Supabase SQL Editor."
            : error.message,
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
      <div className="flex items-center justify-between">
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
              <Label>Nombre del Municipio</Label>
              <Input value={form.municipio} onChange={(e) => setForm((prev) => ({ ...prev, municipio: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Lema</Label>
              <Input value={form.lema} onChange={(e) => setForm((prev) => ({ ...prev, lema: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Dirección</Label>
            <Input value={form.direccion} onChange={(e) => setForm((prev) => ({ ...prev, direccion: e.target.value }))} placeholder="Plaza Principal s/n, Mairana, Santa Cruz" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input value={form.telefono} onChange={(e) => setForm((prev) => ({ ...prev, telefono: e.target.value }))} placeholder="+591 ..." />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} placeholder="info@mairana.gob.bo" />
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
              <Label>Facebook</Label>
              <Input value={form.facebook} onChange={(e) => setForm((prev) => ({ ...prev, facebook: e.target.value }))} placeholder="https://facebook.com/..." />
            </div>
            <div className="space-y-2">
              <Label>Twitter / X</Label>
              <Input value={form.twitter} onChange={(e) => setForm((prev) => ({ ...prev, twitter: e.target.value }))} placeholder="https://x.com/..." />
            </div>
            <div className="space-y-2">
              <Label>YouTube</Label>
              <Input value={form.youtube} onChange={(e) => setForm((prev) => ({ ...prev, youtube: e.target.value }))} placeholder="https://youtube.com/@..." />
            </div>
            <div className="space-y-2">
              <Label>Instagram</Label>
              <Input value={form.instagram} onChange={(e) => setForm((prev) => ({ ...prev, instagram: e.target.value }))} placeholder="https://instagram.com/..." />
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
              <Label>Color Institucional</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.color_primario}
                  onChange={(e) => setForm((prev) => ({ ...prev, color_primario: e.target.value }))}
                  className="h-10 w-14 cursor-pointer rounded-md border border-input bg-background p-1"
                />
                <Input value={form.color_primario} onChange={(e) => setForm((prev) => ({ ...prev, color_primario: e.target.value }))} className="max-w-[140px]" />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Logo del Municipio</Label>
            <FileUpload
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
