"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import PageHeader from "@/components/layout/page-header"
import { Phone, Mail, Building2, Target, FileText, ChevronRight, Briefcase, Heart, GraduationCap, Wrench, TreePine, Landmark } from "lucide-react"

const alcalde = {
  nombre: "Andres Fidel Rocha Rosales",
  cargo: "Alcalde Municipal",
  email: "alcaldia@mairana.gob.bo",
  telefono: "948-2041",
  biografia: "Profesional en administración pública con más de 15 años de experiencia en gestión municipal. Comprometido con el desarrollo integral de Mairana y sus comunidades.",
}

const secretarias = [
  { nombre: "Secretaría General", titular: "Ruth García", icon: Building2, descripcion: "Coordinación administrativa y asesoría legal" },
  { nombre: "Secretaría de Desarrollo", titular: "Jorge Áñez", icon: Briefcase, descripcion: "Desarrollo económico, productivo y turístico" },
  { nombre: "Secretaría de Obras Públicas", titular: "Mario Roca", icon: Wrench, descripcion: "Infraestructura y servicios básicos" },
  { nombre: "Secretaría de Salud", titular: "Dra. Carmen Suárez", icon: Heart, descripcion: "Salud pública y saneamiento ambiental" },
  { nombre: "Secretaría de Educación", titular: "Liliana Castro", icon: GraduationCap, descripcion: "Educación, cultura y deportes" },
  { nombre: "Secretaría de Medio Ambiente", titular: "Eduardo Ríos", icon: TreePine, descripcion: "Gestión ambiental y recursos naturales" },
]

export default function OrganoEjecutivoPage() {
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
        <Card className="mb-10 overflow-hidden border-primary/20 transition-all hover:shadow-lg">
        <div className="h-3 bg-gradient-to-r from-primary via-primary/80 to-primary/60" />
        <CardContent className="p-8">
          <div className="flex flex-col items-center text-center lg:flex-row lg:text-left lg:items-start lg:gap-8">
            <div className="mb-6 lg:mb-0">
              <img
                src="/images/AlcaldeMairana.png"
                alt={alcalde.nombre}
                className="h-32 w-32 rounded-full object-cover shadow-lg ring-4 ring-primary/20"
              />
            </div>
            <div className="flex-1">
              <Badge className="mb-3 text-sm px-4 py-1">Alcalde Municipal</Badge>
              <h2 className="text-3xl font-bold text-foreground font-serif">{alcalde.nombre}</h2>
              <p className="mt-1 text-lg text-muted-foreground">{alcalde.cargo}</p>
              <p className="mt-4 max-w-2xl text-muted-foreground leading-relaxed">{alcalde.biografia}</p>
              <div className="mt-6 flex flex-wrap gap-6">
                <a href={`mailto:${alcalde.email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <Mail className="h-4 w-4" />
                  {alcalde.email}
                </a>
                <a href={`tel:${alcalde.telefono}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <Phone className="h-4 w-4" />
                  {alcalde.telefono}
                </a>
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {secretarias.map((sec) => {
            const Icon = sec.icon
            return (
              <Card key={sec.nombre} className="group transition-all hover:shadow-md">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">{sec.nombre}</h3>
                      <p className="text-sm text-muted-foreground">{sec.titular}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{sec.descripcion}</p>
                    </div>
                    <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

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
              <p className="mt-1 text-sm text-muted-foreground">Los informes de rendición de cuentas estarán disponibles próximamente</p>
              <div className="mt-6 w-full max-w-sm space-y-2">
                {["Gestión 2025", "Gestión 2024", "Gestión 2023"].map((gestion) => (
                  <div key={gestion} className="flex items-center justify-between rounded-lg border bg-card p-3">
                    <span className="text-sm font-medium text-foreground">{gestion}</span>
                    <Badge variant="outline" className="text-xs">Próximamente</Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  )
}
