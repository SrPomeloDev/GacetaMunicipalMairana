import type { Metadata } from "next"
import { createAdminClient } from "@/lib/supabase/admin"
import { MAIRANA, telHref, whatsappUrl } from "@/lib/constants"
import { Card, CardContent } from "@/components/ui/card"
import { IconBox } from "@/components/ui/icon-box"
import PageHeader from "@/components/layout/page-header"
import { Headset, MapPin, Phone, Mail, Clock, MessageCircle } from "@/lib/icons"
import ContactoForm from "@/components/contacto/contacto-form"

export const metadata: Metadata = {
  title: "Contacto",
}

export const dynamic = "force-dynamic"

const MAIRANA_LAT = -18.119
const MAIRANA_LON = -63.956

export default async function ContactoPage() {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from("configuracion")
    .select("direccion, telefono, whatsapp, email, horario")
    .eq("id", 1)
    .maybeSingle()

  const direccionRaw = data?.direccion
  const direccion = direccionRaw || `${MAIRANA.direccion}, ${MAIRANA.nombre}, ${MAIRANA.provincia}, ${MAIRANA.departamento}`
  const telefono = data?.telefono || MAIRANA.telefono
  const email = data?.email || MAIRANA.email
  const horario = data?.horario || "Lun a Vie 08:00 - 16:00"
  const telLink = telHref(data?.telefono)
  const waLink = whatsappUrl(data?.whatsapp)

  const mapLink = `https://www.openstreetmap.org/?mlat=${MAIRANA_LAT}&mlon=${MAIRANA_LON}#map=16/${MAIRANA_LAT}/${MAIRANA_LON}`

  const contactInfo = [
    { icon: MapPin, label: "Dirección", value: direccion, href: mapLink, external: true },
    { icon: Phone, label: "Teléfono", value: telefono, href: telLink || undefined, external: false },
    { icon: Mail, label: "Correo Electrónico", value: email, href: email ? `mailto:${email}` : undefined, external: false },
    { icon: Clock, label: "Horarios", value: horario, href: undefined, external: false },
  ]

  return (
    <div className="pb-16">
      <PageHeader
        title="Contacto"
        description="Comunicate con el Gobierno Autónomo Municipal de Mairana. Estamos para atenderte y responder tus consultas."
        crumbs={[{ label: "Contacto" }]}
        icon={<Headset className="hidden h-8 w-8 text-primary sm:block" />}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2 pt-8">
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-6">
                {contactInfo.map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.label} className="flex items-start gap-4">
                      <IconBox size="md">
                        <Icon className="h-5 w-5" />
                      </IconBox>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">{item.label}</p>
                        {item.href ? (
                          <a
                            href={item.href}
                            target={item.external ? "_blank" : undefined}
                            rel={item.external ? "noopener noreferrer" : undefined}
                            className="text-sm text-muted-foreground mt-0.5 inline-block break-words underline-offset-4 transition-colors hover:text-primary hover:underline"
                          >
                            {item.value}
                          </a>
                        ) : (
                          <p className="text-sm text-muted-foreground mt-0.5">{item.value}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
                {waLink && (
                  <div className="flex items-start gap-4">
                    <IconBox size="md">
                      <MessageCircle className="h-5 w-5" />
                    </IconBox>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">WhatsApp</p>
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-3 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Chateá con nosotros
                      </a>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="overflow-hidden rounded-xl border border-primary/15 shadow-sm">
              <iframe
                title="Mapa de ubicación de la Alcaldía de Mairana"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${MAIRANA_LON - 0.012}%2C${MAIRANA_LAT - 0.008}%2C${MAIRANA_LON + 0.012}%2C${MAIRANA_LAT + 0.008}&layer=mapnik&marker=${MAIRANA_LAT}%2C${MAIRANA_LON}`}
                className="aspect-[16/9] w-full border-0"
                loading="lazy"
              />
              <div className="flex items-center justify-between gap-2 border-t border-primary/10 bg-card px-4 py-2.5">
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  Plaza Principal 24 de Septiembre
                </p>
                <a href={mapLink} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-primary hover:underline">
                  Ver mapa ampliado
                </a>
              </div>
            </div>
          </div>

          <ContactoForm />
        </div>
      </div>
    </div>
  )
}