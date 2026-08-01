"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Bell, ChevronRight, Menu } from "lucide-react"

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
  nueva: "Nueva",
  editar: "Editar",
}

export default function AdminHeader({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

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
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            3
          </span>
        </Button>
        <div className="flex items-center gap-2 pl-2 border-l">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
            A
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium leading-tight">Administrador</p>
          </div>
        </div>
      </div>
    </header>
  )
}
