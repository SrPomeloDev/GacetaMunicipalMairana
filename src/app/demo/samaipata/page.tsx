import type { Metadata } from "next"
import { NORMAS_EJEMPLO, SAMAIPATA_DEMO, SERVICIOS_EJEMPLO } from "./data"

export const dynamic = "force-static"

export const metadata: Metadata = {
  title: "Demo Gaceta Municipal de Samaipata (Propuesta no oficial)",
  description:
    "Propuesta visual no oficial de cómo se vería la Gaceta Municipal Digital a nombre del Gobierno Autónomo Municipal de Samaipata. Basada en la Gaceta de Mairana ya en funcionamiento.",
  robots: { index: false, follow: false },
}

const VERDE = "#007A3D"
const VERDE_OSCURO = "#04582E"
const VERDE_CLARO = "#DCFCE7"
const CREMA = "#FAF7F0"
const BORDE = "#E4DCC8"

function BanderaSamaipata({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 416.3 286.15"
      role="img"
      aria-label="Bandera de Samaipata"
      className={className}
    >
      <title>Bandera de Samaipata</title>
      <rect
        x="0.15"
        y="0.15"
        width="416"
        height="143"
        fill="#ffffff"
        stroke="#000"
        strokeOpacity="0.2"
        strokeWidth="0.3"
      />
      <rect x="0.15" y="143.15" width="416" height="143" fill={VERDE} />
    </svg>
  )
}

export default function DemoSamaipataPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: CREMA, color: "#1C1917" }}>
      <div
        className="px-4 py-2 text-center text-xs font-semibold tracking-wide text-white"
        style={{ backgroundColor: VERDE_OSCURO }}
      >
        PROPUESTA DEMO — NO ES EL SITIO OFICIAL — Cómo se vería la Gaceta a nombre del
        G.A.M. Samaipata · Sistema base ya funcionando en Mairana
      </div>
      <div className="flex h-1.5 w-full">
        <div className="w-1/2 bg-white" />
        <div className="w-1/2" style={{ backgroundColor: VERDE }} />
      </div>

      <header className="border-b bg-white/95" style={{ borderColor: BORDE }}>
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl text-lg font-black text-white"
            style={{ backgroundColor: VERDE }}
          >
            S
          </div>
          <BanderaSamaipata className="h-9 w-14 rounded-md object-cover shadow-sm ring-1 ring-black/10" />
          <div className="min-w-0">
            <p className="truncate font-serif text-lg font-extrabold leading-tight">
              Gaceta Municipal · Samaipata
            </p>
            <p className="text-xs font-medium" style={{ color: VERDE }}>
              {SAMAIPATA_DEMO.nombreLargo} — {SAMAIPATA_DEMO.provincia},{" "}
              {SAMAIPATA_DEMO.departamento}
            </p>
          </div>
          <nav className="ml-auto hidden items-center gap-5 text-sm font-medium text-[#57534E] md:flex">
            <span>Inicio</span>
            <span>Gaceta</span>
            <span>Transparencia</span>
            <span>Turismo</span>
            <span>Contacto</span>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden text-white" style={{ backgroundColor: VERDE_OSCURO }}>
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full opacity-20"
            style={{ backgroundColor: VERDE }}
          />
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 md:grid-cols-2 md:py-16">
            <div>
              <p className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-widest">
                {SAMAIPATA_DEMO.lema} · UNESCO
              </p>
              <h1 className="mt-4 font-serif text-4xl font-black leading-tight md:text-5xl">
                Gaceta Oficial de Samaipata
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/90 md:text-base">
                {SAMAIPATA_DEMO.descripcion} Publicación oficial de Leyes
                Municipales, Decretos y Resoluciones, con acceso libre para vecinos,
                turistas y control social.
              </p>
              <div className="mt-5 flex items-center gap-3 rounded-xl bg-white/10 p-3">
                <BanderaSamaipata className="h-10 w-16 shrink-0 rounded-md object-cover shadow ring-1 ring-white/30" />
                <p className="text-xs leading-relaxed text-white/90">
                  Identidad propia: bandera blanca y verde (
                  <span className="font-bold">#007A3D</span>), escudo, dominio y
                  colores del municipio en todo el portal.
                </p>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <span
                  className="rounded-lg bg-white px-5 py-2.5 text-sm font-bold"
                  style={{ color: VERDE_OSCURO }}
                >
                  Ver leyes publicadas
                </span>
                <span className="rounded-lg border border-white/40 px-5 py-2.5 text-sm font-bold text-white">
                  Cómo funciona
                </span>
              </div>
              <p className="mt-4 text-xs text-white/70">
                Demo estática: botones y buscador desactivados a propósito.
              </p>
            </div>

            <div className="space-y-4">
              <div className="overflow-hidden rounded-2xl bg-white text-[#1C1917] shadow-xl">
                <div className="flex h-2 w-full">
                  <div className="w-1/2 bg-white" />
                  <div className="w-1/2" style={{ backgroundColor: VERDE }} />
                </div>
                <div className="p-5">
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: VERDE }}>
                    Portada Gaceta N° 001 · Samaipata (ejemplo visual)
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <BanderaSamaipata className="h-12 w-20 rounded-md object-cover shadow-sm ring-1 ring-black/10" />
                    <div>
                      <p className="font-serif text-base font-black leading-tight">
                        Órgano Oficial del G.A.M. Samaipata
                      </p>
                      <p className="text-xs text-[#78716C]">
                        Leyes · Decretos Ediles · Resoluciones del Concejo
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 rounded-lg border px-3 py-2.5 text-sm text-[#A8A29E]" style={{ borderColor: BORDE, backgroundColor: CREMA }}>
                    Ej.: “tasas ambientales”, “feria”, “turismo”…
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-xl p-3" style={{ backgroundColor: VERDE_CLARO }}>
                      <p className="text-xl font-black" style={{ color: VERDE_OSCURO }}>120+</p>
                      <p className="text-[11px] text-[#57534E]">Normas en línea</p>
                    </div>
                    <div className="rounded-xl bg-[#FFFBEB] p-3">
                      <p className="text-xl font-black text-[#92400E]">15 días</p>
                      <p className="text-[11px] text-[#57534E]">Plazo SEA</p>
                    </div>
                    <div className="rounded-xl bg-white p-3 ring-1 ring-black/5">
                      <p className="text-xl font-black" style={{ color: VERDE }}>24/7</p>
                      <p className="text-[11px] text-[#57534E]">Acceso libre</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4 text-xs leading-relaxed text-white/90">
                Lo que ve el alcalde: portada oficial con bandera, número de gaceta,
                fecha y PDF firmado. Igual que Mairana, pero con identidad de Samaipata.
              </div>
            </div>
          </div>
        </section>

        <section className="border-b bg-white" style={{ borderColor: BORDE }}>
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 md:flex-row md:items-center">
            <BanderaSamaipata className="h-16 w-28 shrink-0 rounded-lg object-cover shadow ring-1 ring-black/10" />
            <div>
              <h2 className="font-serif text-xl font-black">Bandera oficial usada en la demo</h2>
              <p className="mt-1 text-sm leading-relaxed text-[#57534E]">
                Franja superior blanca y franja inferior verde{" "}
                <span className="rounded px-1.5 py-0.5 font-mono text-xs font-bold text-white" style={{ backgroundColor: VERDE }}>
                  #007A3D
                </span>{" "}
                — archivo guardado en{" "}
                <span className="font-mono text-xs">public/images/demo/bandera-samaipata.svg</span>{" "}
                para reutilizar en header, portadas PDF y footer sin tocar nada de Mairana.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: VERDE }}>
                Gaceta oficial
              </p>
              <h2 className="mt-1 font-serif text-2xl font-black md:text-3xl">
                Últimas normas (datos de ejemplo)
              </h2>
            </div>
            <span className="hidden rounded-lg border px-3 py-1.5 text-xs font-bold text-[#57534E] md:block" style={{ borderColor: BORDE }}>
              Ley 482 · Ley 341 · Ley 2028
            </span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {NORMAS_EJEMPLO.map((n) => (
              <article
                key={n.numero}
                className="flex flex-col rounded-2xl border bg-white p-5"
                style={{ borderColor: BORDE }}
              >
                <span
                  className="inline-flex w-fit items-center rounded-full px-2.5 py-1 text-[11px] font-bold"
                  style={{ backgroundColor: VERDE_CLARO, color: VERDE_OSCURO }}
                >
                  ● {n.estado}
                </span>
                <p className="mt-3 text-xs font-bold text-[#92400E]">{n.numero}</p>
                <h3 className="mt-1 font-serif text-base font-bold leading-snug">
                  {n.titulo}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-[#57534E]">
                  {n.resumen}
                </p>
                <p className="mt-4 border-t pt-3 text-xs text-[#A8A29E]" style={{ borderColor: "#F0EBDD" }}>
                  {n.fecha} · Samaipata
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y bg-white" style={{ borderColor: BORDE }}>
          <div className="mx-auto max-w-6xl px-4 py-12">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: VERDE }}>
              Lo que recibe el municipio
            </p>
            <h2 className="mt-1 font-serif text-2xl font-black md:text-3xl">
              El mismo sistema de Mairana, con colores e identidad de Samaipata
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {SERVICIOS_EJEMPLO.map((s) => (
                <div
                  key={s.titulo}
                  className="rounded-2xl border p-5"
                  style={{ borderColor: BORDE, backgroundColor: CREMA }}
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-black text-white"
                    style={{ backgroundColor: VERDE }}
                  >
                    ✓
                  </div>
                  <h3 className="mt-3 text-sm font-bold">{s.titulo}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-[#57534E]">
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12">
          <div className="grid gap-4 rounded-2xl p-6 text-white md:grid-cols-4 md:p-8" style={{ backgroundColor: VERDE_OSCURO }}>
            <div>
              <p className="text-xs uppercase tracking-widest text-white/70">Ubicación</p>
              <p className="mt-1 text-sm font-bold">{SAMAIPATA_DEMO.distancia}</p>
              <p className="text-xs text-white/70">{SAMAIPATA_DEMO.altitud}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-white/70">Población</p>
              <p className="mt-1 text-sm font-bold">{SAMAIPATA_DEMO.habitantes}</p>
              <p className="text-xs text-white/70">{SAMAIPATA_DEMO.clima}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-white/70">Contacto GAM</p>
              <p className="mt-1 text-sm font-bold">{SAMAIPATA_DEMO.telefono}</p>
              <p className="text-xs text-white/70">{SAMAIPATA_DEMO.email}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-white/70">Horario</p>
              <p className="mt-1 text-sm font-bold">{SAMAIPATA_DEMO.horario}</p>
              <p className="text-xs text-white/70">{SAMAIPATA_DEMO.direccion}</p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border bg-white p-6 md:p-8" style={{ borderColor: BORDE }}>
            <h2 className="font-serif text-xl font-black md:text-2xl">
              ¿Qué le proponemos a la Alcaldía?
            </h2>
            <ul className="mt-4 grid gap-2 text-sm leading-relaxed text-[#44403C] md:grid-cols-2">
              <li>· Gaceta digital como medio oficial (Ley Municipal modelo incluida).</li>
              <li>· Migración de sus leyes y PDFs históricos.</li>
              <li>· Bandera, escudo, colores y dominio propios de Samaipata.</li>
              <li>· Capacitación al Concejo y a la Alcaldía (2 horas).</li>
              <li>· Cumplimiento Ley 482 + envío al SEA en 15 días.</li>
              <li>· Ahorro en papel, periódico y fotocopias.</li>
            </ul>
            <div className="mt-6 rounded-xl bg-[#FFFBEB] p-4 text-sm text-[#78350F]">
              Esta página es solo una maqueta visual. El sistema real ya funciona en
              Mairana y se entrega con usuarios, panel de administración y base de
              datos propia del municipio. Contacto del desarrollador: Pablo Salomón
              Moya Peña · pabloxzad77@gmail.com · wa.me/59167823905
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-white" style={{ borderColor: BORDE }}>
        <div className="h-1 w-full" style={{ background: `linear-gradient(to right, #ffffff 0 50%, ${VERDE} 50% 100%)` }} />
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-xs text-[#78716C] md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <BanderaSamaipata className="h-5 w-8 rounded object-cover ring-1 ring-black/10" />
            <p>Demo propuesta · {SAMAIPATA_DEMO.nombreLargo} · Sin validez oficial.</p>
          </div>
          <p>
            Sistema base: Gaceta Municipal de Mairana · Desarrollador Pablo S. Moya Peña
          </p>
        </div>
      </footer>
    </div>
  )
}
