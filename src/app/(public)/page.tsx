import Link from "next/link"
import { MAIRANA } from "@/lib/constants"
import {
  ScrollText,
  ShieldCheck,
  ClipboardCheck,
  MessagesSquare,
  MapPin,
  ArrowRight,
  Building2,
  Thermometer,
  UsersRound,
  ChevronRight,
  BookOpen,
  Phone,
  Mail,
  Star,
  Calendar,
  Landmark,
  ImageIcon,
  Gavel,
} from "lucide-react"
import { createAdminClient } from "@/lib/supabase/admin"
import { Button } from "@/components/ui/button"
import { Reveal } from "@/components/ui/reveal"
import { NoticiaPlaceholder } from "@/components/noticias/noticia-placeholder"

export const dynamic = "force-dynamic"

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

export default async function HomePage() {
  const ultimasNoticias = await getUltimasNoticias()

  const newsList = ultimasNoticias.length > 0
    ? ultimasNoticias.map(n => ({
        titulo: n.titulo,
        fecha: n.fecha_publicacion
          ? new Date(n.fecha_publicacion).toLocaleDateString("es-BO", { day: "numeric", month: "long", year: "numeric" })
          : "",
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

  const services = [
    { icon: ClipboardCheck, title: "Trámites Municipales", desc: "Guía de requisitos, licencias de funcionamiento y formularios oficiales.", href: "/tramites", badge: "Servicios" },
    { icon: ShieldCheck, title: "Transparencia Ley 341", desc: "Rendición de cuentas, ejecución presupuestaria y control social.", href: "/transparencia", badge: "Oficial" },
    { icon: Landmark, title: "Concejo Municipal", desc: "Sesiones, actas y resoluciones del Honorable Concejo Municipal.", href: "/concejo-municipal", badge: "Legislativo" },
    { icon: ImageIcon, title: "Galería Municipal", desc: "Eventos, obras e iniciativas de la gestión municipal 2026.", href: "/galeria", badge: "Multimedia" },
    { icon: Gavel, title: "Contrataciones", desc: "Licitaciones, convocatorias y resultados de procesos de contratación.", href: "/contrataciones", badge: "SICOES" },
    { icon: MessagesSquare, title: "Ventanilla Ciudadana", desc: "Atención de consultas, solicitudes y denuncias ciudadanas.", href: "/contacto", badge: "24/7" },
  ]

  const datosIdentidad = [
    { icon: MapPin, label: "Ubicación", value: "137 km de Santa Cruz" },
    { icon: UsersRound, label: "Población", value: "12,735 habitantes" },
    { icon: Building2, label: "Alcalde Municipal", value: MAIRANA.alcalde },
    { icon: Thermometer, label: "Clima Promedio", value: "19°C — Valles Cruceños" },
    { icon: Calendar, label: "Fundación", value: "24 de septiembre de 1875" },
    { icon: Star, label: "Distinción", value: "Capital Tabacalera de Bolivia" },
  ]

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-28 lg:pt-36">
        <img
          src="/images/plaza.jpg"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/40 to-background" aria-hidden />
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-[radial-gradient(closest-side,rgba(234,88,12,0.12),transparent_70%)] dark:hidden" aria-hidden />
        <div className="absolute top-1/2 -right-24 h-96 w-96 rounded-full bg-[radial-gradient(closest-side,rgba(251,191,36,0.12),transparent_70%)] dark:hidden" aria-hidden />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-7">
              <Reveal>
                <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-primary/25 bg-card/80 px-4 py-2 text-xs font-semibold text-primary shadow-sm backdrop-blur-md">
                  <img src="/images/mairana-bandera.svg" alt="Bandera de Mairana" className="h-4 w-6 rounded-[3px] object-cover" />
                  <ShieldCheck className="h-4 w-4" />
                  <span>Gobierno Autónomo Municipal de Mairana</span>
                  <span className="text-primary/40">•</span>
                  <span className="text-muted-foreground">Santa Cruz, Bolivia</span>
                </div>
              </Reveal>

              <Reveal>
                <h1 className="font-serif text-4xl font-extrabold leading-none tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                  Portal{" "}
                  <span className="bg-gradient-to-r from-primary via-amber-500 to-primary bg-clip-text text-transparent">
                    Municipal
                  </span>
                  <br />
                  de Mairana
                </h1>
              </Reveal>

              <Reveal>
                <p className="max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
                  Bienvenido al portal oficial del{" "}
                  <strong className="text-foreground">G.A.M. Mairana</strong>, tu acceso
                  centralizado a servicios municipales, información institucional y
                  participación ciudadana.
                </p>
              </Reveal>

              <Reveal>
                <div className="flex flex-wrap gap-3">
                  <Link href="/gaceta">
                    <Button className="gap-2 shadow-md shadow-primary/30 font-bold">
                      <ScrollText className="h-4 w-4" />
                      Consultar Gaceta Oficial
                    </Button>
                  </Link>
                  <Link href="/tramites">
                    <Button variant="outline" className="gap-2 border-primary/30 font-semibold hover:bg-primary/10">
                      <ClipboardCheck className="h-4 w-4" />
                      Trámites en Línea
                    </Button>
                  </Link>
                </div>
              </Reveal>
            </div>

            <Reveal direction="right" className="h-full">
              <div className="relative flex flex-col items-center rounded-3xl border border-primary/20 bg-card p-8 text-center shadow-lifted">
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
                <h3 className="font-serif text-xl font-bold text-foreground">Alcaldía Municipal de Mairana</h3>
                <p className="mt-2 max-w-sm text-xs text-muted-foreground">
                  Comprometidos con el desarrollo sostenible, la transparencia y el bienestar de los 12,735 mairaneños.
                </p>
                <div className="mt-5 flex w-full items-center gap-3 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-amber-500/10 p-3 pr-5">
                  <img
                    src="/images/AlcaldeMairana.png"
                    alt="Andres Fidel Rocha Rosales"
                    className="h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-primary/30"
                  />
                  <div className="text-left">
                    <p className="font-serif text-sm font-bold text-foreground">Andres Fidel Rocha Rosales</p>
                    <p className="text-[11px] text-muted-foreground">Alcalde Municipal — Gestión 2026</p>
                    <p className="mt-1 text-[11px] font-semibold text-primary">Capital Tabacalera de Bolivia</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap justify-center gap-2 text-[11px]">
                  <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 font-semibold text-primary">
                    <Phone className="h-3 w-3" /> {MAIRANA.telefono}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 font-semibold text-primary">
                    <Mail className="h-3 w-3" /> {MAIRANA.email}
                  </span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* SERVICIOS MUNICIPALES */}
      <section className="border-y border-border/40 bg-muted/30 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mb-12 text-center">
              <span className="heading-kicker">Servicios al Ciudadano</span>
              <h2 className="mt-2 font-serif text-3xl font-extrabold text-foreground">Accesos Rápidos e Información</h2>
              <div className="section-heading-line mx-auto" />
            </div>
          </Reveal>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((item, i) => (
              <Reveal key={item.title} delay={(i % 3) * 90}>
                <Link href={item.href} className="group block h-full">
                  <div className="flex h-full flex-col justify-between rounded-2xl border border-border/70 bg-card p-6 shadow-card transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary/40 group-hover:shadow-lifted">
                    <div>
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm transition-transform duration-300 group-hover:scale-110">
                          <item.icon className="h-6 w-6" />
                        </div>
                        <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-[10px] font-bold text-muted-foreground">
                          {item.badge}
                        </span>
                      </div>
                      <h3 className="font-serif text-lg font-bold text-foreground transition-colors group-hover:text-primary">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{item.desc}</p>
                    </div>
                    <div className="mt-6 flex items-center gap-1 text-xs font-bold text-primary transition-all group-hover:gap-2">
                      <span>Ingresar</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ÚLTIMAS NOTICIAS */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mb-10 flex items-end justify-between">
            <div>
              <span className="heading-kicker">Publicaciones Recientes</span>
              <h2 className="mt-2 font-serif text-3xl font-extrabold text-foreground">Últimas Noticias Municipales</h2>
              <div className="section-heading-line" />
            </div>
            <Link href="/noticias">
              <Button variant="outline" size="sm" className="hidden gap-1.5 border-primary/30 text-xs font-bold sm:flex">
                <span>Ver todas</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </Reveal>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {newsList.map((item, i) => (
            <Reveal key={item.titulo} delay={(i % 3) * 90}>
              <Link href={`/noticias/${item.slug}`} className="group block h-full">
                <article className="flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-border/70 bg-card shadow-card transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary/40 group-hover:shadow-lifted">
                  <div>
                    <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-primary/15 via-amber-500/5 to-foreground/10">
                      {item.imagen ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.imagen}
                          alt={item.titulo}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <NoticiaPlaceholder className="absolute inset-0 h-full w-full transition-transform duration-500 group-hover:scale-105" />
                      )}
                      <span className="absolute left-3 top-3 rounded-full border bg-background/90 px-3 py-1 text-[10px] font-bold text-primary backdrop-blur-md">
                        {item.categoria}
                      </span>
                    </div>
                    <div className="p-6">
                      <h3 className="mb-2 line-clamp-2 font-serif text-base font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
                        {item.titulo}
                      </h3>
                      <p className="mb-4 line-clamp-3 text-xs leading-relaxed text-muted-foreground">{item.resumen}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-border/30 px-6 pb-6 pt-4 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      {item.fecha}
                    </span>
                    <span className="flex items-center gap-0.5 font-bold text-primary transition-transform group-hover:translate-x-1">
                      Leer <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                </article>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* IDENTIDAD MUNICIPAL */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-primary/5 to-amber-500/10 py-16">
        <div className="pointer-events-none absolute inset-0 bg-pattern-dots opacity-10" aria-hidden />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mb-10 text-center">
              <span className="heading-kicker">Identidad Autonómica</span>
              <h2 className="mt-2 font-serif text-3xl font-extrabold text-foreground">Conoce Mairana</h2>
              <div className="section-heading-line mx-auto" />
              <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Mairana, reconocida como la{" "}
                <strong className="text-foreground">Capital Tabacalera de Bolivia</strong>, fue
                fundada el 24 de septiembre de 1875. Capital de la Provincia Florida,
                Departamento de Santa Cruz.
              </p>
            </div>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {datosIdentidad.map((dato, i) => (
              <Reveal key={dato.label} delay={(i % 3) * 80}>
                <div className="flex items-center gap-3 rounded-xl border border-primary/15 bg-card p-4 shadow-card">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm shadow-primary/25">
                    <dato.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">{dato.label}</p>
                    <p className="text-xs font-bold text-foreground">{dato.value}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div className="mt-10 text-center">
              <Link href="/autoridades">
                <Button variant="outline" className="gap-2 border-primary/30 font-semibold hover:bg-primary/10">
                  <BookOpen className="h-4 w-4" />
                  Conocer las Autoridades Municipales
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
