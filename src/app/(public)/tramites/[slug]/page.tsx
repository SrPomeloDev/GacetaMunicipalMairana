"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import PageHeader from "@/components/layout/page-header"
import { CheckCircle, Clock, DollarSign, Download, ClipboardList, Building2, ArrowLeft, Mail, Phone } from "lucide-react"
import type { Tramite } from "@/types"

interface TramiteDetalle extends Tramite {
  dependencia?: { nombre?: string; telefono?: string | null; correo?: string | null } | null
}

export default function TramiteDetallePage() {
  const params = useParams()
  const router = useRouter()
  const [tramite, setTramite] = useState<TramiteDetalle | null>(null)
  const [loading, setLoading] = useState(true)

  const cargar = useCallback(async () => {
    const res = await fetch(`/api/tramites/${params.slug}`)
    if (!res.ok) {
      router.replace("/tramites")
      return
    }
    setTramite(await res.json())
    setLoading(false)
  }, [params.slug, router])

  useEffect(() => {
    const run = async () => {
      await cargar()
    }
    run()
  }, [cargar])

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="mt-4 h-6 w-1/3" />
        <div className="mt-8 space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
      </div>
    )
  }

  if (!tramite) return null

  return (
    <>
      <PageHeader
        title={tramite.titulo}
        description={tramite.descripcion || "Trámite del Gobierno Autónomo Municipal de Mairana."}
        crumbs={[{ label: "Trámites", href: "/tramites" }, { label: tramite.titulo }]}
        icon={<ClipboardList className="hidden h-8 w-8 text-primary sm:block" />}
      />
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <Link href="/tramites" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Volver a Trámites
        </Link>

        <Card className="mb-6 overflow-hidden border-primary/20">
          <div className="h-2 bg-gradient-to-r from-primary to-primary/60" />
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center gap-3">
              {tramite.tiempo_estimado && (
                <Badge variant="secondary" className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {tramite.tiempo_estimado}
                </Badge>
              )}
              {tramite.costo && (
                <Badge variant="outline" className="flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5" />
                  {tramite.costo}
                </Badge>
              )}
            </div>

            <h2 className="mt-6 mb-3 text-lg font-bold text-foreground flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              Requisitos
            </h2>
            {tramite.requisitos.length > 0 ? (
              <ul className="space-y-2">
                {tramite.requisitos.map((req, i) => (
                  <li key={i} className="flex items-start gap-2 rounded-lg border bg-card p-3 text-sm text-muted-foreground">
                    <span className="mt-1 flex h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {req}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Sin requisitos específicos declarados.</p>
            )}

            {tramite.formulario_pdf ? (
              <div className="mt-6">
                <a
                  href={tramite.formulario_pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90"
                >
                  <Download className="h-4 w-4" />
                  Descargar Formulario
                </a>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {tramite.dependencia && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-serif">
                <Building2 className="h-5 w-5 text-primary" />
                Dependencia Responsable
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{tramite.dependencia.nombre}</p>
              {tramite.dependencia.telefono && (
                <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" />{tramite.dependencia.telefono}</p>
              )}
              {tramite.dependencia.correo && (
                <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" />{tramite.dependencia.correo}</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}
