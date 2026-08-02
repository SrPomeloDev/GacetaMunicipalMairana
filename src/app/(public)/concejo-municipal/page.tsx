"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import PageHeader from "@/components/layout/page-header"
import { Phone, Mail, Calendar, FileText, Users, Scale, Shield, Landmark } from "lucide-react"

const presidente = {
  nombre: "María Elena Vargas",
  cargo: "Presidenta del Concejo Municipal",
  email: "concejo@mairana.gob.bo",
  telefono: "948-2042",
}

const vicepresidente = {
  nombre: "Carlos Mendoza",
  cargo: "Vicepresidente del Concejo Municipal",
  email: "cmendoza@mairana.gob.bo",
  telefono: "948-2043",
}

const concejales = [
  { nombre: "Ana Belén Rojas", cargo: "Concejal Secretaria", email: "arojas@mairana.gob.bo", telefono: "948-2044" },
  { nombre: "Pedro Pablo Suárez", cargo: "Concejal", email: "psuarez@mairana.gob.bo", telefono: "948-2045" },
  { nombre: "Rosa López", cargo: "Concejal", email: "rlopez@mairana.gob.bo", telefono: "948-2049" },
  { nombre: "Hugo Torrico", cargo: "Concejal", email: "htorrico@mairana.gob.bo", telefono: "948-2050" },
]

const comisiones = [
  { nombre: "Comisión de Desarrollo Económico", presidente: "María Elena Vargas", miembros: 4 },
  { nombre: "Comisión de Infraestructura", presidente: "Carlos Mendoza", miembros: 3 },
  { nombre: "Comisión de Educación y Cultura", presidente: "Ana Belén Rojas", miembros: 3 },
  { nombre: "Comisión de Medio Ambiente", presidente: "Pedro Pablo Suárez", miembros: 3 },
  { nombre: "Comisión de Seguridad Ciudadana", presidente: "Rosa López", miembros: 3 },
]

const sesiones = [
  { numero: "Sesión Ordinaria N° 015/2026", fecha: "15 de julio de 2026", tipo: "Ordinaria", tema: "Aprobación de ordenanza de desarrollo urbano" },
  { numero: "Sesión Ordinaria N° 014/2026", fecha: "8 de julio de 2026", tipo: "Ordinaria", tema: "Fiscalización de obras públicas" },
  { numero: "Sesión Extraordinaria N° 005/2026", fecha: "1 de julio de 2026", tipo: "Extraordinaria", tema: "Tratamiento de emergencia municipal" },
  { numero: "Sesión Ordinaria N° 013/2026", fecha: "24 de junio de 2026", tipo: "Ordinaria", tema: "Análisis del POA reformulado" },
]

export default function ConcejoPage() {
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
        <div className="mb-10 grid gap-6 sm:grid-cols-2">
        {[presidente, vicepresidente].map((persona) => (
          <Card key={persona.nombre} className="overflow-hidden border-primary/20 transition-all hover:shadow-md">
            <div className="h-2 bg-gradient-to-r from-primary to-primary/60" />
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:items-start sm:gap-5">
                <div className="mb-4 sm:mb-0 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 text-3xl font-bold text-white shadow-md">
                  {persona.nombre.split(" ").map(n => n[0]).slice(0, 2).join("")}
                </div>
                <div className="flex-1">
                  <Badge className="mb-2">{persona.cargo.includes("Presidenta") || persona.cargo.includes("Presidente") ? "Presidencia" : "Vicepresidencia"}</Badge>
                  <h3 className="text-xl font-bold text-foreground">{persona.nombre}</h3>
                  <p className="text-muted-foreground">{persona.cargo}</p>
                  <div className="mt-4 space-y-1.5">
                    <a href={`mailto:${persona.email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                      <Mail className="h-3.5 w-3.5" />
                      {persona.email}
                    </a>
                    <a href={`tel:${persona.telefono}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                      <Phone className="h-3.5 w-3.5" />
                      {persona.telefono}
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mb-10">
        <h2 className="mb-6 text-2xl font-bold text-foreground font-serif flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          Concejales
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {concejales.map((concejal) => (
            <Card key={concejal.nombre} className="transition-all hover:shadow-md">
              <CardContent className="p-5 text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/80 to-primary/40 text-xl font-bold text-white">
                  {concejal.nombre.split(" ").map(n => n[0]).slice(0, 2).join("")}
                </div>
                <h3 className="font-semibold text-card-foreground">{concejal.nombre}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{concejal.cargo}</p>
                <div className="mt-3 space-y-1">
                  <a href={`mailto:${concejal.email}`} className="flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                    <Mail className="h-3 w-3" />
                    {concejal.email}
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="mb-10 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-serif">
              <Scale className="h-5 w-5 text-primary" />
              Comisiones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {comisiones.map((com) => (
                <div key={com.nombre} className="flex items-start gap-3 rounded-lg border bg-card p-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Shield className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-card-foreground">{com.nombre}</p>
                    <p className="text-sm text-muted-foreground">Presidente: {com.presidente}</p>
                    <p className="text-xs text-muted-foreground">{com.miembros} miembros</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-serif">
              <Calendar className="h-5 w-5 text-primary" />
              Sesiones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sesiones.map((ses) => (
                <div key={ses.numero} className="flex items-start gap-3 rounded-lg border bg-card p-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-card-foreground">{ses.numero}</p>
                    <p className="text-sm text-muted-foreground">{ses.fecha}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant={ses.tipo === "Extraordinaria" ? "warning" : "secondary"} className="text-[10px]">{ses.tipo}</Badge>
                      <span className="text-xs text-muted-foreground truncate">{ses.tema}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  )
}
