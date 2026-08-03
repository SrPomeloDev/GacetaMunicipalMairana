import Link from "next/link"
import { MAIRANA } from "@/lib/constants"
import {
  FileText,
  Newspaper,
  Users,
  Calendar,
  ScrollText,
  Scale,
  ShieldCheck,
  ClipboardCheck,
  MessagesSquare,
  MapPin,
  ArrowRight,
  Building2,
  Thermometer,
  UsersRound,
  Search,
  Sparkles,
  Award,
  CheckCircle2,
  ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import { createAdminClient } from "@/lib/supabase/admin"
import { Button } from "@/components/ui/button"
import { Reveal } from "@/components/ui/reveal"
import { NoticiaPlaceholder } from "@/components/noticias/noticia-placeholder"

export const dynamic = "force-dynamic"

async function getStats() {
  const supabase = createAdminClient()
  const [{ count: normativas }, { count: noticias }, { count: autoridades }] = await Promise.all([
    supabase.from("normativa").select("*", { count: "exact", head: true }).eq("publicada", true),
    supabase.from("noticias").select("*", { count: "exact", head: true }).eq("publicada", true),
    supabase.from("autoridades").select("*", { count: "exact", head: true }),
  ])
  return { normativas: normativas ?? 0, noticias: noticias ?? 0, autoridades: autoridades ?? 0 }
}

async function getUltimasNoticias() {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from("noticias")
    .select("titulo, slug, resumen, categoria, fecha_publicacion, imagen_principal")
    .eq("publicada", true)
    .order("fecha_publicacion", { ascending: false })
    .limit(3)
  return data ?? []
}

async function getUltimaNormativa() {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from("normativa")
    .select("titulo, numero, resumen, slug, fecha_publicacion")
    .eq("publicada", true)
    .order("fecha_publicacion", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .single()
  return data ?? null
}

export default async function HomePage() {
  const stats = await getStats()
  const ultimasNoticias = await getUltimasNoticias()
  const ultimaNormativa = await getUltimaNormativa()

  const statItems = [
    { icon: ScrollText, label: "Normativas Promulgadas", value: `${stats.normativas}`, color: "bg-primary text-primary-foreground" },
    { icon: Newspaper, label: "Publicaciones Oficiales", value: `${stats.noticias}`, color: "bg-primary text-primary-foreground" },
    { icon: Users, label: "Autoridades Electas", value: `${stats.autoridades}`, color: "bg-primary text-primary-foreground" },
    { icon: Calendar, label: "Año de Fundación", value: "1875", color: "bg-primary text-primary-foreground" },
  ]

  const quickAccess = [
    { icon: ScrollText, title: "Normativa Legal", desc: "Consulte Leyes, Decretos Ediles y Ordenanzas", href: "/normativa", badge: "Acceso Abierto", color: "bg-primary text-primary-foreground" },
    { icon: Newspaper, title: "Noticias & Boletines", desc: "Boletines de prensa e informes oficiales", href: "/noticias", badge: "Actualizado", color: "bg-primary text-primary-foreground" },
    { icon: Users, title: "Autoridades", desc: "Conozca a la estructura del GAM Mairana", href: "/autoridades", badge: "Gestión 2026", color: "bg-primary text-primary-foreground" },
    { icon: Scale, title: "Transparencia Ley 341", desc: "Rendición de cuentas y ejecución presupuestaria", href: "/transparencia", badge: "Oficial", color: "bg-primary text-primary-foreground" },
    { icon: ClipboardCheck, title: "Trámites Municipales", desc: "Guía de requisitos y licencias de funcionamiento", href: "/tramites", badge: "Servicios", color: "bg-primary text-primary-foreground" },
    { icon: MessagesSquare, title: "Ventanilla Ciudadana", desc: "Atención de consultas y solicitudes oficiales", href: "/contacto", badge: "Atención 24/7", color: "bg-primary text-primary-foreground" },
  ]

  const newsList = ultimasNoticias.length > 0
    ? ultimasNoticias.map(n => ({
        titulo: n.titulo,
        fecha: n.fecha_publicacion ? new Date(n.fecha_publicacion).toLocaleDateString("es-BO", { day: "numeric", month: "long", year: "numeric" }) : "",
        resumen: n.resumen ?? "",
        categoria: n.categoria ?? "Institucional",
        slug: n.slug,
        imagen: n.imagen_principal ?? null,
      }))
    : [
        { titulo: "Apertura de Sesiones del Concejo Municipal de Mairana", fecha: "15 de julio, 2026", resumen: "El Honorable Concejo Municipal dio inicio a las sesiones ordinarias correspondientes a la gestión 2026 con participación social.", categoria: "Legislativo", slug: "apertura-sesiones-concejo", imagen: null },
        { titulo: "Aprobación de la Ordenanza de Desarrollo Urbano Sostenible", fecha: "10 de julio, 2026", resumen: "Se promulgó la normativa que regula la planificación territorial y la protección de áreas ecológicas en Mairana.", categoria: "Normativa", slug: "ordenanza-desarrollo-urbano", imagen: null },
        { titulo: "Mairana consolida su producción como Capital Tabacalera", fecha: "5 de julio, 2026", resumen: "El municipio reafirma su posición estratégica como la Capital Tabacalera de Bolivia con apoyo técnico productivo.", categoria: "Desarrollo", slug: "mairana-capital-tabacalera", imagen: null },
      ]

  return (
    <>
      {/* Dynamic Institutional Hero */}
      <section className="relative pt-24 pb-20 lg:pt-32 lg:pb-28 bg-gradient-to-br from-primary/[0.04] via-background to-amber-400/[0.05] dark:bg-none text-foreground overflow-hidden">
        {/* Ambient Background Gradient & Mesh */}
        <img
          src="/images/plaza.jpg"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-20"
        />
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-[radial-gradient(closest-side,rgba(234,88,12,0.10),transparent_70%)] dark:hidden" />
        <div className="absolute top-1/2 -right-24 h-96 w-96 rounded-full bg-[radial-gradient(closest-side,rgba(251,191,36,0.10),transparent_70%)] dark:hidden" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-10">
          <div className="mx-auto max-w-4xl text-center">
            
            {/* Top Institutional Badge */}
            <Reveal delay={0}>
              <div className="mb-6 inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-primary/30 bg-card/70 px-4 py-1.5 text-xs font-semibold text-primary backdrop-blur-md shadow-sm">
                <img
                  src="/images/mairana-bandera.svg"
                  alt="Bandera de Mairana"
                  className="h-4 w-6 rounded-[3px] object-cover"
                />
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span>Gobierno Autónomo Municipal de Mairana</span>
                <span className="text-primary/60">•</span>
                <span className="text-muted-foreground">Santa Cruz, Bolivia</span>
              </div>
            </Reveal>

            {/* Main Title */}
            <Reveal delay={100}>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl font-serif text-foreground leading-none">
                Gaceta Municipal <span className="bg-gradient-to-r from-primary via-amber-500 to-primary bg-clip-text text-transparent">Oficial</span>
              </h1>
            </Reveal>

            <Reveal delay={200}>
              <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-xl max-w-2xl mx-auto">
                Plataforma oficial de publicación de Leyes Municipales, Ordenanzas y Decretos Ediles con validez jurídica e integridad digital.
              </p>
            </Reveal>

            {/* Hero Live Search Bar Container */}
            <Reveal delay={300}>
              <div className="mt-10 mx-auto max-w-2xl">
              <form action="/normativa" method="GET" className="relative flex items-center">
                <div className="relative w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    name="q"
                    placeholder="Buscar por Ley, palabra clave, palabra del título..."
                    className="w-full rounded-2xl border border-white/50 bg-white/75 py-4 pl-12 pr-24 sm:pr-32 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 backdrop-blur-xl dark:border-white/10 dark:bg-white/10"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-primary px-3.5 sm:px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-md hover:from-primary/90 hover:to-primary/90 transition-all"
                  >
                    <span className="hidden min-[400px]:inline">Buscar</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </form>

              {/* Quick Filter Tag Buttons */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-muted-foreground/70">Atajos de búsqueda:</span>
                <Link href="/normativa?categoria=ley-municipal" className="rounded-full bg-white/75 dark:bg-white/10 px-3 py-1 border border-white/50 dark:border-white/10 hover:border-primary/50 hover:text-primary transition-colors shadow-sm backdrop-blur-md">
                  Leyes Municipales
                </Link>
                <Link href="/normativa?categoria=decreto-municipal" className="rounded-full bg-white/75 dark:bg-white/10 px-3 py-1 border border-white/50 dark:border-white/10 hover:border-primary/50 hover:text-primary transition-colors shadow-sm backdrop-blur-md">
                  Decretos Ediles
                </Link>
                <Link href="/normativa?categoria=ordenanza-municipal" className="rounded-full bg-white/75 dark:bg-white/10 px-3 py-1 border border-white/50 dark:border-white/10 hover:border-primary/50 hover:text-primary transition-colors shadow-sm backdrop-blur-md">
                  Ordenanzas
                </Link>
              </div>
            </div>
            </Reveal>

          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Floating Statistics Counter Section */}
      <section className="relative -mt-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-20">
        <div className="grid grid-cols-2 gap-4 rounded-3xl liquid-glass p-6 shadow-xl sm:grid-cols-4 sm:p-8">
          {statItems.map((stat, i) => {
            const Icon = stat.icon
            return (
              <Reveal key={stat.label} delay={i * 100}>
                <div className="flex flex-col items-center gap-2.5 text-center p-2 group">
                  <div className={cn("flex h-14 w-14 items-center justify-center rounded-2xl ring-4 ring-primary/10 transition-transform duration-300 group-hover:scale-110", stat.color)}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <span className="text-3xl font-extrabold tracking-tight text-foreground font-serif">{stat.value}</span>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                </div>
              </Reveal>
            )
          })}
        </div>
      </section>

      {/* Normativa Destacada Spotlight */}
      <section className="mx-auto max-w-7xl px-4 pt-16 pb-8 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/10 via-amber-500/5 to-transparent p-6 sm:p-8 relative overflow-hidden">
          <Reveal delay={80}>
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                <Award className="h-3.5 w-3.5" />
                <span>Última Promulgación Destacada</span>
              </div>
              {ultimaNormativa ? (
                <>
                  <h3 className="text-2xl font-bold font-serif text-foreground">
                    {ultimaNormativa.numero && `N° ${ultimaNormativa.numero} — `}{ultimaNormativa.titulo}
                  </h3>
                  {ultimaNormativa.resumen && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {ultimaNormativa.resumen}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {ultimaNormativa.fecha_publicacion
                      ? `Publicada el ${new Date(ultimaNormativa.fecha_publicacion).toLocaleDateString("es-BO", { day: "numeric", month: "long", year: "numeric" })}`
                      : "Publicación reciente en la Gaceta Oficial"}
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-bold font-serif text-foreground">
                    Ley Autonómica Municipal N° 142/2026 — Fomento Productivo y Desarrollo Agropecuario
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Promulgada por el Alcalde Andres Fidel Rocha Rosales, orientada al fortalecimiento de la producción agrícola y la consolidación de Mairana como Capital Tabacalera.
                  </p>
                </>
              )}
            </div>
            <div className="shrink-0">
              <Link href={ultimaNormativa ? `/normativa/${ultimaNormativa.slug}` : "/normativa"}>
                <Button className="gap-2 font-bold">
                  <FileText className="h-4 w-4" />
                  <span>{ultimaNormativa ? "Ver Normativa" : "Consultar en Gaceta"}</span>
                </Button>
              </Link>
            </div>
          </div>
          </Reveal>
        </div>
      </section>

      {/* Fast Access Portal Section */}
      <section className="bg-muted/30 py-16 border-y border-border/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mb-12 text-center">
              <span className="text-xs font-bold tracking-widest text-primary uppercase">Servicios al Ciudadano</span>
              <h2 className="text-3xl font-extrabold text-foreground font-serif mt-1">Accesos Rápidos e Información</h2>
              <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-primary" />
            </div>
          </Reveal>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {quickAccess.map((item, i) => {
              const Icon = item.icon
              return (
                <Reveal key={item.title} delay={(i % 3) * 90}>
                <Link href={item.href} className="group">
                  <div className="h-full rounded-2xl border border-border/70 bg-card p-6 shadow-sm hover:shadow-lg hover:border-primary/40 flex flex-col justify-between">
                    <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={cn("flex h-13 w-13 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110", item.color)}>
                        <Icon className="h-6 w-6" />
                      </div>
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border bg-muted text-muted-foreground">
                          {item.badge}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors font-serif">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                        {item.desc}
                      </p>
                    </div>
                    <div className="mt-6 flex items-center text-xs font-bold text-primary gap-1 group-hover:gap-2 transition-all">
                      <span>Ingresar al módulo</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </Link>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* Latest Official News */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mb-10 flex items-end justify-between">
            <div>
              <span className="text-xs font-bold tracking-widest text-primary uppercase">Publicaciones Recientes</span>
              <h2 className="text-3xl font-extrabold text-foreground font-serif mt-1">Últimas Noticias Institucionales</h2>
              <div className="mt-2 h-1 w-16 rounded-full bg-primary" />
            </div>
            <Link href="/noticias">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs font-bold hidden sm:flex">
                <span>Ver todas las noticias</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </Reveal>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {newsList.map((item, i) => (
            <Reveal key={item.titulo} delay={(i % 3) * 90}>
            <Link href={`/noticias/${item.slug}`} className="group">
              <article className="flex flex-col justify-between h-full overflow-hidden rounded-2xl border border-border/70 bg-card hover:shadow-md hover:border-primary/40">
                <div>
                  <div className="aspect-video bg-gradient-to-br from-primary/15 via-amber-500/5 to-foreground/10 relative overflow-hidden">
                    {item.imagen ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imagen}
                        alt={item.titulo}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : (
                      <NoticiaPlaceholder className="absolute inset-0 h-full w-full" />
                    )}
                    <span className="absolute top-3 left-3 rounded-full bg-background/90 backdrop-blur-md px-3 py-1 text-[10px] font-bold text-primary border">
                      {item.categoria}
                    </span>
                  </div>
                  <div className="p-6">
                    <h3 className="mb-2 text-base font-bold leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2 font-serif">
                      {item.titulo}
                    </h3>
                    <p className="mb-4 text-xs leading-relaxed text-muted-foreground line-clamp-3">
                      {item.resumen}
                    </p>
                  </div>
                </div>
                <div className="px-6 pb-6 pt-0 flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/30 pt-4">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    {item.fecha}
                  </span>
                  <span className="text-primary font-bold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                    Leer <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              </article>
            </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Mairana Identity & Heritage Section */}
      <section className="bg-gradient-to-br from-background via-primary/5 to-amber-500/10 py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-pattern-dots opacity-10 pointer-events-none" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            
            <Reveal direction="left" className="h-full">
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold tracking-widest text-primary uppercase">Identidad Autonómica</span>
                <h2 className="text-3xl font-extrabold font-serif mt-1 text-foreground">Gobierno Autónomo Municipal de Mairana</h2>
                <div className="mt-3 h-1 w-16 rounded-full bg-primary" />
              </div>
              
              <p className="text-sm text-muted-foreground leading-relaxed">
                Mairana, reconocida legalmente como la <strong className="text-foreground">Capital Tabacalera de Bolivia</strong>, fue fundada el 24 de septiembre de 1875. Es la sección capital de la Provincia Florida del Departamento de Santa Cruz, caracterizada por su fertilidad agrícola, valor histórico y calidez humana.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 rounded-xl border border-primary/15 bg-card p-4 shadow-sm">
                  <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Ubicación</p>
                    <p className="text-xs font-bold text-foreground">137 km de Santa Cruz</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-primary/15 bg-card p-4 shadow-sm">
                  <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shrink-0">
                    <UsersRound className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Población</p>
                    <p className="text-xs font-bold text-foreground">12,735 habitantes</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-primary/15 bg-card p-4 shadow-sm">
                  <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shrink-0">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Alcalde Municipal</p>
                    <p className="text-xs font-bold text-foreground">{MAIRANA.alcalde}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-primary/15 bg-card p-4 shadow-sm">
                  <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shrink-0">
                    <Thermometer className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Clima Promedio</p>
                    <p className="text-xs font-bold text-foreground">19°C (Valles Cruceños)</p>
                  </div>
                </div>
              </div>
            </div>
            </Reveal>

            {/* Emblem Card */}
            <Reveal direction="right" className="h-full">
            <div className="relative rounded-3xl border border-primary/20 bg-card p-8 flex flex-col items-center text-center">
              <div className="mb-6 flex items-end justify-center gap-4">
                <img
                  src="/images/mairana-bandera.svg"
                  alt="Bandera de Mairana"
                  className="h-16 w-auto rounded-md object-cover shadow-lg shadow-primary/20"
                />
                <img
                  src="/images/escudo-mairana.jpg"
                  alt="Escudo de Mairana"
                  className="h-28 w-auto rounded-2xl border border-primary/20 bg-white object-contain p-1.5"
                />
              </div>
              <h3 className="text-xl font-bold font-serif text-foreground">Gaceta Oficial de Mairana</h3>
              <p className="text-xs text-muted-foreground mt-2 max-w-sm">
                Comprometida con la Ley N° 341 de Control Social y la Ley Autonómica Municipal N° 482 para garantizar el libre acceso a la información pública.
              </p>

              <div className="mt-6 flex items-center gap-3 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-amber-500/10 p-3 pr-6 shadow-sm">
                <img
                  src="/images/AlcaldeMairana.png"
                  alt="Andres Fidel Rocha Rosales"
                  className="h-14 w-14 rounded-full object-cover ring-2 ring-primary/30"
                />
                <div className="text-left">
                  <p className="text-sm font-bold text-foreground font-serif">Andres Fidel Rocha Rosales</p>
                  <p className="text-[11px] text-muted-foreground">Alcalde Municipal de Mairana</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Servidor Oficial Verificado
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                  <Sparkles className="h-3.5 w-3.5" /> Firma Digital
                </span>
              </div>
            </div>
            </Reveal>

          </div>
        </div>
      </section>
    </>
  )
}

