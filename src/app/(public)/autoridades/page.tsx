"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, Users } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Autoridad } from "@/types"

const TIPO_LABEL: Record<string, string> = {
  alcalde: "Alcalde", concejal: "Concejal", secretario: "Secretario",
  director: "Director", jefe_unidad: "Jefe de Unidad", subalcalde: "Subalcalde",
}

export default function AutoridadesPage() {
  const [autoridades, setAutoridades] = useState<Autoridad[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState("Todos")
  const supabase = createClient()

  const fetchAutoridades = useCallback(async () => {
    const { data, error } = await supabase
      .from("autoridades")
      .select("*")
      .eq("activo", true)
      .order("orden")
    if (!error && data) setAutoridades(data)
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    const run = async () => {
      await fetchAutoridades()
    }
    run()
  }, [fetchAutoridades])

  const filterOptions = useMemo(() => {
    const set = new Set<string>()
    autoridades.forEach((a) => set.add(TIPO_LABEL[a.tipo_autoridad] || a.tipo_autoridad))
    return ["Todos", ...Array.from(set)]
  }, [autoridades])

  const filtered = activeFilter === "Todos"
    ? autoridades
    : autoridades.filter(a => (TIPO_LABEL[a.tipo_autoridad] || a.tipo_autoridad) === activeFilter)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground font-serif">Autoridades Municipales</h1>
        <div className="mt-2 h-1 w-20 rounded-full bg-primary" />
        <p className="mt-4 text-muted-foreground">Conocé a las autoridades que gobiernan nuestro municipio</p>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {filterOptions.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              activeFilter === f
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="h-20 w-20 rounded-full bg-muted animate-pulse" />
                  <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
                  <div className="h-3 w-1/2 rounded bg-muted/60 animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center">
          <Users className="h-12 w-12 text-muted-foreground/50 mb-3" />
          <p className="text-lg font-medium text-foreground">No hay autoridades registradas</p>
          <p className="text-sm text-muted-foreground mt-1">Las autoridades activas del panel de administración aparecerán aquí.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((auth) => (
            <Card key={auth.id} className="group transition-all hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4">
                    {auth.foto ? (
                      <img
                        src={auth.foto}
                        alt={auth.nombre_completo}
                        className="h-20 w-20 rounded-full object-cover shadow-md"
                      />
                    ) : auth.tipo_autoridad === "alcalde" ? (
                      <img
                        src="/images/AlcaldeMairana.png"
                        alt={auth.nombre_completo}
                        className="h-20 w-20 rounded-full object-cover shadow-md"
                      />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 text-2xl font-bold text-white shadow-md">
                        {auth.nombre_completo.split(" ").map(n => n[0]).slice(0, 2).join("")}
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold text-card-foreground">{auth.nombre_completo}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{auth.cargo}</p>
                  <Badge variant="outline" className="mt-2 text-xs">
                    {TIPO_LABEL[auth.tipo_autoridad] || auth.tipo_autoridad}
                  </Badge>
                  <div className="mt-4 w-full space-y-2 border-t pt-4">
                    {auth.correo && (
                      <a href={`mailto:${auth.correo}`} className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                        <Mail className="h-3.5 w-3.5" />
                        {auth.correo}
                      </a>
                    )}
                    {auth.telefono && (
                      <a href={`tel:${auth.telefono}`} className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                        <Phone className="h-3.5 w-3.5" />
                        {auth.telefono}
                      </a>
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
