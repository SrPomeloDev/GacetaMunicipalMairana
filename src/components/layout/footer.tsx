import Link from "next/link"
import { MAIRANA, NAV_LINKS, SITE_NAME } from "@/lib/constants"
import { Facebook, Twitter, Youtube, MapPin, Phone, Mail, Clock, ShieldCheck, Scale, FileCheck, ExternalLink } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white text-slate-600 border-t border-border/60 relative overflow-hidden">
      {/* Top Gradient Ribbon */}
      <div className="h-1.5 w-full bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600" />
      
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 relative z-10">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* Columna 1: Identidad Municipal */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/images/escudo-mairana.jpg"
                alt="Escudo de Mairana"
                className="h-12 w-12 rounded-xl bg-white object-contain p-1 shadow-lg shadow-orange-500/20"
              />
              <div>
                <p className="text-base font-extrabold text-foreground font-serif tracking-tight">Gaceta Municipal</p>
                <p className="text-xs text-orange-600 font-medium">G.A.M. Mairana - Bolivia</p>
              </div>
              <img
                src="/images/mairana-bandera.svg"
                alt="Bandera de Mairana"
                className="h-8 w-12 rounded-md object-cover border border-orange-100"
              />
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Órgano de publicación oficial de Leyes Municipales, Ordenanzas, Decretos y Resoluciones del Gobierno Autónomo Municipal de Mairana, garantizando el acceso público y la transparencia según Ley N° 482 y Ley N° 341.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <a href="#" className="h-8 w-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-slate-500 hover:text-white hover:bg-orange-600 hover:border-orange-500 transition-all">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="h-8 w-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-slate-500 hover:text-white hover:bg-orange-600 hover:border-orange-500 transition-all">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="h-8 w-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-slate-500 hover:text-white hover:bg-orange-600 hover:border-orange-500 transition-all">
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Columna 2: Secciones de la Gaceta */}
          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-orange-600 flex items-center gap-1.5">
              <Scale className="h-3.5 w-3.5" /> Portal Institucional
            </h3>
            <ul className="space-y-2 text-xs">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
                    <span className="h-1 w-1 rounded-full bg-orange-500" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 3: Marco Legal & Transparencia */}
          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-orange-600 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" /> Transparencia Legal
            </h3>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
              <li className="p-2.5 rounded-lg bg-orange-50/70 border border-orange-100">
                <p className="font-semibold text-foreground">Ley Autonómica N° 482</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Gobiernos Autónomos Municipales de Bolivia</p>
              </li>
              <li className="p-2.5 rounded-lg bg-orange-50/70 border border-orange-100">
                <p className="font-semibold text-foreground">Ley N° 341 de Control Social</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Garantía de Participación y Transparencia</p>
              </li>
              <li>
                <Link href="/transparencia" className="text-orange-600 hover:underline flex items-center gap-1 mt-1 font-medium">
                  Ver Portal de Transparencia <ExternalLink className="h-3 w-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 4: Ubicación & Contacto Oficial */}
          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-orange-600 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> Alcaldía de Mairana
            </h3>
            <ul className="space-y-3 text-xs text-muted-foreground">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                <span>{MAIRANA.direccion}, {MAIRANA.nombre} - Santa Cruz</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-orange-500" />
                <span>Central Telefónica: {MAIRANA.telefono}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-orange-500" />
                <span>{MAIRANA.email}</span>
              </li>
              <li className="flex items-center gap-2.5 pt-1 border-t border-orange-100">
                <Clock className="h-4 w-4 shrink-0 text-orange-500" />
                <span>Atención: Lun a Vie 08:00 - 16:00</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Sub-footer Copyright & Autenticidad */}
      <div className="border-t border-orange-100 bg-orange-50/50 py-5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p className="text-center sm:text-left">
            &copy; {currentYear} {SITE_NAME}. Todos los derechos reservados.
            <span className="block sm:inline font-medium text-foreground ml-1">
              &ldquo;Capital Tabacalera de Bolivia&rdquo;
            </span>
          </p>
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-orange-100 shadow-sm">
            <FileCheck className="h-4 w-4 text-emerald-600" />
            <span className="text-[11px] text-slate-600">Publicación con Valor Legal e Integridad Digital</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
