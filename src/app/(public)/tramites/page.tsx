"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, DollarSign, Download, ClipboardList } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Tramite } from "@/types"

export default function TramitesPage() {
  const [tramites, setTramites] = useState<Tramite[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchTramites = useCallback(async () => {
    const { data, error } = await supabase
      .from("tramites")
      .select("*")
      .eq("activo", true)
      .order("created_at")
    if (!error && data) setTramites(data)
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    const run = async () => {
      await fetchTramites()
    }
    run()
  }, [fetchTramites])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground font-serif">Trámites Municipales</h1>
        <div className="mt-2 h-1 w-20 rounded-full bg-primary" />
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Información sobre los trámites disponibles en el Gobierno Autónomo Municipal de Mairana. Conocé los requisitos, tiempos y costos.
        </p>
      </div>

      {loading ? (
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-6 w-1/2 rounded bg-muted animate-pulse" />
                <div className="mt-3 h-4 w-full rounded bg-muted/60 animate-pulse" />
                <div className="mt-3 h-4 w-3/4 rounded bg-muted/60 animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : tramites.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center">
          <ClipboardList className="h-12 w-12 text-muted-foreground/50 mb-3" />
          <p className="text-lg font-medium text-foreground">No hay trámites registrados</p>
          <p className="text-sm text-muted-foreground mt-1">Los trámites activos del panel de administración aparecerán aquí.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {tramites.map((tramite) => (
            <Card key={tramite.id} className="transition-all hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <ClipboardList className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-semibold text-card-foreground">{tramite.titulo}</h3>
                    {tramite.descripcion && (
                      <p className="mt-2 text-muted-foreground leading-relaxed">{tramite.descripcion}</p>
                    )}

                    {tramite.requisitos.length > 0 && (
                      <div className="mt-4">
                        <p className="mb-2 text-sm font-medium text-foreground flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-primary" />
                          Requisitos
                        </p>
                        <ul className="space-y-1.5">
                          {tramite.requisitos.map((req, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <span className="mt-1 flex h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap items-center gap-4">
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

                    {tramite.formulario_pdf ? (
                      <div className="mt-4">
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
                    ) : (
                      <div className="mt-4">
                        <Button variant="outline" disabled className="gap-2">
                          <Download className="h-4 w-4" />
                          Formulario no disponible
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
