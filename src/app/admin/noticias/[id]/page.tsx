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
import { RichTextEditor } from "@/components/admin/rich-text-editor"
import { useToast } from "@/components/ui/toast"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/lib/supabase/client"
import { slugify, esUrlFacebook, esUrlFacebookCanonico } from "@/lib/utils"
import { sanitizeHtml } from "@/lib/sanitize"
import { ArrowLeft } from "lucide-react"
import type { Noticia } from "@/types"

const CATEGORIAS_OPTIONS = [
  { value: "institucional", label: "Institucional" },
  { value: "evento", label: "Evento" },
  { value: "programa", label: "Programa" },
  { value: "comunicado", label: "Comunicado" },
  { value: "cultura", label: "Cultura" },
]

export default function NoticiaFormPage() {
  const params = useParams()
  const router = useRouter()
  const isNew = params.id === "nueva"
  const { addToast } = useToast()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    titulo: "",
    slug: "",
    resumen: "",
    contenido: "",
    categoria: "institucional",
    destacada: false,
    publicada: false,
    fecha_publicacion: "",
    imagen_principal: null as string | null,
    facebook_url: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(!isNew)
  const [slugTouched, setSlugTouched] = useState(false)
  const [verificandoFb, setVerificandoFb] = useState(false)
  const [tab, setTab] = useState<"editar" | "vista">("editar")

  useEffect(() => {
    if (isNew) return
    const load = async () => {
      const { data, error } = await supabase
        .from("noticias")
        .select("*")
        .eq("id", params.id as string)
        .single()
      if (error) {
        addToast(error.message, "error")
        router.push("/admin/noticias")
        return
      }
      setFormData({
        titulo: data.titulo,
        slug: data.slug,
        resumen: data.resumen || "",
        contenido: data.contenido || "",
        categoria: data.categoria,
        destacada: data.destacada,
        publicada: data.publicada,
        fecha_publicacion: data.fecha_publicacion ? data.fecha_publicacion.slice(0, 16) : "",
        imagen_principal: data.imagen_principal,
        facebook_url: data.facebook_url || "",
      })
      setLoading(false)
    }
    load()
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

  const handleVerificarFb = async () => {
    const raw = formData.facebook_url.trim()
    if (!raw) {
      addToast("Pegá primero el enlace de Facebook", "error")
      return
    }
    setVerificandoFb(true)
    try {
      const res = await fetch(`/api/admin/facebook/resolver?url=${encodeURIComponent(raw)}`)
      const data = await res.json()
      if (!res.ok) {
        addToast(data.error || "No se pudo verificar el enlace", "error")
        return
      }
      setFormData((prev) => ({
        ...prev,
        facebook_url: data.url,
        titulo: prev.titulo.trim() ? prev.titulo : (data.titulo || prev.titulo),
      }))
      addToast("Enlace verificado", "success")
    } catch {
      addToast("No se pudo verificar el enlace", "error")
    } finally {
      setVerificandoFb(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.titulo.trim()) {
      addToast("El título es obligatorio", "error")
      return
    }
    const fbUrl = formData.facebook_url.trim()
    if (fbUrl && !esUrlFacebook(fbUrl)) {
      addToast("El enlace de Facebook no es válido (debe ser una URL de facebook.com)", "error")
      return
    }
    if (fbUrl && !esUrlFacebookCanonico(fbUrl)) {
      addToast("Usá el botón Verificar para convertir el enlace en la URL directa del post", "error")
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        titulo: formData.titulo,
        slug: formData.slug || slugify(formData.titulo),
        resumen: formData.resumen || null,
        contenido: formData.contenido || null,
        categoria: formData.categoria as Noticia["categoria"],
        destacada: formData.destacada,
        publicada: formData.publicada,
        fecha_publicacion: formData.fecha_publicacion ? new Date(formData.fecha_publicacion).toISOString() : null,
        imagen_principal: formData.imagen_principal,
        facebook_url: formData.facebook_url.trim() || null,
      }
      const { error } = isNew
        ? await supabase.from("noticias").insert(payload)
        : await supabase.from("noticias").update(payload).eq("id", params.id as string)
      if (error) {
        addToast(error.message.includes("duplicate") ? "Ya existe una noticia con ese título/slug" : error.message, "error")
        return
      }
      addToast(isNew ? "Noticia creada" : "Noticia actualizada", "success")
      router.push("/admin/noticias")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="space-y-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/admin/noticias">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">{isNew ? "Nueva Noticia" : "Editar Noticia"}</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Información General</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input name="titulo" value={formData.titulo} onChange={handleChange} placeholder="Título de la noticia" required />
            </div>
            <div className="space-y-2">
              <Label>Slug (URL)</Label>
              <Input name="slug" value={formData.slug} onChange={(e) => { setSlugTouched(true); handleChange(e) }} placeholder="titulo-de-la-noticia" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoría</Label>
                <Select name="categoria" value={formData.categoria} onChange={handleChange} options={CATEGORIAS_OPTIONS} />
              </div>
              <div className="space-y-2">
                <Label>Fecha de Publicación</Label>
                <Input type="datetime-local" name="fecha_publicacion" value={formData.fecha_publicacion} onChange={handleChange} />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <input type="checkbox" name="destacada" id="destacada" checked={formData.destacada} onChange={handleChange} className="h-4 w-4 rounded border-input text-primary focus:ring-primary" />
                <Label htmlFor="destacada">Noticia destacada</Label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" name="publicada" id="publicada" checked={formData.publicada} onChange={handleChange} className="h-4 w-4 rounded border-input text-primary focus:ring-primary" />
                <Label htmlFor="publicada">Publicada (visible al público)</Label>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Contenido</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Imagen Principal (opcional si hay enlace de Facebook)</Label>
              <FileUpload
                bucket="noticias-imagenes"
                accept="image/*"
                value={formData.imagen_principal}
                onChange={(url) => setFormData((prev) => ({ ...prev, imagen_principal: url }))}
                label="Imagen"
              />
            </div>
            <div className="space-y-2">
              <Label>Enlace de Facebook (opcional)</Label>
              <div className="flex gap-2">
                <Input name="facebook_url" value={formData.facebook_url} onChange={handleChange} placeholder="https://www.facebook.com/.../posts/..." className="flex-1" />
                <Button type="button" variant="outline" onClick={handleVerificarFb} loading={verificandoFb}>
                  Verificar
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Acepta links para compartir: se convierten solos a la URL directa. El post debe ser público.</p>
              {formData.facebook_url.trim() && esUrlFacebook(formData.facebook_url) && (
                <div className="overflow-hidden rounded-xl border border-border/60 bg-muted/30 p-3">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">Vista previa</p>
                  <iframe
                    src={`https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(formData.facebook_url.trim())}&show_text=true&width=500`}
                    width="500"
                    height="440"
                    style={{ border: "none", overflow: "hidden" }}
                    scrolling="no"
                    frameBorder="0"
                    allowFullScreen
                    loading="lazy"
                    title="Vista previa de la publicación de Facebook"
                    className="mx-auto w-full max-w-[500px] rounded-lg bg-background"
                  />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Resumen (opcional si hay enlace de Facebook)</Label>
              <textarea
                name="resumen"
                value={formData.resumen}
                onChange={handleChange}
                rows={3}
                className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Resumen breve de la noticia"
              />
            </div>
            <div className="space-y-2">
              <Label>Contenido</Label>
              <div className="flex gap-1">
                <Button type="button" variant={tab === "editar" ? "default" : "ghost"} size="sm" onClick={() => setTab("editar")}>
                  Editar
                </Button>
                <Button type="button" variant={tab === "vista" ? "default" : "ghost"} size="sm" onClick={() => setTab("vista")}>
                  Vista previa
                </Button>
              </div>
              {tab === "editar" ? (
                <RichTextEditor
                  value={formData.contenido}
                  onChange={(html) => setFormData((prev) => ({ ...prev, contenido: html }))}
                />
              ) : formData.contenido ? (
                <div
                  className="min-h-[220px] rounded-lg border border-input bg-background px-4 py-3 text-sm leading-relaxed [&_a]:text-primary [&_a]:underline [&_blockquote]:my-2 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-xl [&_h2]:font-bold [&_h3]:mb-1 [&_h3]:mt-3 [&_h3]:text-lg [&_h3]:font-semibold [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-2 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(formData.contenido) }}
                />
              ) : (
                <p className="rounded-lg border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
                  Sin contenido
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        <div className="sticky bottom-0 mt-6 flex items-center justify-end gap-3 border-t border-border bg-background/95 px-6 py-4 backdrop-blur">
          <Link href="/admin/noticias">
            <Button type="button" variant="outline">Cancelar</Button>
          </Link>
          <Button type="submit" loading={submitting}>
            {isNew ? "Crear Noticia" : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </div>
  )
}
