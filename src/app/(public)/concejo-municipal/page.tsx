"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import PageHeader from "@/components/layout/page-header"
import { createClient } from "@/lib/supabase/client"
import { formatDate } from "@/lib/utils"
import { Phone, Mail, Calendar, FileText, Users, Scale, Shield, Landmark } from "lucide-react"

interface AutoridadConcejo {
  id: string
  nombre_completo: string
  cargo: string
  email?: string | null
  telefono?: string | null
  foto?: string | null
}

interface ComisionRow {
  id: string
  comision: string
  cargo_comision: string
  autoridad?: { nombre_completo?: string; cargo?: string } | null
}

interface SesionRow {
  id: string
  numero_sesion: string
  fecha: string
  tipo: string
  agenda?: string | null
  acta_pdf?: string | null
}

const TIPO_LABEL: Record<string, string> = {
  ordinaria: "Ordinaria", extraordinaria: "Extraordinaria",
  audiencia_publica: "Audiencia Pública", instalacion: "Instalación",
}

export default function ConcejoPage() {
  const supabase = createClient()
  const [concejales, setConcejales] = useState<AutoridadConcejo[]>([])
  const [presidencia, setPresidencia] = useState<AutoridadConcejo[]>([])
  const [comisiones, setComisiones] = useState<ComisionRow[]>([])
  const [sesiones, setSesiones] = useState<SesionRow[]>([])
  const [loading, setLoading] = useState(true)

  const cargar = useCallback(async () => {
    const [autoridades, comisionesRes, sesionesRes] = await Promise.all([
      supabase.from("autoridades").select("*").eq("tipo_autoridad", "concejal").eq("activo", true).order("orden"),
      supabase
        .from("concejales_comisiones")
        .select("*, autoridad:autoridades(nombre_completo, cargo)")
        .order("comision"),
      supabase.from("concejo_sesiones").select("*").order("fecha", { ascending: false }).limit(6),
    ])
    const concejales = (autoridades.data || []) as AutoridadConcejo[]
    const presidenciaCargos = ["Presidente", "Presidenta", "Vicepresidente", "Vicepresidenta"]
    setConcejales(concejales.filter((c) => !presidenciaCargos.some((p) => (c.cargo || "").toLowerCase().includes(p.toLowerCase()))))
    setPresidencia(concejales.filter((c) => presidenciaCargos.some((p) => (c.cargo || "").toLowerCase().includes(p.toLowerCase()))))
    setComisiones((comisionesRes.data as ComisionRow[]) || [])
    setSesiones((sesionesRes.data as SesionRow[]) || [])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    const run = async () => {
      await cargar()
    }
    run()
  }, [cargar])

  const initials = (name: string) => name.split(" ").map((n) => n[0]).slice(0, 2).join("")

  const renderPersonaCard = (persona: AutoridadConcejo) => (
    <Card key={persona.id} className="overflow-hidden border-primary/20 transition-all hover:shadow-md">
      <div className="h-2 bg-gradient-to-r from-primary to-primary/60" />
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:items-start sm:gap-5">
          <div className="mb-4 sm:mb-0 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 text-3xl font-bold text-white shadow-md">
            {persona.foto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={persona.foto} alt={persona.nombre_completo} className="h-full w-full rounded-full object-cover" />
            ) : initials(persona.nombre_completo)}
          </div>
          <div className="flex-1">
            <Badge className="mb-2">{persona.cargo.toLowerCase().includes("vice") ? "Vicepresidencia" : "Presidencia"}</Badge>
            <h3 className="text-xl font-bold text-foreground">{persona.nombre_completo}</h3>
            <p className="text-muted-foreground">{persona.cargo}</p>
            <div className="mt-4 space-y-1.5">
              {persona.email && (
                <a href={`mailto:${persona.email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <Mail className="h-3.5 w-3.5" />
                  {persona.email}
                </a>
              )}
              {persona.telefono && (
                <a href={`tel:${persona.telefono}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <Phone className="h-3.5 w-3.5" />
                  {persona.telefono}
                </a>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <>
      <PageHeader
        title="Concejo Municipal"
        description="Conocé a los representantes del Honorable Concejo Municipal de Mairana, sus comisiones y el calendario de sesiones legislativas."
        crumbs={[{ label: "Autoridades", href: "/autoridades" }, { label: "Concejo Municipal" }]}
        icon={<Landmark className="h-8 w-8 text-primary sm:h-9 sm:w-9" />}
      >
        <Badge className="px-3 py-1 text-xs">Legislativo</Badge>
      </PageHeader>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {loading ? (
          <div className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-40 w-full" />)}</div>
            <Skeleton className="h-48 w-full" />
            <div className="grid gap-6 lg:grid-cols-2">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-64 w-full" />)}</div>
          </div>
        ) : presidencia.length === 0 && concejales.length === 0 && comisiones.length === 0 && sesiones.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center">
            <Landmark className="mb-4 h-10 w-10 text-muted-foreground" />
            <p className="text-lg font-medium text-foreground">Sin información del Concejo</p>
            <p className="mt-1 text-sm text-muted-foreground">Los datos del Concejo Municipal se publicarán próximamente.</p>
          </div>
        ) : (
          <>
            {presidencia.length > 0 && (
              <div className="mb-10 grid gap-6 sm:grid-cols-2">
                {presidencia.map(renderPersonaCard)}
              </div>
            )}

            {concejales.length > 0 && (
              <div className="mb-10">
                <h2 className="mb-6 text-2xl font-bold text-foreground font-serif flex items-center gap-2">
                  <Users className="h-6 w-6 text-primary" />
                  Concejales
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {concejales.map((concejal) => (
                    <Card key={concejal.id} className="transition-all hover:shadow-md">
                      <CardContent className="p-5 text-center">
                        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary/80 to-primary/40 text-xl font-bold text-white">
                          {concejal.foto ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={concejal.foto} alt={concejal.nombre_completo} className="h-full w-full object-cover" />
                          ) : initials(concejal.nombre_completo)}
                        </div>
                        <h3 className="font-semibold text-card-foreground">{concejal.nombre_completo}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{concejal.cargo}</p>
                        {concejal.email && (
                          <div className="mt-3 space-y-1">
                            <a href={`mailto:${concejal.email}`} className="flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                              <Mail className="h-3 w-3" />
                              {concejal.email}
                            </a>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-10 grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl font-serif">
                    <Scale className="h-5 w-5 text-primary" />
                    Comisiones
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {comisiones.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Aún no se registran comisiones.</p>
                  ) : (
                    <div className="space-y-4">
                      {comisiones.map((com) => (
                        <div key={com.id} className="flex items-start gap-3 rounded-lg border bg-card p-4">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary-foreground">
                            <Shield className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-card-foreground">{com.comision}</p>
                            <p className="text-sm text-muted-foreground">
                              {com.autoridad?.nombre_completo ? `${com.cargo_comision || "Miembro"}: ${com.autoridad.nombre_completo}` : com.cargo_comision || "Miembro"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl font-serif">
                    <Calendar className="h-5 w-5 text-primary" />
                    Sesiones Recientes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {sesiones.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Aún no se registran sesiones.</p>
                  ) : (
                    <div className="space-y-4">
                      {sesiones.map((ses) => (
                        <div key={ses.id} className="flex items-start gap-3 rounded-lg border bg-card p-4">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary-foreground">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-card-foreground">{ses.numero_sesion}</p>
                            <p className="text-sm text-muted-foreground">{formatDate(ses.fecha, "long")}</p>
                            <div className="mt-1 flex items-center gap-2">
                              <Badge variant="secondary" className="text-[10px]">{TIPO_LABEL[ses.tipo] || ses.tipo}</Badge>
                              {ses.agenda && <span className="text-xs text-muted-foreground truncate">{ses.agenda}</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </>
  )
}
