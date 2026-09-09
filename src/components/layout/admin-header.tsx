"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button, buttonVariants } from "@/components/ui/button"
import { IconBox } from "@/components/ui/icon-box"
import { useCurrentUser, rolLabel } from "@/hooks/use-current-user"
import { useTheme } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { Bell, ChevronRight, ExternalLink, Menu, Sun, Moon } from "@/lib/icons"

const breadcrumbLabels: Record<string, string> = {
  dashboard: "Panel de Control",
  normativa: "Normativa",
  noticias: "Noticias",
  autoridades: "Autoridades",
  transparencia: "Transparencia",
  tramites: "Trámites",
  galeria: "Galería",
  usuarios: "Usuarios",
  configuracion: "Configuración",
  dependencias: "Dependencias",
  categorias: "Categorías",
  concejo: "Concejo",
  suscripciones: "Suscripciones",
  contrataciones: "Contrataciones",
  mensajes: "Mensajes",
  perfil: "Mi Perfil",
  nueva: "Nueva",
  editar: "Editar",
}

const UUID_RE = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/

function segmentLabel(seg: string, isLast: boolean): string {
  if (UUID_RE.test(seg)) return "Editar"
  if (seg === "nueva" && isLast) return "Nuevo"
  return breadcrumbLabels[seg] || seg
}

export default function AdminHeader({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)
  const { user } = useCurrentUser()
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="glass-bar sticky top-0 z-20 flex h-16 items-center gap-4 px-4 sm:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuToggle} aria-label="Abrir menú de administración">
        <Menu className="h-5 w-5" />
      </Button>

      <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto whitespace-nowrap text-sm text-muted-foreground [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Link href="/admin/dashboard" className="shrink-0 rounded-md px-1.5 py-0.5 transition-colors hover:bg-muted/60 hover:text-foreground">
          Panel
        </Link>
        {segments.slice(1).map((seg, i) => {
          const href = "/" + segments.slice(0, i + 2).join("/")
          const isLast = i === segments.length - 2
          const label = segmentLabel(seg, isLast)
          return (
            <span key={seg} className="flex shrink-0 items-center gap-1">
              <ChevronRight className="h-3.5 w-3.5 shrink-0" />
              {isLast ? (
                <span className="max-w-[50vw] truncate rounded-md px-1.5 py-0.5 font-semibold text-foreground">{label}</span>
              ) : (
                <Link href={href} className="max-w-[50vw] truncate rounded-md px-1.5 py-0.5 transition-colors hover:bg-muted/60 hover:text-foreground">
                  {label}
                </Link>
              )}
            </span>
          )
        })}
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <div className="hidden items-center gap-1 rounded-full border border-border bg-muted/40 px-3 py-1 text-[11px] font-medium text-muted-foreground md:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Sistema en línea
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          className="text-muted-foreground hover:text-primary [&_svg]:transition-transform [&_svg]:duration-500 hover:[&_svg]:rotate-90"
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        <Link
          href="/"
          target="_blank"
          rel="noreferrer"
          aria-label="Ver sitio"
          className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "text-muted-foreground")}
        >
          <ExternalLink className="h-5 w-5" />
        </Link>
        <Button variant="ghost" size="icon" className="relative text-muted-foreground" aria-label="Notificaciones">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
        </Button>
        <Link href="/admin/perfil" className="group flex items-center gap-2 border-l pl-3">
          {user?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatar_url}
              alt="Mi perfil"
              className="h-8 w-8 rounded-full object-cover ring-2 ring-primary/30"
            />
          ) : (
            <IconBox size="sm" shape="full" className="text-xs font-bold shadow-sm shadow-primary/25">
              {(user?.nombre || "U").charAt(0).toUpperCase()}
            </IconBox>
          )}
          <div className="hidden sm:block">
            <p className="max-w-40 truncate text-sm font-medium leading-tight text-foreground transition-colors group-hover:text-primary">{user?.nombre || "Usuario"}</p>
            <p className="text-[11px] text-muted-foreground">{user ? rolLabel(user.rol) : ""}</p>
          </div>
        </Link>
      </div>
    </header>
  )
}
