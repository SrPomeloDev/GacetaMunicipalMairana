"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUpload } from "@/components/admin/file-upload"
import { useToast } from "@/components/ui/toast"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/lib/supabase/client"
import { slugify } from "@/lib/utils"

const ESTADOS_OPTIONS = [
  { value: "vigente", label: "Vigente" },
  { value: "derogada", label: "Derogada" },
  { value: "modificada", label: "Modificada" },
  { value: "suspendida", label: "Suspendida" },
  { value: "abrogada", label: "Abrogada" },
]

const TIPO_MODIFICACION_LABEL: Record<string, string> = {
  deroga: "Deroga", modifica: "Modifica", complementa: "Complementa",
  suspende: "Suspende", prorroga: "Prórroga",
}

const TIPO_MODIFICACION_OPTIONS = Object.entries(TIPO_MODIFICACION_LABEL).map(([value, label]) => ({ value, label }))

interface ModificacionRow {
  id: string
  normativa_id: string
  normativa_modificadora_id: string
  tipo_modificacion: string
  articulos_afectados: string | null
  descripcion: string | null
  fecha: string
  modificadora?: { numero: string; titulo: string } | null
}

export default function NormativaFormPage() {
  const params = useParams()
  const router = useRouter()
  const isNew = params.id === "nueva"
  const { addToast } = useToast()
  const supabase = createClient()

  const [categorias, setCategorias] = useState<{ value: string; label: string }[]>([])
  const [dependencias, setDependencias] = useState<{ value: string; label: string }[]>([])
  const [formData, setFormData] = useState({
    numero: "",
    slug: "",
    titulo: "",
    resumen: "",
    contenido_texto: "",
    categoria_id: "",
    dependencia_id: "",
    estado: "vigente",
    fecha_aprobacion: "",
    fecha_publicacion: "",
    fecha_vigencia: "",
    numero_paginas: "",
    archivo_pdf: null as string | null,
    publicada: false,
    vigencia_indefinida: false,
  })
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [slugTouched, setSlugTouched] = useState(false)

  const [modificaciones, setModificaciones] = useState<ModificacionRow[]>([])
  const [normativasOpts, setNormativasOpts] = useState<{ value: string; label: string }[]>([])
  const [nuevaMod, setNuevaMod] = useState({
    normativa_modificadora_id: "",
    tipo_modificacion: "modifica",
    articulos_afectados: "",
    descripcion: "",
    fecha: "",
  })
  const [savingMod, setSavingMod] = useState(false)

  const cargarModificaciones = async (normativaId: string) => {
    const { data, error } = await supabase
      .from("modificaciones_normativa")
      .select("*, modificadora:normativa!modificaciones_normativa_normativa_modificadora_id_fkey(numero,titulo)")
      .eq("normativa_id", normativaId)
      .order("fecha", { ascending: false })
    if (!error) setModificaciones((data as ModificacionRow[]) || [])
  }

  useEffect(() => {
    const init = async () => {
      const [catRes, depRes, normativaRes, modsRes] = await Promise.all([
        supabase.from("categorias_normativa").select("id,nombre").order("orden"),
        supabase.from("dependencias").select("id,nombre").order("orden"),
        isNew
          ? Promise.resolve({ data: null, error: null })
          : supabase.from("normativa").select("*").eq("id", params.id as string).single(),
        isNew
          ? Promise.resolve({ data: [] as ModificacionRow[], error: null })
          : supabase
              .from("modificaciones_normativa")
              .select("*, modificadora:normativa!modificaciones_normativa_normativa_modificadora_id_fkey(numero,titulo)")
              .eq("normativa_id", params.id as string)
              .order("fecha", { ascending: false }),
      ])
      if (catRes.error) addToast(catRes.error.message, "error")
      if (depRes.error) addToast(depRes.error.message, "error")
      setCategorias((catRes.data || []).map((c) => ({ value: c.id, label: c.nombre })))
      setDependencias((depRes.data || []).map((d) => ({ value: d.id, label: d.nombre })))
      if (!modsRes.error) setModificaciones((modsRes.data as ModificacionRow[]) || [])

      if (normativaRes.error) {
        addToast(normativaRes.error.message, "error")
        if (!isNew) router.push("/admin/normativa")
      } else if (normativaRes.data) {
        const n = normativaRes.data
        setFormData({
          numero: n.numero,
          slug: n.slug,
          titulo: n.titulo,
          resumen: n.resumen || "",
          contenido_texto: n.contenido_texto || "",
          categoria_id: n.categoria_id || "",
          dependencia_id: n.dependencia_id || "",
          estado: n.estado,
          fecha_aprobacion: n.fecha_aprobacion || "",
          fecha_publicacion: n.fecha_publicacion || "",
          fecha_vigencia: n.fecha_vigencia || "",
          numero_paginas: n.numero_paginas ? String(n.numero_paginas) : "",
          archivo_pdf: n.archivo_pdf,
          publicada: n.publicada,
          vigencia_indefinida: !n.fecha_vigencia,
        })
      }
      setLoading(false)
    }
    init()
  }, [isNew, params.id, supabase, router, addToast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined
    setFormData((prev) => {
      const next = { ...prev, [name]: checked !== undefined ? checked : value }
      if (name === "titulo" && !slugTouched) {
        next.slug = slugify(value)
      }
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.titulo.trim() || !formData.numero.trim()) {
      addToast("El título y el número son obligatorios", "error")
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        numero: formData.numero,
        slug: formData.slug || slugify(formData.titulo),
        titulo: formData.titulo,
        resumen: formData.resumen || null,
        contenido_texto: formData.contenido_texto || null,
        categoria_id: formData.categoria_id || null,
        dependencia_id: formData.dependencia_id || null,
        estado: formData.estado,
        fecha_aprobacion: formData.fecha_aprobacion || null,
        fecha_publicacion: formData.fecha_publicacion || null,
        fecha_vigencia: formData.vigencia_indefinida ? null : formData.fecha_vigencia || null,
        numero_paginas: formData.numero_paginas ? Number(formData.numero_paginas) : null,
        archivo_pdf: formData.archivo_pdf,
        publicada: formData.publicada,
      }
      const { error } = isNew
        ? await supabase.from("normativa").insert(payload)
        : await supabase.from("normativa").update(payload).eq("id", params.id as string)
      if (error) {
        addToast(error.message.includes("duplicate") ? "Ya existe una normativa con ese número o slug" : error.message, "error")
        return
      }
      addToast(isNew ? "Normativa creada" : "Normativa actualizada", "success")
      router.push("/admin/normativa")
    } finally {
      setSubmitting(false)
    }
  }

  const cargarNormativasRelacionadas = async () => {
    const { data, error } = await supabase
      .from("normativa")
      .select("id,numero,titulo")
      .neq("id", params.id as string)
      .order("numero")
    if (error) {
      addToast(error.message, "error")
      return
    }
    setNormativasOpts((data || []).map((n) => ({ value: n.id, label: `${n.numero} — ${n.titulo}` })))
  }

  useEffect(() => {
    if (isNew) return
    const run = async () => {
      await cargarNormativasRelacionadas()
    }
    run()
  }, [isNew, params.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddModificacion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nuevaMod.normativa_modificadora_id) {
      addToast("Selecciona la normativa que modifica", "error")
      return
    }
    setSavingMod(true)
    try {
      const { error } = await supabase.from("modificaciones_normativa").insert({
        normativa_id: params.id as string,
        normativa_modificadora_id: nuevaMod.normativa_modificadora_id,
        tipo_modificacion: nuevaMod.tipo_modificacion,
        articulos_afectados: nuevaMod.articulos_afectados || null,
        descripcion: nuevaMod.descripcion || null,
        fecha: nuevaMod.fecha || undefined,
      })
      if (error) {
        addToast(error.message, "error")
        return
      }
      addToast("Modificación registrada", "success")
      setNuevaMod({ normativa_modificadora_id: "", tipo_modificacion: "modifica", articulos_afectados: "", descripcion: "", fecha: "" })
      cargarModificaciones(params.id as string)
    } finally {
      setSavingMod(false)
    }
  }

  const handleDeleteModificacion = async (id: string) => {
    const { error } = await supabase.from("modificaciones_normativa").delete().eq("id", id)
    if (error) {
      addToast(error.message, "error")
      return
    }
    addToast("Modificación eliminada", "success")
    cargarModificaciones(params.id as string)
  }

  if (loading) {
    return <div className="space-y-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{isNew ? "Nueva Normativa" : "Editar Normativa"}</h1>
        <Link href="/admin/normativa">
          <Button variant="outline">Cancelar</Button>
        </Link>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Datos Generales</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Número</Label>
                <Input name="numero" value={formData.numero} onChange={handleChange} placeholder="Ej: 045/2026" required />
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select name="estado" value={formData.estado} onChange={handleChange} options={ESTADOS_OPTIONS} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Título</Label>
              <Input name="titulo" value={formData.titulo} onChange={handleChange} placeholder="Título completo de la norma" required />
            </div>
            <div className="space-y-2">
              <Label>Slug (URL)</Label>
              <Input name="slug" value={formData.slug} onChange={(e) => { setSlugTouched(true); handleChange(e) }} placeholder="ordenanza-045-2026" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoría</Label>
                <Select name="categoria_id" value={formData.categoria_id} onChange={handleChange} options={categorias} placeholder="Seleccionar categoría" />
              </div>
              <div className="space-y-2">
                <Label>Dependencia</Label>
                <Select name="dependencia_id" value={formData.dependencia_id} onChange={handleChange} options={dependencias} placeholder="Seleccionar dependencia" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Fecha de Aprobación</Label>
                <Input type="date" name="fecha_aprobacion" value={formData.fecha_aprobacion} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label>Fecha de Publicación</Label>
                <Input type="date" name="fecha_publicacion" value={formData.fecha_publicacion} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label>Fecha de Vigencia</Label>
                <Input
                  type="date"
                  name="fecha_vigencia"
                  value={formData.fecha_vigencia}
                  onChange={handleChange}
                  disabled={formData.vigencia_indefinida}
                />
                <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    id="vigencia_indefinida"
                    checked={formData.vigencia_indefinida}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        vigencia_indefinida: e.target.checked,
                        fecha_vigencia: e.target.checked ? "" : prev.fecha_vigencia,
                      }))
                    }
                    className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                  />
                  Vigencia indefinida (sin fecha de expiración)
                </label>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Número de Páginas</Label>
                <Input type="number" min="1" name="numero_paginas" value={formData.numero_paginas} onChange={handleChange} placeholder="0" />
              </div>
              <div className="flex items-end gap-2 pb-1">
                <input type="checkbox" name="publicada" id="publicada" checked={formData.publicada} onChange={handleChange} className="h-4 w-4 rounded border-input text-primary focus:ring-primary" />
                <Label htmlFor="publicada">Publicada (visible al público)</Label>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Documento y Contenido</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Archivo PDF</Label>
              <FileUpload
                bucket="normativa-pdf"
                accept="application/pdf"
                value={formData.archivo_pdf}
                onChange={(url) => setFormData((prev) => ({ ...prev, archivo_pdf: url }))}
                label="PDF"
              />
            </div>
            <div className="space-y-2">
              <Label>Resumen</Label>
              <textarea
                name="resumen"
                value={formData.resumen}
                onChange={handleChange}
                rows={3}
                className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Resumen breve de la norma"
              />
            </div>
            <div className="space-y-2">
              <Label>Texto (opcional, si no se sube PDF)</Label>
              <textarea
                name="contenido_texto"
                value={formData.contenido_texto}
                onChange={handleChange}
                rows={10}
                className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Contenido textual de la norma..."
              />
            </div>
          </CardContent>
        </Card>
        {!isNew && (
          <Card>
            <CardHeader><CardTitle>Modificaciones y Relaciones</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {modificaciones.length === 0 ? (
                <p className="text-sm text-muted-foreground">Esta normativa no tiene modificaciones registradas.</p>
              ) : (
                <div className="divide-y rounded-lg border border-border">
                  {modificaciones.map((m) => (
                    <div key={m.id} className="flex items-center justify-between gap-4 p-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            {TIPO_MODIFICACION_LABEL[m.tipo_modificacion] || m.tipo_modificacion}
                          </span>
                          <span className="text-sm font-medium">
                            {m.modificadora ? `${m.modificadora.numero} — ${m.modificadora.titulo}` : "Normativa no encontrada"}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {m.fecha}
                          {m.articulos_afectados ? ` · Artículos: ${m.articulos_afectados}` : ""}
                          {m.descripcion ? ` · ${m.descripcion}` : ""}
                        </p>
                      </div>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteModificacion(m.id)}>Eliminar</Button>
                    </div>
                  ))}
                </div>
              )}
              <form onSubmit={handleAddModificacion} className="space-y-4 rounded-lg border border-dashed border-border p-4">
                <p className="text-sm font-medium">Registrar modificación</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label>Normativa que modifica esta</Label>
                    <Select
                      name="normativa_modificadora_id"
                      value={nuevaMod.normativa_modificadora_id}
                      onChange={(e) => setNuevaMod((prev) => ({ ...prev, normativa_modificadora_id: e.target.value }))}
                      options={normativasOpts}
                      placeholder="Seleccionar normativa modificadora"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo de modificación</Label>
                    <Select
                      name="tipo_modificacion"
                      value={nuevaMod.tipo_modificacion}
                      onChange={(e) => setNuevaMod((prev) => ({ ...prev, tipo_modificacion: e.target.value }))}
                      options={TIPO_MODIFICACION_OPTIONS}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Fecha</Label>
                    <Input type="date" value={nuevaMod.fecha} onChange={(e) => setNuevaMod((prev) => ({ ...prev, fecha: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Artículos afectados</Label>
                    <Input value={nuevaMod.articulos_afectados} onChange={(e) => setNuevaMod((prev) => ({ ...prev, articulos_afectados: e.target.value }))} placeholder="Ej: Art. 5, 7" />
                  </div>
                  <div className="space-y-2">
                    <Label>Descripción</Label>
                    <Input value={nuevaMod.descripcion} onChange={(e) => setNuevaMod((prev) => ({ ...prev, descripcion: e.target.value }))} placeholder="Opcional" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" variant="outline" loading={savingMod}>Agregar Modificación</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
        <div className="flex gap-4 justify-end">
          <Link href="/admin/normativa">
            <Button type="button" variant="outline">Cancelar</Button>
          </Link>
          <Button type="submit" loading={submitting}>
            {isNew ? "Crear Normativa" : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </div>
  )
}
