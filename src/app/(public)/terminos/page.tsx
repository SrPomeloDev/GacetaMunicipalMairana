import Link from "next/link"
import PageHeader from "@/components/layout/page-header"
import { ScrollText } from "@/lib/icons"

const SECCIONES = [
  {
    titulo: "1. Naturaleza del sitio",
    cuerpo: [
      "Este es el portal institucional informativo del Gobierno Autónomo Municipal de Mairana (Santa Cruz, Bolivia). Su finalidad es difundir la Gaceta Municipal, noticias, trámites, transparencia y servicios de información ciudadana.",
      "El portal no es una ventanilla de pagos ni genera trámites en línea con efecto jurídico automático: las guías de trámites son orientativas y el acto administrativo se perfecciona en las oficinas municipales.",
    ],
  },
  {
    titulo: "2. Publicaciones oficiales",
    cuerpo: [
      "La Gaceta digital tiene fines de difusión y transparencia. Ante cualquier discrepancia entre la versión digital y el ejemplar físico o el archivo oficial del municipio, prevalece el documento oficial resguardado por el G.A.M. Mairana.",
      "Los estados de cada norma (vigente, derogada, modificada, suspendida) se publican con fines orientativos y se actualizan conforme a los actos del Concejo Municipal y el Órgano Ejecutivo.",
    ],
  },
  {
    titulo: "3. Uso adecuado y restricciones",
    cuerpo: [
      "Queda prohibido: suplantar la identidad de otra persona, enviar mensajes masivos o spam, publicar contenido ilícito, difamatorio o contrario a la moral pública, e intentar vulnerar la seguridad del portal.",
      "Las denuncias con información deliberadamente falsa pueden generar responsabilidades conforme a la normativa boliviana vigente. El municipio puede bloquear o reportar usos abusivos del portal.",
    ],
  },
  {
    titulo: "4. Contacto y denuncias",
    cuerpo: [
      "El formulario de contacto permite enviar consultas, reclamos, sugerencias y denuncias. Las denuncias pueden enviarse de forma anónima: en ese caso no se solicitará correo y no será posible responder ni dar seguimiento personal.",
      "Si deja su correo electrónico, el mensaje será atendido por el personal municipal y respondido a esa dirección.",
    ],
  },
  {
    titulo: "5. Boletín municipal",
    cuerpo: [
      "La suscripción al boletín es voluntaria y gratuita. Puede darse de baja en cualquier momento escribiendo al correo institucional del municipio.",
    ],
  },
  {
    titulo: "6. Enlaces externos",
    cuerpo: [
      "El portal enlaza servicios de terceros (Facebook, WhatsApp, mapas). Cada uno se rige por sus propias políticas y el municipio no responde por su contenido ni disponibilidad.",
    ],
  },
  {
    titulo: "7. Propiedad intelectual",
    cuerpo: [
      "El escudo, la bandera y las imágenes institucionales pertenecen al G.A.M. Mairana. Los documentos oficiales (leyes, ordenanzas, resoluciones) son de libre reproducción citando la fuente.",
    ],
  },
  {
    titulo: "8. Uso interno por funcionarios",
    cuerpo: [
      "La cuenta del panel de administración es personal e intransferible: está prohibido compartir contraseñas. El registro público se encuentra desactivado; las altas las realiza un administrador.",
      "Cada funcionario responde por lo que publica con su cuenta: debe verificar número, fechas, documentos y estados antes de publicar, ya que los cambios se reflejan de inmediato en el portal público.",
      "Los roles (administrador, editor, publicador) definen qué puede hacer cada cuenta. El mal uso de la cuenta puede derivar en su desactivación y en las medidas administrativas correspondientes.",
    ],
  },
  {
    titulo: "9. Disponibilidad y cambios",
    cuerpo: [
      "El servicio se ofrece tal cual, sin garantía de disponibilidad ininterrumpida. El municipio puede actualizar estos términos; la versión vigente es la publicada en esta página, con su fecha de actualización.",
      "El tratamiento de sus datos personales se describe en el Aviso de Privacidad.",
    ],
  },
]

export default function TerminosPage() {
  return (
    <div className="pb-16">
      <PageHeader
        title="Términos y Condiciones"
        description="Reglas de uso del portal de la Gaceta Municipal de Mairana, para ciudadanos y funcionarios."
        crumbs={[{ label: "Términos y Condiciones" }]}
        icon={<ScrollText className="hidden h-8 w-8 text-primary sm:block" />}
      />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {SECCIONES.map((s) => (
            <section key={s.titulo} className="rounded-xl border border-border/70 bg-card p-6 shadow-sm">
              <h2 className="font-serif text-xl font-bold text-foreground">{s.titulo}</h2>
              <div className="mt-3 space-y-2.5 text-sm leading-relaxed text-muted-foreground">
                {s.cuerpo.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>
          ))}
          <p className="text-center text-xs text-muted-foreground">
            Última actualización: octubre de 2026 ·{" "}
            <Link href="/privacidad" className="text-primary underline-offset-4 hover:underline">
              Ver Aviso de Privacidad
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
