"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { ADMIN_NAV, SITE_NAME, DEV_CREDIT } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useCurrentUser, rolLabel } from "@/hooks/use-current-user"
import {
  PanelLeftClose, PanelLeft, LogOut, User,
  LayoutDashboard, FileText, Newspaper, Users, Shield,
  ClipboardList, Image, UserCog, Settings, ChevronLeft, Code2
} from "lucide-react"

const iconMap: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="h-5 w-5" />,
  FileText: <FileText className="h-5 w-5" />,
  Newspaper: <Newspaper className="h-5 w-5" />,
  Users: <Users className="h-5 w-5" />,
  Shield: <Shield className="h-5 w-5" />,
  ClipboardList: <ClipboardList className="h-5 w-5" />,
  Image: <Image className="h-5 w-5" />,
  UserCog: <UserCog className="h-5 w-5" />,
  Settings: <Settings className="h-5 w-5" />,
}

export default function SidebarAdmin() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { user } = useCurrentUser()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/admin/login")
  }

  const sidebarContent = (
    <div className={cn(
      "flex h-full flex-col liquid-glass border-r border-sidebar-border transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className={cn(
        "flex h-16 items-center border-b border-sidebar-border px-4",
        collapsed ? "justify-center" : "justify-between"
      )}>
        {!collapsed && (
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <img
              src="/images/escudo-mairana.jpg"
              alt="Escudo de Mairana"
              className="h-9 w-9 rounded-lg bg-white object-contain p-0.5"
            />
            <span className="text-sm font-semibold text-sidebar-foreground">Administración</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex text-sidebar-foreground"
        >
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {ADMIN_NAV.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                collapsed && "justify-center px-2",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
              title={collapsed ? item.label : undefined}
            >
              <span className="shrink-0">{iconMap[item.icon]}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      <div className={cn(
        "border-t border-sidebar-border p-3",
        collapsed && "flex flex-col items-center"
      )}>
        <div className={cn("flex items-center gap-3", collapsed && "flex-col")}>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
            {(user?.nombre || "U").charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.nombre || "Usuario"}</p>
              <p className="text-xs text-muted-foreground truncate">{user ? rolLabel(user.rol) : ""}</p>
            </div>
          )}
        </div>
        {!collapsed && (
          <Button variant="ghost" size="sm" onClick={handleLogout} className="mt-2 w-full justify-start text-muted-foreground hover:text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar Sesión
          </Button>
        )}
        {collapsed && (
          <Button variant="ghost" size="icon" onClick={handleLogout} className="mt-2 text-muted-foreground hover:text-destructive">
            <LogOut className="h-4 w-4" />
          </Button>
        )}
      </div>

      {DEV_CREDIT.visible && (
        <div className="border-t border-sidebar-border px-3 py-3">
          <div className={cn("flex items-center gap-2", collapsed && "justify-center")}>
            <Code2 className={cn("h-4 w-4 text-primary shrink-0", collapsed && "h-5 w-5")} />
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-xs font-semibold text-sidebar-foreground truncate">{DEV_CREDIT.nombre}</p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {DEV_CREDIT.rol} • CI {DEV_CREDIT.ci}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <>
      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-30 lg:flex lg:flex-col">
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="fixed inset-y-0 left-0 z-50 w-64">
            {sidebarContent}
          </aside>
        </div>
      )}

      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg lg:hidden"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
    </>
  )
}
