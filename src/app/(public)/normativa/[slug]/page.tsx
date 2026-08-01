import Link from "next/link"
import { notFound } from "next/navigation"
import { headers } from "next/headers"
import QRCode from "qrcode"
import { cn, getEstadoColor, getEstadoLabel, formatDate } from "@/lib/utils"
import { FileText, Download, QrCode, Share2, Clock, Building2, Hash, Calendar, ChevronRight, ArrowLeft, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PdfViewer } from "@/components/normativa/pdf-viewer"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Normativa, CategoriaNormativa, Dependencia, ModificacionNormativa } from "@/types"

async function getNormativa(slug: string) {
  const supabase = createAdminClient()
  const { data: normativa, error } = await supabase
    .from("normativa")
    .select("*")
    .eq("slug", slug)
    .eq("publicada", true)
    .single()

  if (error || !normativa) return null

  const [catRes, depRes, modRes] = await Promise.all([
    supabase.from("categorias_normativa").select("*").eq("id", normativa.categoria_id).single(),
    supabase.from("dependencias").select("*").eq("id", normativa.dependencia_id).single(),
    supabase
      .from("modificaciones_normativa")
      .select("*, normativa_modificadora:normativa!normativa_modificadora_id(numero, titulo, slug)")
      .eq("normativa_id", normativa.id),
  ])

  return {
    normativa: normativa as Normativa,
    categoria: (catRes.error ? null : catRes.data) as CategoriaNormativa | null,
    dependencia: (depRes.error ? null : depRes.data) as Dependencia | null,
    modificaciones: (modRes.error ? [] : modRes.data ?? []) as (ModificacionNormativa & { normativa_modificadora?: Pick<Normativa, "numero" | "titulo" | "slug"> | null })[],
  }
}

export default async function NormativaDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await getNormativa(slug)
  if (!data) notFound()

  const n = data.normativa
  const modificaciones = data.modificaciones ?? []

  const h = await headers()
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000"
  const proto = h.get("x-forwarded-proto") ?? (process.env.NODE_ENV === "production" ? "https" : "http")
  const qrContent = n.archivo_pdf ?? `${proto}://${host}/normativa/${n.slug}`
  const qrDataUrl = await QRCode.toDataURL(qrContent, { width: 192, margin: 1 }).catch(() => null)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-primary transition-colors">Inicio</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/normativa" className="hover:text-primary transition-colors">Normativa</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground truncate max-w-[200px]">{n.titulo}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-primary">{n.numero}</p>
              <h1 className="mt-1 text-2xl sm:text-3xl font-bold font-serif text-foreground">{n.titulo}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge>{data.categoria?.nombre || "Normativa"}</Badge>
                <span className={cn("inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold", getEstadoColor(n.estado))}>
                  {getEstadoLabel(n.estado)}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Building2 className="h-3.5 w-3.5" />
                  {data.dependencia?.nombre || "GAM Mairana"}
                </span>
              </div>
            </div>
          </div>

          {n.archivo_pdf ? (
            <PdfViewer url={n.archivo_pdf} titulo={n.titulo} />
          ) : (
            <div className="aspect-[4/3] rounded-2xl border-2 border-dashed bg-muted/30 flex flex-col items-center justify-center text-muted-foreground">
              <FileText className="h-16 w-16 mb-4 text-muted-foreground/50" />
              <p className="text-lg font-medium">Visor de PDF - Próximamente</p>
              <p className="text-sm mt-1">El visor de documentos estará disponible próximamente</p>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-serif">Información del Documento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="leading-relaxed text-muted-foreground">
                {n.resumen || "No se cuenta con resumen disponible para esta normativa."}
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                  <Hash className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Número de Páginas</p>
                    <p className="font-medium">{n.numero_paginas ?? "-"} páginas</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                  <Printer className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Formato</p>
                    <p className="font-medium">{n.archivo_pdf ? "PDF Digital" : "Texto Digital"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {modificaciones.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-serif">
                  <Clock className="h-5 w-5 text-primary" />
                  Modificaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative pl-6 border-l-2 border-primary/20 space-y-6">
                  {modificaciones.map((mod, i) => (
                    <div key={mod.id || i} className="relative">
                      <div className="absolute -left-[25px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary ring-4 ring-background">
                        <div className="h-2 w-2 rounded-full bg-white" />
                      </div>
                      <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={mod.tipo_modificacion === "modifica" ? "warning" : "secondary"} className="capitalize">{mod.tipo_modificacion}</Badge>
                          <span className="text-xs text-muted-foreground">{formatDate(mod.fecha, "short")}</span>
                        </div>
                        <p className="font-medium text-sm">
                          {mod.normativa_modificadora
                            ? <Link href={`/normativa/${mod.normativa_modificadora.slug}`} className="hover:text-primary transition-colors">{mod.normativa_modificadora.numero} - {mod.normativa_modificadora.titulo}</Link>
                            : mod.normativa_modificadora_id}
                        </p>
                        {mod.descripcion && <p className="mt-1 text-sm text-muted-foreground">{mod.descripcion}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-serif">Metadatos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">Número</p>
                <p className="font-medium">{n.numero}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Estado</p>
                <span className={cn("inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold", getEstadoColor(n.estado))}>
                  {getEstadoLabel(n.estado)}
                </span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Categoría</p>
                <p className="font-medium">{data.categoria?.nombre || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Dependencia</p>
                <p className="font-medium">{data.dependencia?.nombre || "-"}</p>
              </div>
              <div className="border-t pt-4 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Aprobación</p>
                    <p className="font-medium">{n.fecha_aprobacion ? formatDate(n.fecha_aprobacion, "short") : "-"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Publicación</p>
                    <p className="font-medium">{n.fecha_publicacion ? formatDate(n.fecha_publicacion, "short") : "-"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Vigencia</p>
                    <p className="font-medium">{n.fecha_vigencia ? formatDate(n.fecha_vigencia, "short") : "-"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {n.archivo_pdf ? (
            <a
              href={n.archivo_pdf}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Download className="h-4 w-4" />
              Descargar PDF
            </a>
          ) : (
            <Button className="w-full gap-2" disabled>
              <Download className="h-4 w-4" />
              PDF no disponible
            </Button>
          )}

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center gap-3">
                <div className="flex h-24 w-24 items-center justify-center rounded-xl border-2 border-dashed bg-white">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt={`Código QR de ${n.numero}`}
                      className="h-20 w-20 rounded-lg"
                    />
                  ) : (
                    <QrCode className="h-10 w-10 text-muted-foreground" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground text-center">Escaneá el código QR para acceder al documento</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <p className="mb-3 text-sm font-medium flex items-center gap-2">
                <Share2 className="h-4 w-4 text-primary" />
                Compartir
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="rounded-full">
                  <span className="text-xs font-bold">F</span>
                </Button>
                <Button variant="outline" size="icon" className="rounded-full">
                  <span className="text-xs font-bold">X</span>
                </Button>
                <Button variant="outline" size="icon" className="rounded-full">
                  <span className="text-xs font-bold">in</span>
                </Button>
                <Button variant="outline" size="icon" className="rounded-full">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Link href="/normativa" className="flex items-center gap-2 text-sm text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Volver a Normativa
          </Link>
        </div>
      </div>
    </div>
  )
}
