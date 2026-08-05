"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import PageHeader from "@/components/layout/page-header"
import { createClient } from "@/lib/supabase/client"
import { Phone, Mail, Building2, Target, FileText, ChevronRight, Landmark } from "lucide-react"

interface AutoridadEjecutiva {
  id: string
  nombre_completo: string
  cargo: string
  email?: string | null
  telefono?: string | null
  foto?: string | null
  biografia?: string | null
  dependencia_id?: string | null
}

interface DependenciaEjecutiva {
  id: string
  nombre: string
  descripcion?: string | null
  telefono?: string | null
  correo?: string | null
}

export default function OrganoEjecutivoPage() {
  const supabase = createClient()
  const [alcalde, setAlcalde] = useState<AutoridadEjecutiva | null>(null)
  const [secretarias, setSecretarias] = useState<DependenciaEjecutiva[]>([])
  const [directores, setDirectores] = useState<AutoridadEjecutiva[]>([])
  const [loading, setLoading] = useState(true)

  const cargar = useCallback(async () => {
    const [autoridades, dependencias] = await Promise.all([
      supabase.from("autoridades").select("*").eq("activo", true).order("orden"),
      supabase.from("dependencias").select("*").order("orden"),
    ])
    const autoridadesData = (autoridades.data || []) as AutoridadEjecutiva[]
    const dependenciasData = (dependencias.data || []) as DependenciaEjecutiva[]
    setAlcalde(autoridadesData.find((a) => a.cargo.toLowerCase().includes("alcalde")) || null)
    setSecretarias(dependenciasData)
    setDirectores(autoridadesData.filter((a) => !a.cargo.toLowerCase().includes("alcalde") && !a.cargo.toLowerCase().includes("concejal")))
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    const run = async () => {
      await cargar()
    }
    run()
  }, [cargar])

  return (
    <>
      <PageHeader
        title="Órgano Ejecutivo"
        description="Gobierno Autónomo Municipal de Mairana - Gestión 2026. Conocé al Alcalde, las Secretarías y la planificación institucional."
        crumbs={[{ label: "Autoridades", href: "/autoridades" }, { label: "Órgano Ejecutivo" }]}
        icon={<Landmark className="h-8 w-8 text-primary sm:h-9 sm:w-9" />}
      >
        <Badge className="px-3 py-1 text-xs">Ejecutivo</Badge>
      </PageHeader>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {loading ? (
          <div className="space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
            <div className="grid gap-6 lg:grid-cols-2">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-64 w-full" />)}</div>
          </div>
        ) : (
          <>
            <Card className="mb-10 overflow-hidden border-primary/20 transition-all hover:shadow-lg">
              <div className="h-3 bg-gradient-to-r from-primary via-primary/80 to-primary/60" />
              <CardContent className="p-8">
                <div className="flex flex-col items-center text-center lg:flex-row lg:text-left lg:items-start lg:gap-8">
                  <div className="mb-6 lg:mb-0">
                    {alcalde?.foto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={alcalde.foto}
                        alt={alcalde.nombre_completo}
                        className="h-32 w-32 rounded-full object-cover shadow-lg ring-4 ring-primary/20"
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src="/images/AlcaldeMairana.png"
                        alt="Alcalde Municipal de Mairana"
                        className="h-32 w-32 rounded-full object-cover shadow-lg ring-4 ring-primary/20"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <Badge className="mb-3 text-sm px-4 py-1">Alcalde Municipal</Badge>
                    <h2 className="text-3xl font-bold text-foreground font-serif">{alcalde?.nombre_completo || "Alcalde Municipal"}</h2>
                    <p className="mt-1 text-lg text-muted-foreground">{alcalde?.cargo || "Máxima autoridad ejecutiva"}</p>
                    {alcalde?.biografia && <p className="mt-4 max-w-2xl text-muted-foreground leading-relaxed">{alcalde.biografia}</p>}
                    <div className="mt-6 flex flex-wrap gap-6">
                      {alcalde?.email && (
                        <a href={`mailto:${alcalde.email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                          <Mail className="h-4 w-4" />
                          {alcalde.email}
                        </a>
                      )}
                      {alcalde?.telefono && (
                        <a href={`tel:${alcalde.telefono}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                          <Phone className="h-4 w-4" />
                          {alcalde.telefono}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mb-10">
              <h2 className="mb-6 text-2xl font-bold text-foreground font-serif flex items-center gap-2">
                <Building2 className="h-6 w-6 text-primary" />
                Secretarías y Direcciones
              </h2>
              {secretarias.length === 0 ? (
                <p className="text-sm text-muted-foreground">Las dependencias municipales se publicarán próximamente.</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {secretarias.map((sec) => (
                    <Card key={sec.id} className="group transition-all hover:shadow-md">
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary-foreground">
                            <Building2 className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">{sec.nombre}</h3>
                            {sec.descripcion && <p className="mt-1 text-xs text-muted-foreground">{sec.descripcion}</p>}
                            {sec.telefono && <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" />{sec.telefono}</p>}
                            {sec.correo && <p className="mt-0.5 text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" />{sec.correo}</p>}
                          </div>
                          <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {directores.length > 0 && (
              <div className="mb-10">
                <h2 className="mb-6 text-2xl font-bold text-foreground font-serif flex items-center gap-2">
                  <Building2 className="h-6 w-6 text-primary" />
                  Directores y Jefaturas
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {directores.map((dir) => (
                    <Card key={dir.id} className="transition-all hover:shadow-md">
                      <CardContent className="p-5">
                        <h3 className="font-semibold text-card-foreground">{dir.nombre_completo}</h3>
                        <p className="text-sm text-muted-foreground">{dir.cargo}</p>
                        {dir.email && (
                          <a href={`mailto:${dir.email}`} className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                            <Mail className="h-3 w-3" />
                            {dir.email}
                          </a>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl font-serif">
                    <Target className="h-5 w-5 text-primary" />
                    Plan de Gobierno
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center">
                    <Target className="h-12 w-12 text-muted-foreground/50 mb-3" />
                    <p className="text-lg font-semibold text-foreground">Plan de Gobierno 2026-2030</p>
                    <p className="mt-1 text-sm text-muted-foreground">El plan de gobierno estará disponible próximamente</p>
                    <div className="mt-6 grid grid-cols-3 gap-4 w-full max-w-sm">
                      <div className="rounded-lg bg-muted/50 p-3 text-center">
                        <p className="text-2xl font-bold text-primary">5</p>
                        <p className="text-xs text-muted-foreground">Ejes</p>
                      </div>
                      <div className="rounded-lg bg-muted/50 p-3 text-center">
                        <p className="text-2xl font-bold text-primary">20</p>
                        <p className="text-xs text-muted-foreground">Programas</p>
                      </div>
                      <div className="rounded-lg bg-muted/50 p-3 text-center">
                        <p className="text-2xl font-bold text-primary">80</p>
                        <p className="text-xs text-muted-foreground">Proyectos</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl font-serif">
                    <FileText className="h-5 w-5 text-primary" />
                    Rendición de Cuentas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground/50 mb-3" />
                    <p className="text-lg font-semibold text-foreground">Rendición de Cuentas</p>
                    <p className="mt-1 text-sm text-muted-foreground">Los informes de rendición de cuentas están disponibles en el Portal de Transparencia</p>
                    <div className="mt-6 w-full max-w-sm">
                      <a href="/transparencia" className="flex items-center justify-between rounded-lg border bg-card p-3 hover:border-primary/40 hover:text-primary transition-colors">
                        <span className="text-sm font-medium text-foreground">Ver Portal de Transparencia</span>
                        <ChevronRight className="h-4 w-4 text-primary" />
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </>
  )
}
