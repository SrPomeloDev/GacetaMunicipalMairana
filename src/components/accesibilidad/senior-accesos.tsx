import Link from "next/link"
import { ScrollText, ClipboardList, MessageSquare, Headset, TextAa } from "@/lib/icons"

const ACCESOS = [
  { href: "/gaceta", titulo: "Gaceta Oficial", desc: "Leyes y ordenanzas", Icon: ScrollText },
  { href: "/tramites", titulo: "Trámites", desc: "Requisitos y pasos", Icon: ClipboardList },
  { href: "/contacto", titulo: "Contacto", desc: "Escribinos o denunciá", Icon: MessageSquare },
  { href: "/ayuda", titulo: "Ayuda", desc: "Guía fácil de la web", Icon: Headset },
]

export function SeniorAccesos() {
  return (
    <section aria-label="Accesos fáciles" className="senior-accesos border-b border-border/40 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="mb-5 flex items-center justify-center gap-2 text-center text-lg font-bold text-foreground">
          <TextAa className="h-7 w-7 text-primary" />
          Accesos fáciles: tocá lo que necesites
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {ACCESOS.map(({ href, titulo, desc, Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex min-h-[4.5rem] items-center gap-4 rounded-2xl border border-border/70 bg-card px-5 py-4 shadow-card"
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <Icon className="h-7 w-7" />
              </span>
              <span>
                <span className="block text-lg font-bold leading-snug text-foreground">{titulo}</span>
                <span className="block text-sm text-muted-foreground">{desc}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
