"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useCurrentUser } from "@/hooks/use-current-user"
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
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuToggle}>
        <Menu className="h-5 w-5" />
      </Button>

      <nav className="flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/admin/dashboard" className="hover:text-foreground transition-colors">
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
                <span className="font-medium text-foreground">{label}</span>
              ) : (
                <Link href={href} className="hover:text-foreground transition-colors">
                  {label}
                </Link>
              )}
            </span>
          )
        })}
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          className="text-muted-foreground hover:text-primary"
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Bell className="h-5 w-5" />
        </Button>
        <Link href="/admin/perfil" className="flex items-center gap-2 pl-2 border-l group">
          {user?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatar_url}
              alt="Mi perfil"
              className="h-8 w-8 rounded-full object-cover ring-2 ring-primary/30"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
              {(user?.nombre || "U").charAt(0).toUpperCase()}
            </div>
          )}
          <div className="hidden sm:block">
            <p className="text-sm font-medium leading-tight truncate max-w-40 group-hover:text-primary transition-colors">{user?.nombre || "Usuario"}</p>
          </div>
        </Link>
      </div>
    </header>
  )
}
