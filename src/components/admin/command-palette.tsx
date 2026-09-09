"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { ADMIN_NAV } from "@/lib/constants"
import { can, canView, useCurrentUser } from "@/hooks/use-current-user"
import type { Modulo } from "@/lib/roles"
import {
  Building2,
  CircleUserRound,
  ClipboardList,
  Command,
  FileText,
  Gavel,
  Globe,
  Image as ImageIcon,
  Inbox,
  Landmark,
  LayoutDashboard,
  Mail,
  Newspaper,
  Plus,
  Search,
  Settings,
  Shield,
  Tags,
  UserCog,
  Users,
} from "lucide-react"

const iconos: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="h-4 w-4" />,
  FileText: <FileText className="h-4 w-4" />,
  Newspaper: <Newspaper className="h-4 w-4" />,
  Users: <Users className="h-4 w-4" />,
  Building2: <Building2 className="h-4 w-4" />,
  Tags: <Tags className="h-4 w-4" />,
  Landmark: <Landmark className="h-4 w-4" />,
  Shield: <Shield className="h-4 w-4" />,
  ClipboardList: <ClipboardList className="h-4 w-4" />,
  Image: <ImageIcon className="h-4 w-4" />,
  Gavel: <Gavel className="h-4 w-4" />,
  Mail: <Mail className="h-4 w-4" />,
  Inbox: <Inbox className="h-4 w-4" />,
  UserCog: <UserCog className="h-4 w-4" />,
  Settings: <Settings className="h-4 w-4" />,
}

const modulosConNueva: ReadonlySet<Modulo> = new Set([
  "normativa",
  "noticias",
  "autoridades",
  "dependencias",
  "categorias",
  "transparencia",
  "tramites",
  "galeria",
  "contrataciones",
  "usuarios",
])

const kbdClass =
  "rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] leading-none text-muted-foreground"

interface Comando {
  id: string
  titulo: string
  pista: string
  href: string
  icono: React.ReactNode
  seccion: string
}

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

export default function CommandPalette() {
  const router = useRouter()
  const { user } = useCurrentUser()
  const [abierto, setAbierto] = useState(false)
  const [consulta, setConsulta] = useState("")
  const [seleccionado, setSeleccionado] = useState(0)
  const entradaRef = useRef<HTMLInputElement>(null)
  const itemsRef = useRef(new Map<number, HTMLButtonElement>())

  const comandos = useMemo<Comando[]>(() => {
    const lista: Comando[] = []
    for (const item of ADMIN_NAV) {
      if (item.href !== "/admin/dashboard" && !canView(user, item.modulo)) continue
      lista.push({
        id: `ir-${item.href}`,
        titulo: `Ir a ${item.label}`,
        pista: item.href,
        href: item.href,
        icono: iconos[item.icon] ?? <Command className="h-4 w-4" />,
        seccion: "Navegación",
      })
    }
    for (const item of ADMIN_NAV) {
      if (!modulosConNueva.has(item.modulo)) continue
      if (item.href !== "/admin/dashboard" && !canView(user, item.modulo)) continue
      if (!can(user, item.modulo, "crear")) continue
      lista.push({
        id: `nuevo-${item.href}`,
        titulo: `Nuevo ${item.label}`,
        pista: `${item.href}/nueva`,
        href: `${item.href}/nueva`,
        icono: <Plus className="h-4 w-4" />,
        seccion: "Acciones",
      })
    }
    lista.push({
      id: "sitio-publico",
      titulo: "Ver sitio público",
      pista: "/",
      href: "/",
      icono: <Globe className="h-4 w-4" />,
      seccion: "General",
    })
    lista.push({
      id: "mi-cuenta",
      titulo: "Mi cuenta",
      pista: "/admin/perfil",
      href: "/admin/perfil",
      icono: <CircleUserRound className="h-4 w-4" />,
      seccion: "General",
    })
    return lista
  }, [user])

  const filtrados = useMemo<Comando[]>(() => {
    const partes = normalizar(consulta.trim()).split(/\s+/).filter(Boolean)
    if (partes.length === 0) return comandos
    return comandos.filter((comando) => {
      const texto = normalizar(`${comando.titulo} ${comando.pista}`)
      return partes.every((parte) => texto.includes(parte))
    })
  }, [comandos, consulta])

  const indice = Math.min(seleccionado, Math.max(filtrados.length - 1, 0))

  useEffect(() => {
    if (abierto) {
      entradaRef.current?.focus()
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = ""
      }
    }
  }, [abierto])

  useEffect(() => {
    itemsRef.current.get(indice)?.scrollIntoView({ block: "nearest" })
  }, [indice, filtrados])

  useEffect(() => {
    const alPresionar = (e: KeyboardEvent) => {
      const esAtajo = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k"
      if (esAtajo) {
        if (abierto) {
          e.preventDefault()
          setAbierto(false)
          return
        }
        const objetivo = e.target as HTMLElement | null
        const etiqueta = objetivo?.tagName
        if (
          etiqueta === "INPUT" ||
          etiqueta === "TEXTAREA" ||
          etiqueta === "SELECT" ||
          objetivo?.isContentEditable
        )
          return
        e.preventDefault()
        setConsulta("")
        setSeleccionado(0)
        setAbierto(true)
        return
      }
      if (e.key === "Escape" && abierto) {
        e.preventDefault()
        setAbierto(false)
      }
    }
    document.addEventListener("keydown", alPresionar)
    return () => document.removeEventListener("keydown", alPresionar)
  }, [abierto])

  const irA = (href: string) => {
    setAbierto(false)
    setConsulta("")
    setSeleccionado(0)
    router.push(href)
  }

  if (!abierto || !user) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto p-4 pt-[12vh]">
      <div className="fixed inset-0 bg-black/60" onClick={() => setAbierto(false)} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Paleta de comandos"
        className="relative z-[60] w-full max-w-lg overflow-hidden rounded-2xl border border-border/60 bg-background shadow-2xl"
      >
        <div className="flex items-center gap-2 border-b border-border/50 px-4">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            ref={entradaRef}
            value={consulta}
            onChange={(e) => { setConsulta(e.target.value); setSeleccionado(0) }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault()
                setSeleccionado((s) => Math.min(s + 1, Math.max(filtrados.length - 1, 0)))
              } else if (e.key === "ArrowUp") {
                e.preventDefault()
                setSeleccionado((s) => Math.max(s - 1, 0))
              } else if (e.key === "Enter") {
                const actual = filtrados[indice]
                if (actual) irA(actual.href)
              }
            }}
            placeholder="Buscar módulos y acciones..."
            aria-label="Buscar módulos y acciones"
            className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className={kbdClass}>ESC</kbd>
        </div>
        <div className="max-h-[50vh] overflow-y-auto p-2">
          {filtrados.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              Sin resultados para &ldquo;{consulta}&rdquo;
            </p>
          ) : (
            <ul role="listbox" aria-label="Resultados" className="space-y-0.5">
              {filtrados.map((comando, i) => (
                <li key={comando.id}>
                  {(i === 0 || filtrados[i - 1].seccion !== comando.seccion) && (
                    <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {comando.seccion}
                    </p>
                  )}
                  <button
                    ref={(el) => {
                      if (el) itemsRef.current.set(i, el)
                    }}
                    type="button"
                    role="option"
                    aria-selected={i === indice}
                    onClick={() => irA(comando.href)}
                    onMouseMove={() => {
                      if (seleccionado !== i) setSeleccionado(i)
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors",
                      i === indice
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-accent"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                        i === indice
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {comando.icono}
                    </span>
                    <span className="min-w-0 flex-1 truncate font-medium">{comando.titulo}</span>
                    <span
                      className={cn(
                        "shrink-0 truncate text-xs",
                        i === indice ? "text-primary-foreground/80" : "text-muted-foreground"
                      )}
                    >
                      {comando.pista}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex items-center gap-3 border-t border-border/50 px-4 py-2.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <kbd className={kbdClass}>↑</kbd>
            <kbd className={kbdClass}>↓</kbd>
            navegar
          </span>
          <span className="flex items-center gap-1">
            <kbd className={kbdClass}>↵</kbd>
            abrir
          </span>
          <span className="ml-auto flex items-center gap-1">
            <kbd className={kbdClass}>esc</kbd>
            cerrar
          </span>
        </div>
      </div>
    </div>
  )
}
