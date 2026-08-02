import PageHeader from "@/components/layout/page-header"
import { Gavel, FileText, Building2, CalendarClock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const pilares = [
  {
    icon: Building2,
    titulo: "Licitaciones Públicas",
    descripcion: "Convocatorias de obras, bienes y servicios del municipio publicadas con transparencia y libre acceso.",
  },
  {
    icon: FileText,
    titulo: "Contratos y Adjudicaciones",
    descripcion: "Documentación de procesos de contratación: pliegos, actas de adjudicación y contratos firmados.",
  },
  {
    icon: CalendarClock,
    titulo: "Cronogramas de Convocatoria",
    descripcion: "Fechas de apertura, presentación de propuestas y adjudicación de cada proceso.",
  },
]

export default function ContratacionesPage() {
  return (
    <div className="pb-16">
      <PageHeader
        title="Contrataciones"
        description="Información pública sobre los procesos de contratación del Gobierno Autónomo Municipal de Mairana, en cumplimiento de la Ley N° 482 de Gobiernos Autónomos Municipales."
        crumbs={[{ label: "Contrataciones" }]}
        icon={<Gavel className="hidden h-8 w-8 text-primary sm:block" />}
      >
        <div className="flex items-center gap-2 rounded-xl border border-primary/15 bg-card/80 px-4 py-2 backdrop-blur">
          <span className="text-2xl font-extrabold font-serif text-foreground">SGE</span>
          <span className="text-xs text-muted-foreground">Sistema de Contrataciones Estatales</span>
        </div>
      </PageHeader>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 pt-8 md:grid-cols-3">
          {pilares.map((p) => {
            const Icon = p.icon
            return (
              <Card key={p.titulo} className="card-hover">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h2 className="font-serif text-lg font-bold text-foreground">{p.titulo}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.descripcion}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/20 bg-card/60 p-12 text-center">
          <Gavel className="mb-4 h-14 w-14 text-primary/50" />
          <h2 className="font-serif text-2xl font-bold text-foreground">Próximamente</h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            Esta sección estará disponible próximamente con las convocatorias y procesos de contratación vigentes del municipio.
            Mientras tanto, consultá la sección de Transparencia para acceder a la información pública disponible.
          </p>
          <a
            href="/transparencia"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
          >
            Ir a Transparencia
          </a>
        </div>
      </div>
    </div>
  )
}
