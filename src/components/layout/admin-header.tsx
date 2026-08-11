"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useCurrentUser, rolLabel } from "@/hooks/use-current-user"
import { useTheme } from "@/components/theme-provider"
import { Bell, ChevronRight, Menu, Sun, Moon } from "lucide-react"

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

      <nav className="flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/admin/dashboard" className="rounded-md px-1.5 py-0.5 transition-colors hover:bg-muted/60 hover:text-foreground">
          Panel
        </Link>
        {segments.slice(1).map((seg, i) => {
          const href = "/" + segments.slice(0, i + 2).join("/")
          const label = breadcrumbLabels[seg] || seg
          const isLast = i === segments.length - 2
          return (
            <span key={seg} className="flex items-center gap-1">
              <ChevronRight className="h-3.5 w-3.5" />
              {isLast ? (
                <span className="rounded-md px-1.5 py-0.5 font-semibold text-foreground">{label}</span>
              ) : (
                <Link href={href} className="rounded-md px-1.5 py-0.5 transition-colors hover:bg-muted/60 hover:text-foreground">
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
          className="text-muted-foreground hover:text-primary"
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
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
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-sm shadow-primary/25">
              {(user?.nombre || "U").charAt(0).toUpperCase()}
            </div>
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
