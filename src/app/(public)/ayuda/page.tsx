import Link from "next/link"
import PageHeader from "@/components/layout/page-header"
import { Card, CardContent } from "@/components/ui/card"
import {
  Home, ScrollText, Newspaper, Users, ShieldCheck, ClipboardList,
  Images, Gavel, Landmark, Building2, Mail, Bot, Headset, ArrowRight,
} from "@/lib/icons"
import { UserCog } from "lucide-react"

const GUIA = [
  { href: "/", titulo: "Inicio", desc: "Portada del portal: accesos directos a la Gaceta, trámites y novedades.", Icon: Home },
  { href: "/gaceta", titulo: "Gaceta Oficial", desc: "Leyes, ordenanzas, decretos y resoluciones. Buscá por número, título o estado.", Icon: ScrollText },
  { href: "/noticias", titulo: "Noticias", desc: "Novedades del municipio, incluyendo publicaciones de Facebook.", Icon: Newspaper },
  { href: "/autoridades", titulo: "Autoridades", desc: "Quiénes gobiernan: alcalde destacado y demás autoridades.", Icon: Users },
  { href: "/transparencia", titulo: "Transparencia", desc: "Presupuesto, POA, auditorías y documentos públicos.", Icon: ShieldCheck },
  { href: "/tramites", titulo: "Trámites", desc: "Requisitos, costos y pasos de cada trámite municipal.", Icon: ClipboardList },
  { href: "/galeria", titulo: "Galería", desc: "Fotos de eventos, obras y cultura de Mairana.", Icon: Images },
  { href: "/contrataciones", titulo: "Contrataciones", desc: "Licitaciones y convocatorias públicas vigentes.", Icon: Gavel },
  { href: "/concejo-municipal", titulo: "Concejo Municipal", desc: "Sesiones, comisiones y concejales.", Icon: Landmark },
  { href: "/organo-ejecutivo", titulo: "Órgano Ejecutivo", desc: "Alcalde, secretarías y direcciones.", Icon: Building2 },
  { href: "/contacto", titulo: "Contacto", desc: "Escribinos o dejá una denuncia (puede ser anónima).", Icon: Mail },
  { href: "/asistente", titulo: "Asistente virtual", desc: "Preguntale por normativa, trámites y transparencia.", Icon: Bot },
]

const FAQS = [
  {
    q: "¿Cómo busco una ley u ordenanza?",
    a: "Entrá a la Gaceta Oficial y usá el buscador por número o título. Podés filtrar por categoría (ley, ordenanza, decreto…) y por estado (vigente, derogada…).",
  },
  {
    q: "¿Por qué no se ve una publicación de Facebook?",
    a: "Solo se muestran posts públicos con su URL directa (/posts/...). Los links para compartir (/share/...) no se pueden incrustar.",
  },
  {
    q: "Escribí por Contacto, ¿me van a responder?",
    a: "Si dejaste tu email, el mensaje llega al panel municipal y te responden. Las denuncias pueden ser anónimas: en ese caso no hay cómo notificarte.",
  },
  {
    q: "Soy funcionario y perdí mi contraseña, ¿qué hago?",
    a: "Pedile a un administrador que te fije una clave temporal en Usuarios → Editar. Después cambiala vos en Mi Perfil.",
  },
]

export default function AyudaPage() {
  return (
    <div className="pb-16">
      <PageHeader
        title="Ayuda y Acerca de"
        description="Guía rápida del Portal y la Gaceta Municipal de Mairana: qué hay en cada sección y cómo usarla."
        crumbs={[{ label: "Ayuda" }]}
        icon={<Headset className="hidden h-8 w-8 text-primary sm:block" />}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 pt-8 sm:grid-cols-2 lg:grid-cols-3">
          {GUIA.map(({ href, titulo, desc, Icon }) => (
            <Link key={href} href={href} className="group block h-full">
              <Card className="h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lifted">
                <CardContent className="flex items-start gap-3 p-5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="flex items-center gap-1 font-semibold text-card-foreground transition-colors group-hover:text-primary">
                      {titulo}
                      <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                    </span>
                    <span className="mt-0.5 block text-sm leading-relaxed text-muted-foreground">{desc}</span>
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <Card className="mt-8 border-primary/20">
          <CardContent className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <UserCog className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-card-foreground">¿Sos funcionario?</p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Entrá por Acceso Funcionarios. Los editores cargan datos, los publicadores publican y solo los
                administradores crean cuentas. Tu clave la cambiás en Mi Perfil.
              </p>
            </div>
            <Link
              href="/admin/login"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
            >
              Acceso Funcionarios
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardContent>
        </Card>

        <h2 className="mt-10 mb-4 font-serif text-2xl font-bold text-foreground">Preguntas frecuentes</h2>
        <div className="space-y-3">
          {FAQS.map((f) => (
            <details
              key={f.q}
              className="group rounded-xl border border-border/60 bg-card px-5 py-4 shadow-sm"
            >
              <summary className="cursor-pointer text-sm font-semibold text-card-foreground marker:text-primary">
                {f.q}
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  )
}
