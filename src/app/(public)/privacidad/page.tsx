import Link from "next/link"
import PageHeader from "@/components/layout/page-header"
import { ShieldCheck } from "@/lib/icons"

const SECCIONES = [
  {
    titulo: "1. Qué datos recogemos",
    cuerpo: [
      "Formulario de contacto: nombre, correo electrónico, asunto, mensaje y categoría. En denuncias anónimas no se recoge ningún dato identificatorio.",
      "Boletín municipal: únicamente su correo electrónico.",
      "Funcionarios: nombre, correo institucional, rol, dependencia y credenciales de acceso al panel.",
    ],
  },
  {
    titulo: "2. Para qué los usamos",
    cuerpo: [
      "Responder sus mensajes, gestionar denuncias y reclamos, enviar el boletín municipal y administrar las cuentas de funcionarios. No usamos sus datos con fines distintos ni los vendemos o cedemos a terceros con fines comerciales.",
    ],
  },
  {
    titulo: "3. Conservación",
    cuerpo: [
      "Los mensajes de contacto se conservan mientras sean necesarios para su atención y seguimiento. Puede pedir su eliminación escribiendo al correo institucional del municipio. Las cuentas de funcionarios inactivas pueden ser desactivadas.",
    ],
  },
  {
    titulo: "4. Sus derechos",
    cuerpo: [
      "Puede solicitar acceso, corrección o eliminación de sus datos personales escribiendo al correo institucional del municipio o, si es funcionario, a un administrador del panel.",
    ],
  },
  {
    titulo: "5. Seguridad",
    cuerpo: [
      "Aplicamos autenticación, control de acceso por roles y políticas de base de datos para proteger su información. Ningún sistema es infalible: evite enviar contraseñas u otros datos sensibles por el formulario de contacto.",
    ],
  },
  {
    titulo: "6. Responsable",
    cuerpo: [
      "Responsable del tratamiento: Gobierno Autónomo Municipal de Mairana, Plaza Principal 24 de Septiembre, Mairana, Santa Cruz, Bolivia.",
    ],
  },
]

export default function PrivacidadPage() {
  return (
    <div className="pb-16">
      <PageHeader
        title="Aviso de Privacidad"
        description="Cómo tratamos sus datos personales en el portal municipal."
        crumbs={[{ label: "Aviso de Privacidad" }]}
        icon={<ShieldCheck className="hidden h-8 w-8 text-primary sm:block" />}
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
            <Link href="/terminos" className="text-primary underline-offset-4 hover:underline">
              Ver Términos y Condiciones
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
