import { notFound } from "next/navigation"
import Link from "next/link"
import { ManualLayout } from "@/components/manual/manual-layout"
import { CONTENIDO_MANUAL, SECCIONES_MANUAL, AUDIENCIA_POR_MODULO } from "@/lib/manual-contenido"
import { Paso } from "@/components/manual/paso"
import { MockForm } from "@/components/manual/mock-form"
import { MockUpload } from "@/components/manual/mock-upload"
import { TablaLimites } from "@/components/manual/tabla-limites"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  AlertTriangle,
  Shield,
  HelpCircle,
} from "lucide-react"

export function generateStaticParams() {
  return SECCIONES_MANUAL.map((s) => ({
    seccion: s.id,
  }))
}

export default async function ManualSeccionPage({
  params,
}: {
  params: Promise<{ seccion: string }>
}) {
  const { seccion: seccionId } = await params
  const seccion = CONTENIDO_MANUAL[seccionId]

  if (!seccion) {
    notFound()
  }

  const indiceActual = SECCIONES_MANUAL.findIndex((s) => s.id === seccionId)
  const anterior = indiceActual > 0 ? SECCIONES_MANUAL[indiceActual - 1] : null
  const siguiente =
    indiceActual < SECCIONES_MANUAL.length - 1
      ? SECCIONES_MANUAL[indiceActual + 1]
      : null

  return (
    <ManualLayout seccionActivaId={seccionId}>
      <article className="space-y-8">
        {/* Cabecera del Capítulo */}
        <header className="space-y-4 border-b border-border/70 pb-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs font-normal">
                {seccion.meta.categoria}
              </Badge>
              <Badge
                variant={
                  seccion.meta.rolRequerido === "admin"
                    ? "destructive"
                    : seccion.meta.rolRequerido === "editor"
                    ? "default"
                    : "soft-neutral"
                }
                className="text-[11px]"
              >
                Rol: {seccion.meta.rolRequerido}
              </Badge>
            </div>

            {seccion.meta.urlPanel && (
              <a
                href={seccion.meta.urlPanel}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
              >
                <span>Abrir módulo en panel</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>

          <div>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Capítulo {(indiceActual + 1).toString().padStart(2, "0")}
            </span>
            <h1 className="mt-1 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {seccion.meta.titulo}
            </h1>
            <p className="mt-1.5 text-base font-medium text-primary">
              {seccion.meta.subtitulo}
            </p>
          </div>

          <p className="text-sm leading-relaxed text-muted-foreground">
            {seccion.proposito}
          </p>
        </header>

        {/* A quién va dirigido */}
        {AUDIENCIA_POR_MODULO[seccionId] && (
          <section className="rounded-xl border-l-4 border-l-primary border border-border/70 bg-primary/5 p-5 shadow-sm">
            <p className="text-sm text-foreground">
              <span className="font-bold">Dirigido a: </span>
              {AUDIENCIA_POR_MODULO[seccionId]}
            </p>
          </section>
        )}

        {/* Requisitos Previos (si aplica) */}
        {seccion.requisitos && seccion.requisitos.length > 0 && (
          <section className="rounded-xl border border-border/70 bg-card p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <h3 className="font-serif text-sm font-bold text-foreground">
                Requisitos Previos y Permisos
              </h3>
            </div>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              {seccion.requisitos.map((req, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="font-bold text-primary">•</span>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Capítulo Especial de Archivos */}
        {seccionId === "archivos" && (
          <section className="space-y-6">
            <div className="space-y-2">
              <h2 className="font-serif text-xl font-bold text-foreground">
                1. Qué archivo usar en cada caso
              </h2>
              <p className="text-xs text-muted-foreground">
                Tamaños máximos y formatos recomendados para fotos y documentos del portal.
              </p>
            </div>

            <TablaLimites />

            <div className="space-y-2 pt-4">
              <h2 className="font-serif text-xl font-bold text-foreground">
                2. Cómo se ve la carga de archivos
              </h2>
              <p className="text-xs text-muted-foreground">
                Pruebe los 3 momentos: en reposo, subiendo (con barra de progreso) y con archivo guardado. También puede simular los avisos más comunes.
              </p>
            </div>

            <MockUpload estadoInicial="reposo" />
          </section>
        )}

        {/* Guía Paso a Paso */}
        <section className="space-y-4">
          <h2 className="font-serif text-xl font-bold text-foreground">
            Procedimiento Paso a Paso
          </h2>
          <div className="space-y-3 rounded-xl border border-border/70 bg-card p-6 shadow-sm">
            {seccion.pasos.map((paso) => (
              <Paso
                key={paso.numero}
                numero={paso.numero}
                titulo={paso.titulo}
                descripcion={paso.descripcion}
                consejo={paso.consejo}
              />
            ))}
          </div>
        </section>

        {/* Formulario Mockup Interactivo (si aplica) */}
        {seccion.mockForm && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl font-bold text-foreground">
                Interfaz del Formulario
              </h2>
              <Badge variant="outline" className="text-xs">
                Datos ficticios ilustrativos
              </Badge>
            </div>
            <MockForm
              titulo={seccion.mockForm.titulo}
              subtitulo={seccion.mockForm.subtitulo}
              campos={seccion.mockForm.campos}
              botonTexto={seccion.mockForm.botonTexto}
            />
          </section>
        )}

        {/* Tabla Mockup de Registros (si aplica) */}
        {seccion.mockTabla && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl font-bold text-foreground">
                Estructura de la Tabla de Registros
              </h2>
              <Badge variant="soft-warning" className="text-xs">
                Datos de ejemplo
              </Badge>
            </div>

            <div className="overflow-x-auto rounded-xl border border-border/80 bg-card shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/60 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    {seccion.mockTabla.columnas.map((col) => (
                      <th key={col.key} className="px-4 py-3">
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-card-foreground">
                  {seccion.mockTabla.filas.map((fila, idx) => (
                    <tr key={idx} className="transition-colors hover:bg-muted/30">
                      {seccion.mockTabla?.columnas.map((col) => (
                        <td key={col.key} className="px-4 py-3 text-xs">
                          {String(fila[col.key] ?? "")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Especificación de Campos */}
        <section className="space-y-4">
          <h2 className="font-serif text-xl font-bold text-foreground">
            Diccionario de Campos y Parámetros
          </h2>

          <div className="overflow-x-auto rounded-xl border border-border/80 bg-card shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/60 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Campo</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Obligatorio</th>
                  <th className="px-4 py-3">Descripción</th>
                  <th className="px-4 py-3">Ejemplo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-card-foreground">
                {seccion.campos.map((campo, idx) => (
                  <tr key={idx} className="transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3 font-semibold text-xs text-foreground">
                      {campo.nombre}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-muted-foreground">
                      {campo.tipo ?? "Texto"}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {campo.requerido ? (
                        <span className="font-semibold text-primary">Sí</span>
                      ) : (
                        <span className="text-muted-foreground">Opcional</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs leading-relaxed text-muted-foreground">
                      {campo.descripcion}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-foreground/80 bg-muted/20">
                      {campo.ejemplo}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Errores Comunes y Solución */}
        {seccion.erroresComunes && seccion.erroresComunes.length > 0 && (
          <section className="space-y-4">
            <h2 className="font-serif text-xl font-bold text-foreground">
              Errores Comunes y Diagnóstico
            </h2>

            <div className="space-y-3">
              {seccion.erroresComunes.map((err, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-4 text-xs space-y-2 shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                    <span className="font-mono font-bold text-yellow-800 dark:text-yellow-200">
                      {err.error}
                    </span>
                  </div>
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Causa: </strong> {err.causa}
                  </p>
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Solución recomendada: </strong> {err.solucion}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Notas Institucionales */}
        {seccion.notas && seccion.notas.length > 0 && (
          <section className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-2">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-primary" />
              <h3 className="font-serif text-sm font-bold text-foreground">
                Notas Institucionales
              </h3>
            </div>
            <ul className="space-y-1 text-xs text-muted-foreground">
              {seccion.notas.map((n, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="font-bold text-primary">•</span>
                  <span>{n}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Paginación entre Capítulos */}
        <nav className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/70 pt-6 print:hidden">
          {anterior ? (
            <Link
              href={`/manual/${anterior.id}`}
              className="group flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <div className="text-left">
                <span className="block text-[10px] uppercase text-muted-foreground">Capítulo anterior</span>
                <span>{anterior.titulo}</span>
              </div>
            </Link>
          ) : (
            <div />
          )}

          <Link
            href="/manual"
            className="text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Volver al Índice General
          </Link>

          {siguiente ? (
            <Link
              href={`/manual/${siguiente.id}`}
              className="group flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
            >
              <div className="text-right">
                <span className="block text-[10px] uppercase text-muted-foreground">Siguiente capítulo</span>
                <span>{siguiente.titulo}</span>
              </div>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          ) : (
            <div />
          )}
        </nav>
      </article>
    </ManualLayout>
  )
}
