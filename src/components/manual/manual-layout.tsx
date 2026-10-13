"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { SECCIONES_MANUAL } from "@/lib/manual-contenido"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Printer,
  Search,
  BookOpen,
  ChevronRight,
  ExternalLink,
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface ManualLayoutProps {
  children: React.ReactNode
  seccionActivaId?: string
}

export function ManualLayout({ children, seccionActivaId }: ManualLayoutProps) {
  const pathname = usePathname()
  const [filtro, setFiltro] = React.useState("")

  const seccionesFiltradas = React.useMemo(() => {
    if (!filtro.trim()) return SECCIONES_MANUAL
    const q = filtro.toLowerCase()
    return SECCIONES_MANUAL.filter(
      (s) =>
        s.titulo.toLowerCase().includes(q) ||
        s.descripcion.toLowerCase().includes(q) ||
        s.categoria.toLowerCase().includes(q)
    )
  }, [filtro])

  const imprimirManual = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Cabecera del Manual (estática: evita superposición con el header global fijo) */}
      <header className="border-b border-border/80 bg-card/60 print:static print:bg-white print:border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/manual"
              className="flex items-center gap-2 text-foreground font-serif font-bold text-lg hover:text-primary transition-colors"
            >
              <BookOpen className="h-5 w-5 text-primary" />
              <span>Manual del Administrador</span>
            </Link>
            <Badge variant="outline" className="text-[11px] font-normal border-primary/30 text-primary">
              Gaceta Municipal de Mairana
            </Badge>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={imprimirManual}
              className="gap-1.5 text-xs"
            >
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">Imprimir / PDF</span>
            </Button>
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
            >
              <span className="hidden sm:inline">Ir al Panel</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Contenedor con Sidebar y Contenido */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 print:p-0">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 print:block">
          {/* Índice colapsable solo en móvil */}
          <details className="lg:hidden print:hidden group rounded-xl border border-border/70 bg-card shadow-sm">
            <summary className="flex cursor-pointer list-none items-center justify-between p-4 text-sm font-semibold text-foreground">
              <span className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                Índice de módulos (17)
              </span>
              <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
            </summary>
            <nav className="max-h-80 space-y-1 overflow-y-auto border-t border-border/60 p-3">
              {seccionesFiltradas.map((s, idx) => {
                const href = `/manual/${s.id}`
                const activa = seccionActivaId === s.id || pathname === href
                return (
                  <Link
                    key={s.id}
                    href={href}
                    onClick={(e) => (e.currentTarget.closest("details") as HTMLDetailsElement | null)?.removeAttribute("open")}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                      activa
                        ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <span className="text-[10px] opacity-70">
                      {(idx + 1).toString().padStart(2, "0")}.
                    </span>
                    <span className="truncate">{s.titulo}</span>
                  </Link>
                )
              })}
            </nav>
          </details>

          {/* Sidebar de Navegación Documental (desktop) */}
          <aside className="hidden lg:col-span-2 lg:block print:hidden">
            <div className="z-10 space-y-3 rounded-xl border border-border/70 bg-card p-3 shadow-sm lg:sticky lg:top-[124px] xl:top-[128px]">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Índice de Módulos (17)
                </span>
                <Link
                  href="/manual"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Ver todos
                </Link>
              </div>

              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar módulo..."
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  className="h-9 pl-8 text-xs"
                />
              </div>

              <nav className="max-h-[calc(100vh-320px)] space-y-1 overflow-y-auto pr-1">
                {seccionesFiltradas.map((s, idx) => {
                  const href = `/manual/${s.id}`
                  const activa = seccionActivaId === s.id || pathname === href

                  return (
                    <Link
                      key={s.id}
                      href={href}
                      className={cn(
                        "group flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
                        activa
                          ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <span className="flex items-center gap-2 truncate">
                        <span className={cn("text-[10px] opacity-70", activa ? "text-primary-foreground" : "text-muted-foreground")}>
                          {(idx + 1).toString().padStart(2, "0")}.
                        </span>
                        <span className="truncate">{s.titulo}</span>
                      </span>
                      {activa ? (
                        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                      ) : (
                        <span className="text-[10px] opacity-0 transition-opacity group-hover:opacity-100">
                          →
                        </span>
                      )}
                    </Link>
                  )
                })}
              </nav>
            </div>
          </aside>

          {/* Área Principal de Contenido Documental */}
          <main className="min-w-0 lg:col-span-10 print:w-full">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
