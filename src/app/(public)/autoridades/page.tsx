"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import PageHeader from "@/components/layout/page-header"
import { Mail, Phone, Users, Landmark, Building2, ChevronRight } from "lucide-react"
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
    <div className="pb-16">
      <PageHeader
        title="Autoridades Municipales"
        description="Conocé a las autoridades del Gobierno Autónomo Municipal de Mairana: Alcaldía, Concejo Municipal y Órgano Ejecutivo."
        crumbs={[{ label: "Autoridades" }]}
        icon={<Users className="hidden h-8 w-8 text-primary sm:block" />}
      >
        <div className="flex items-center gap-2 rounded-xl border border-primary/15 bg-card/80 px-4 py-2 backdrop-blur">
          <Users className="h-4 w-4 text-primary" />
          <span className="text-2xl font-extrabold font-serif text-foreground">{autoridades.length}</span>
          <span className="text-xs text-muted-foreground">autoridades activas</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/concejo-municipal"
            className="inline-flex items-center gap-1.5 rounded-xl border border-primary/20 bg-card/80 px-4 py-2 text-xs font-semibold text-foreground backdrop-blur transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            <Landmark className="h-4 w-4 text-primary" />
            Concejo Municipal
            <ChevronRight className="h-3 w-3" />
          </Link>
          <Link
            href="/organo-ejecutivo"
            className="inline-flex items-center gap-1.5 rounded-xl border border-primary/20 bg-card/80 px-4 py-2 text-xs font-semibold text-foreground backdrop-blur transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            <Building2 className="h-4 w-4 text-primary" />
            Órgano Ejecutivo
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </PageHeader>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap gap-2 pt-8">
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
    </div>
  )
}
