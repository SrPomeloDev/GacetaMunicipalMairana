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
import { createClient } from "@/lib/supabase/client"

interface ConcejalOption {
  id: string
  nombre_completo: string
}

export default function ComisionFormPage() {
  const params = useParams()
  const router = useRouter()
  const isNew = params.id === "nueva"
  const { addToast } = useToast()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    autoridad_id: "",
    comision: "",
    cargo_comision: "",
  })
  const [concejales, setConcejales] = useState<ConcejalOption[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(!isNew)

  useEffect(() => {
    const loadConcejales = async () => {
      const { data, error } = await supabase
        .from("autoridades")
        .select("id,nombre_completo")
        .eq("tipo_autoridad", "concejal")
        .eq("activo", true)
        .order("orden")
      if (error) {
        addToast(error.message, "error")
        return
      }
      setConcejales(data || [])
    }
    loadConcejales()
  }, [supabase, addToast])

  useEffect(() => {
    if (isNew) return
    const load = async () => {
      const res = await fetch(`/api/admin/concejo/comisiones/${params.id}`)
      const data = await res.json()
      if (!res.ok) {
        addToast(data.error || "Error al cargar", "error")
        router.push("/admin/concejo/comisiones")
        return
      }
      setFormData({
        autoridad_id: data.autoridad_id || "",
        comision: data.comision || "",
        cargo_comision: data.cargo_comision || "",
      })
      setLoading(false)
    }
    load()
  }, [isNew, params.id, router, addToast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.autoridad_id || !formData.comision.trim()) {
      addToast("El concejal y la comisión son obligatorios", "error")
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch(isNew ? "/api/admin/concejo/comisiones" : `/api/admin/concejo/comisiones/${params.id}`, {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (!res.ok) {
        addToast(data.error || "Error al guardar", "error")
        return
      }
      addToast(isNew ? "Comisión creada" : "Comisión actualizada", "success")
      router.push("/admin/concejo/comisiones")
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
        <h1 className="text-2xl font-bold">{isNew ? "Nueva Comisión" : "Editar Comisión"}</h1>
        <Link href="/admin/concejo/comisiones">
          <Button variant="outline">Cancelar</Button>
        </Link>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Datos de la Comisión</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Concejal</Label>
              <Select name="autoridad_id" value={formData.autoridad_id} onChange={handleChange} options={concejales.map((c) => ({ value: c.id, label: c.nombre_completo }))} placeholder="Selecciona un concejal..." required />
            </div>
            <div className="space-y-2">
              <Label>Comisión</Label>
              <Input name="comision" value={formData.comision} onChange={handleChange} placeholder="Ej: Comisión de Obras Públicas" required />
            </div>
            <div className="space-y-2">
              <Label>Cargo</Label>
              <Input name="cargo_comision" value={formData.cargo_comision} onChange={handleChange} placeholder="Ej: Presidente / Secretario" />
            </div>
          </CardContent>
        </Card>
        <div className="flex gap-4 justify-end">
          <Link href="/admin/concejo/comisiones">
            <Button type="button" variant="outline">Cancelar</Button>
          </Link>
          <Button type="submit" loading={submitting}>
            {isNew ? "Crear Comisión" : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </div>
  )
}
