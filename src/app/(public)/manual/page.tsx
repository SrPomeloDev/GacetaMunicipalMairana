"use client"

import * as React from "react"
import Link from "next/link"
import { ManualLayout } from "@/components/manual/manual-layout"
import { SECCIONES_MANUAL, CONTENIDO_MANUAL, AUDIENCIA_POR_MODULO, textoParaImpresion, ejemploParaImpresion } from "@/lib/manual-contenido"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Search,
  BookOpen,
  ArrowRight,
  Shield,
  FileCheck,
  FolderOpen,
  Printer,
} from "lucide-react"

export default function ManualIndicePage() {
  const [busqueda, setBusqueda] = React.useState("")
  const [categoriaSeleccionada, setCategoriaSeleccionada] = React.useState<string>("Todas")

  const categorias = React.useMemo(() => {
    const set = new Set<string>()
    SECCIONES_MANUAL.forEach((s) => set.add(s.categoria))
    return ["Todas", ...Array.from(set)]
  }, [])

  const seccionesFiltradas = React.useMemo(() => {
    return SECCIONES_MANUAL.filter((s) => {
      const coincideCat =
        categoriaSeleccionada === "Todas" || s.categoria === categoriaSeleccionada
      const q = busqueda.toLowerCase().trim()
      const coincideTexto =
        !q ||
        s.titulo.toLowerCase().includes(q) ||
        s.subtitulo.toLowerCase().includes(q) ||
        s.descripcion.toLowerCase().includes(q) ||
        s.categoria.toLowerCase().includes(q)
      return coincideCat && coincideTexto
    })
  }, [busqueda, categoriaSeleccionada])

  return (
    <ManualLayout>
      <div className="space-y-8">
        {/* Banner de Presentación Documental */}
        <section className="rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card to-muted/40 p-6 sm:p-8 shadow-sm print:hidden">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <BookOpen className="h-3.5 w-3.5" />
              Documentación Oficial para Administradores
            </div>

            <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Manual de Usuario del Panel Administrativo
            </h1>

            <p className="text-base leading-relaxed text-muted-foreground">
              Guía técnica y operativa para la administración de la Gaceta Municipal de Mairana.
              Consulte procedimientos paso a paso, especificaciones de campos, capacidades de almacenamiento y resolución de incidencias.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-muted-foreground">
              <Button onClick={() => window.print()} className="gap-1.5">
                <Printer className="h-4 w-4" />
                Imprimir manual completo
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <FileCheck className="h-4 w-4 text-primary" />
                17 Capítulos Completos
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <FolderOpen className="h-4 w-4 text-primary" />
                Capacidad y formatos de almacenamiento
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <Shield className="h-4 w-4 text-primary" />
                Matriz de Roles y Permisos
              </span>
            </div>
          </div>
        </section>

        {/* Buscador Rápido y Filtro por Categoría */}
        <section className="space-y-4 print:hidden">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por palabra clave (ej. decretos, resoluciones, contrataciones)..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-9 h-11 text-sm bg-card"
              />
            </div>
            <p className="text-xs text-muted-foreground print:hidden sm:ml-3">
              Quite el filtro para imprimir el índice completo
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {categorias.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoriaSeleccionada(cat)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  categoriaSeleccionada === cat
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Cuadrícula de Capítulos */}
        <section className="space-y-4 print:hidden">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-foreground">
              Capítulos y Módulos del Sistema
            </h2>
            <span className="text-xs text-muted-foreground">
              Mostrando {seccionesFiltradas.length} de {SECCIONES_MANUAL.length} secciones
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {seccionesFiltradas.map((s, idx) => (
              <Link
                key={s.id}
                href={`/manual/${s.id}`}
                className="group block h-full focus:outline-none"
              >
                <Card className="h-full border-border/80 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lifted">
                  <CardContent className="flex flex-col justify-between p-5 h-full space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="outline" className="text-[10px] font-normal">
                          {s.categoria}
                        </Badge>
                        <span className="font-mono text-xs font-bold text-muted-foreground group-hover:text-primary transition-colors">
                          #{(idx + 1).toString().padStart(2, "0")}
                        </span>
                      </div>

                      <h3 className="font-serif text-base font-bold text-card-foreground group-hover:text-primary transition-colors">
                        {s.titulo}
                      </h3>

                      <p className="text-xs font-medium text-primary">
                        {s.subtitulo}
                      </p>

                      <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">
                        {s.descripcion}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border/50 text-xs font-medium text-primary">
                      <span>Consultar guía</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {seccionesFiltradas.length === 0 && (
            <div className="rounded-xl border border-dashed border-border p-12 text-center">
              <Search className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
              <p className="font-semibold text-foreground">No se encontraron capítulos</p>
              <p className="text-sm text-muted-foreground mt-1">
                Intente con otros términos o seleccione &quot;Todas&quot; las categorías.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => {
                  setBusqueda("")
                  setCategoriaSeleccionada("Todas")
                }}
              >
                Restablecer filtros
              </Button>
            </div>
          )}
        </section>

        {/* Descargar el manual en PDF */}
        <section className="rounded-xl border border-border/70 bg-card p-6 shadow-sm print:hidden">
          <div className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-primary" />
            <h3 className="font-serif text-lg font-bold text-foreground">
              Descargar el manual en PDF
            </h3>
          </div>
          <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2"><span className="font-bold text-primary">1.</span> Abra el capítulo que necesite desde el índice de abajo.</li>
            <li className="flex gap-2"><span className="font-bold text-primary">2.</span> Pulse el botón <strong className="text-foreground">Descargar PDF</strong> (arriba a la derecha).</li>
            <li className="flex gap-2"><span className="font-bold text-primary">3.</span> En el diálogo de impresión elija destino <strong className="text-foreground">Guardar como PDF</strong> y guarde.</li>
          </ol>
        </section>

        {/* Acceso Rápido a Almacenamiento */}
        <section className="rounded-xl border border-primary/20 bg-primary/5 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-bold text-foreground">
              Capítulo especial: cómo subir archivos
            </h3>
            <p className="text-xs text-muted-foreground">
              Qué formato usar, tamaños máximos recomendados y cómo resolver los avisos más comunes.
            </p>
          </div>
          <Link
            href="/manual/archivos"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
          >
            Ver cómo subir archivos
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </section>

        {/* Versión completa solo para impresión */}
        <div className="hidden print:block">
          <h1 className="text-2xl font-bold">Manual del Administrador — Gaceta Municipal de Mairana</h1>
          <p className="text-sm">Los 17 módulos con su contenido completo · Octubre de 2026</p>
          {SECCIONES_MANUAL.map((s, idx) => {
            const c = CONTENIDO_MANUAL[s.id]
            if (!c) return null
            const pasos = c.pasos || []
            const campos = c.campos || []
            const errores = c.erroresComunes || []
            const notas = c.notas || []
            return (
              <section key={s.id} className="mt-6">
                <h2 className="text-xl font-bold">
                  Capítulo {(idx + 1).toString().padStart(2, "0")}: {s.titulo}
                </h2>
                <p className="text-sm font-medium">{s.subtitulo}</p>
                {AUDIENCIA_POR_MODULO[s.id] && (
                  <p className="mt-1 text-sm"><strong>Dirigido a: </strong>{AUDIENCIA_POR_MODULO[s.id]}</p>
                )}
                <p className="mt-1 text-sm">{textoParaImpresion(c.proposito)}</p>
                {(pasos).length > 0 && (
                  <>
                    <h3 className="mt-3 text-base font-bold">Paso a paso</h3>
                    <ol className="list-decimal pl-5 text-sm">
                      {pasos.map((p) => (
                        <li key={p.numero} className="mt-1">
                          <strong>{textoParaImpresion(p.titulo)}:</strong> {textoParaImpresion(p.descripcion)}
                        </li>
                      ))}
                    </ol>
                  </>
                )}
                {(campos).length > 0 && (
                  <>
                    <h3 className="mt-3 text-base font-bold">Campos principales</h3>
                    <ul className="list-disc pl-5 text-sm">
                      {campos.map((f) => (
                        <li key={f.nombre} className="mt-1">
                          <strong>{f.nombre}:</strong> {textoParaImpresion(f.descripcion)} <em>Ej.: {ejemploParaImpresion(f.nombre, f.ejemplo)}</em>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                {(errores).length > 0 && (
                  <>
                    <h3 className="mt-3 text-base font-bold">Avisos comunes y solución</h3>
                    <ul className="list-disc pl-5 text-sm">
                      {errores.map((e) => (
                        <li key={e.error} className="mt-1">
                          <strong>{e.error}:</strong> {textoParaImpresion(e.causa)} <strong>Solución:</strong> {textoParaImpresion(e.solucion)}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                {(notas).length > 0 && (
                  <>
                    <h3 className="mt-3 text-base font-bold">Notas</h3>
                    <ul className="list-disc pl-5 text-sm">
                      {notas.map((n, i) => (
                        <li key={i} className="mt-1">{textoParaImpresion(n)}</li>
                      ))}
                    </ul>
                  </>
                )}
              </section>
            )
          })}
        </div>
      </div>
    </ManualLayout>
  )
}
