"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { formatearNombre } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import PageHeader from "@/components/layout/page-header"
import { Mail, Phone, Users, Landmark, Building2, ChevronRight } from "@/lib/icons"
import { createClient } from "@/lib/supabase/client"
import type { Autoridad } from "@/types"

export default function AutoridadesPage() {
  const [autoridades, setAutoridades] = useState<Autoridad[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchAutoridades = useCallback(async () => {
    const { data, error } = await supabase
      .from("autoridades")
      .select("*")
      .eq("activo", true)
      .order("orden")
    if (error) {
      setError(error.message)
    } else {
      setAutoridades(data || [])
      setError(null)
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    const run = async () => {
      await fetchAutoridades()
    }
    run()
  }, [fetchAutoridades])

  const alcalde = useMemo(() => autoridades.find((a) => a.tipo_autoridad === "alcalde"), [autoridades])
  const mostrarHeroe = !!alcalde
  const lista = alcalde ? autoridades.filter((a) => a.id !== alcalde.id) : autoridades

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
            className="group inline-flex items-center gap-1.5 rounded-xl border border-primary/20 bg-card/80 px-4 py-2 text-xs font-semibold text-foreground backdrop-blur transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            <Landmark className="h-4 w-4 text-primary group-hover:text-primary-foreground transition-colors" />
            Concejo Municipal
            <ChevronRight className="h-3 w-3" />
          </Link>
          <Link
            href="/organo-ejecutivo"
            className="group inline-flex items-center gap-1.5 rounded-xl border border-primary/20 bg-card/80 px-4 py-2 text-xs font-semibold text-foreground backdrop-blur transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            <Building2 className="h-4 w-4 text-primary group-hover:text-primary-foreground transition-colors" />
            Órgano Ejecutivo
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </PageHeader>

      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
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
      ) : error ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center">
          <Users className="h-12 w-12 text-muted-foreground/50 mb-3" />
          <p className="text-lg font-medium text-foreground">Error al cargar</p>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
        </div>
      ) : (
        <>
          {mostrarHeroe && alcalde && (
            <Card className="mb-10 overflow-hidden border-primary/20">
              <div className="h-3 bg-gradient-to-r from-primary via-primary/80 to-primary/60" />
              <CardContent className="p-8">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-5">
                    {alcalde.foto ? (
                      <Image
                        src={alcalde.foto}
                        alt={alcalde.nombre_completo}
                        width={128}
                        height={128}
                        className="h-32 w-32 rounded-full object-cover shadow-lg ring-4 ring-primary/20"
                      />
                    ) : (
                      <Image
                        src="/images/AlcaldeMairana.png"
                        alt={alcalde.nombre_completo}
                        width={128}
                        height={128}
                        className="h-32 w-32 rounded-full object-cover shadow-lg ring-4 ring-primary/20"
                      />
                    )}
                  </div>
                  <Badge className="mb-3 px-4 py-1 text-sm">Alcalde Municipal</Badge>
                  <h2 className="font-serif text-3xl font-bold text-foreground">{formatearNombre(alcalde.nombre_completo)}</h2>
                  <p className="mt-1 text-lg text-muted-foreground">{formatearNombre(alcalde.cargo)}</p>
                  <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                    {alcalde.correo && (
                      <a href={`mailto:${alcalde.correo}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                        <Mail className="h-3.5 w-3.5" />
                        {alcalde.correo}
                      </a>
                    )}
                    {alcalde.telefono && (
                      <a href={`tel:${alcalde.telefono}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                        <Phone className="h-3.5 w-3.5" />
                        {alcalde.telefono}
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {lista.length === 0 ? (
            mostrarHeroe ? (
              <p className="text-center text-sm text-muted-foreground">El resto del equipo municipal se publicará próximamente.</p>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-lg font-medium text-foreground">No hay autoridades registradas</p>
                <p className="text-sm text-muted-foreground mt-1">Las autoridades activas del panel de administración aparecerán aquí.</p>
              </div>
            )
          ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {lista.map((auth) => (
             <Card key={auth.id} className="group transition-all duration-300 hover:-translate-y-1 hover:shadow-lifted">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4">
                    {auth.foto ? (
                      <Image
                        src={auth.foto}
                        alt={auth.nombre_completo}
                        width={80}
                        height={80}
                        className="h-20 w-20 rounded-full object-cover shadow-md"
                      />
                    ) : auth.tipo_autoridad === "alcalde" ? (
                      <Image
                        src="/images/AlcaldeMairana.png"
                        alt={auth.nombre_completo}
                        width={80}
                        height={80}
                        className="h-20 w-20 rounded-full object-cover shadow-md"
                      />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 text-2xl font-bold text-white shadow-md">
                        {auth.nombre_completo.split(" ").map(n => n[0]).slice(0, 2).join("")}
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold text-card-foreground">{formatearNombre(auth.nombre_completo)}</h3>
                  <Badge className="mt-2 text-center text-xs leading-snug">
                    {formatearNombre(auth.cargo)}
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
        </>
      )}
      </div>
    </div>
  )
}
