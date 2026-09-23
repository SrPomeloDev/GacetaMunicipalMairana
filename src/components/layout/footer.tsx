import Link from "next/link"
import Image from "next/image"
import { MAIRANA, NAV_LINKS, SITE_NAME, DEV_CREDIT, telHref, whatsappUrl } from "@/lib/constants"
import { MapPin, Phone, Mail, Clock, ShieldCheck, Scale, FileCheck2, ExternalLink, Landmark, Building2, Code2, WhatsApp, Facebook, Instagram, Youtube, Twitter } from "@/lib/icons"
import NewsletterForm from "./newsletter-form"
import type { Configuracion } from "@/types"

const FOOTER_LINKS = [
  { href: "/gaceta", label: "Gaceta Oficial" },
  { href: "/asistente", label: "Consulta de normativa" },
  ...NAV_LINKS,
]

export default async function Footer({ config }: { config: Pick<Configuracion, "direccion" | "telefono" | "whatsapp" | "email" | "horario" | "lema" | "municipio" | "facebook" | "twitter" | "youtube" | "instagram"> | null }) {
  const currentYear = new Date().getFullYear()

  const direccion = config?.direccion || MAIRANA.direccion
  const telefono = config?.telefono || MAIRANA.telefono
  const email = config?.email || MAIRANA.email
  const horario = config?.horario || "Lun a Vie 08:00 - 16:00"
  const lema = config?.lema || MAIRANA.capital
  const municipio = config?.municipio || "Gobierno Autónomo Municipal de Mairana"
  const telLink = telHref(config?.telefono) || `tel:${telefono}`
  const waLink = whatsappUrl(config?.whatsapp)

  return (
    <footer className="relative overflow-hidden border-t border-border bg-card text-muted-foreground">
      <div className="h-1 w-full bg-gradient-to-r from-primary via-amber-500 to-primary" />

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Image
                src="/images/escudo-mairana.jpg"
                alt="Escudo de Mairana"
                width={48}
                height={48}
                className="h-12 w-12 rounded-xl bg-white object-contain p-1 shadow-sm ring-1 ring-border"
              />
              <div className="min-w-0">
                <p className="font-serif text-base font-extrabold tracking-tight text-foreground">Gaceta Municipal</p>
                <p className="text-xs font-medium text-primary">G.A.M. Mairana - Bolivia</p>
              </div>
              <Image
                src="/images/mairana-bandera.svg"
                alt="Bandera de Mairana"
                width={48}
                height={32}
                unoptimized
                className="h-8 w-12 rounded-md border border-primary/15 object-cover"
              />
            </div>
            <p className="text-xs leading-relaxed">
              Órgano de publicación oficial de Leyes Municipales, Ordenanzas, Decretos y Resoluciones del {municipio}, garantizando el acceso público y la transparencia según Ley N° 482 y Ley N° 341.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a href={`mailto:${email}`} className="inline-flex items-center gap-1.5 rounded-lg border border-primary bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-all hover:opacity-90">
                <Mail className="h-3.5 w-3.5" />
                Escríbenos
              </a>
              <a href={telLink} className="inline-flex items-center gap-1.5 rounded-lg border border-primary bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-all hover:opacity-90">
                <Phone className="h-3.5 w-3.5" />
                Llámanos
              </a>
            </div>
          </div>

          <div>
            <h3 className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
              <Scale className="h-3.5 w-3.5" /> Web Institucional
            </h3>
            <ul className="space-y-0.5 text-xs">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="group flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/60 hover:text-primary">
                    <span className="h-1 w-1 rounded-full bg-primary/60 transition-colors group-hover:bg-primary" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
              <ShieldCheck className="h-3.5 w-3.5" /> Transparencia Legal
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li className="rounded-xl border border-primary/15 bg-primary/5 p-3">
                <p className="font-semibold text-foreground">Ley Autonómica N° 482</p>
                <p className="mt-0.5 text-[11px]">Gobiernos Autónomos Municipales de Bolivia</p>
              </li>
              <li className="rounded-xl border border-primary/15 bg-primary/5 p-3">
                <div className="flex items-center gap-2.5">
                  <Image
                    src="/images/transparencia-ley341.png"
                    alt="Logo Transparencia Ley 341"
                    width={36}
                    height={36}
                    className="h-9 w-9 shrink-0 rounded-lg border border-border/60 bg-white object-contain p-0.5 shadow-sm"
                  />
                  <p className="font-semibold text-foreground">Ley N° 341 de Control Social</p>
                </div>
                <p className="mt-0.5 text-[11px]">Garantía de Participación y Transparencia</p>
              </li>
              <li>
                <Link href="/transparencia" className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary underline-offset-4 hover:underline">
                  Ver Web de Transparencia <ExternalLink className="h-3 w-3" />
                </Link>
              </li>
            </ul>
            <div className="mt-4 space-y-2 text-xs">
              <Link href="/concejo-municipal" className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2 transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary">
                <Landmark className="h-3.5 w-3.5 text-primary" />
                Concejo Municipal
              </Link>
              <Link href="/organo-ejecutivo" className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2 transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary">
                <Building2 className="h-3.5 w-3.5 text-primary" />
                Órgano Ejecutivo
              </Link>
            </div>
          </div>

          <div>
            <NewsletterForm />
            <h3 className="mb-5 mt-7 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
              <MapPin className="h-3.5 w-3.5" /> Alcaldía de Mairana
            </h3>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{direccion}, {MAIRANA.nombre} - Santa Cruz</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                <a href={telLink} className="transition-colors hover:text-primary hover:underline">Central Telefónica: {telefono}</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                <span>{email}</span>
              </li>
              <li className="flex items-center gap-2.5 border-t border-primary/15 pt-3">
                <Clock className="h-4 w-4 shrink-0 text-primary" />
                <span>Atención: {horario}</span>
              </li>
            </ul>
            {(config?.facebook || config?.instagram || config?.youtube || config?.twitter || waLink) && (
              <div className="mt-4 flex items-center gap-2">
                {config?.facebook && (
                  <a href={config.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary">
                    <Facebook className="h-4 w-4" />
                  </a>
                )}
                {config?.instagram && (
                  <a href={config.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary">
                    <Instagram className="h-4 w-4" />
                  </a>
                )}
                {config?.youtube && (
                  <a href={config.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary">
                    <Youtube className="h-4 w-4" />
                  </a>
                )}
                {config?.twitter && (
                  <a href={config.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter / X" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary">
                    <Twitter className="h-4 w-4" />
                  </a>
                )}
                {waLink && (
                  <a href={waLink} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" title="WhatsApp" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:border-[#25D366] hover:bg-primary/10 hover:text-[#25D366]">
                    <WhatsApp className="h-4 w-4" />
                  </a>
                )}
              </div>
            )}
          </div>

        </div>
      </div>

      <div className="border-t border-primary/15 bg-primary/5 py-5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 text-xs sm:flex-row sm:px-6 lg:px-8">
          <p className="text-center sm:text-left">
            &copy; {currentYear} {SITE_NAME}. Todos los derechos reservados.
            <span className="ml-1 block font-medium text-foreground sm:inline">
              &ldquo;{lema}&rdquo;
            </span>
            <span className="mx-1 opacity-50">•</span>
            <Link href="/ayuda" className="underline-offset-4 hover:text-primary hover:underline">
              Ayuda
            </Link>
          </p>
          <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-card px-3 py-1.5 shadow-sm">
            <FileCheck2 className="h-4 w-4 text-emerald-600" />
            <span className="text-[11px]">Publicación con Valor Legal e Integridad Digital</span>
          </div>
        </div>
      </div>

      {DEV_CREDIT.visible && (
        <div className="border-t border-primary/10 bg-background/60 py-2.5">
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-1.5 px-4 text-[11px] sm:px-6 lg:px-8">
            <Code2 className="h-3 w-3 text-primary" />
            <span>
              Plataforma desarrollada por <span className="font-semibold text-foreground">{DEV_CREDIT.nombre}</span>
              <span className="mx-1 opacity-50">•</span>
              <span>{DEV_CREDIT.rol}</span>
            </span>
          </div>
        </div>
      )}
    </footer>
  )
}