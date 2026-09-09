"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { ADMIN_NAV, DEV_CREDIT } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { IconBox } from "@/components/ui/icon-box"
import { createClient } from "@/lib/supabase/client"
import { useCurrentUser, rolLabel } from "@/hooks/use-current-user"
import { canView } from "@/hooks/use-current-user"
import {
  PanelLeftClose, PanelLeft, LogOut, X,
  LayoutDashboard, FileText, Newspaper, Users, Shield,
  ClipboardList, Image as ImageIcon, UserCog, Settings, Code2,
  Building2, Tags, Landmark, Gavel, Mail, Inbox, ExternalLink
} from "lucide-react"

const iconMap: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="h-5 w-5" />,
  FileText: <FileText className="h-5 w-5" />,
  Newspaper: <Newspaper className="h-5 w-5" />,
  Users: <Users className="h-5 w-5" />,
  Shield: <Shield className="h-5 w-5" />,
  ClipboardList: <ClipboardList className="h-5 w-5" />,
  Image: <ImageIcon className="h-5 w-5" />,
  UserCog: <UserCog className="h-5 w-5" />,
  Settings: <Settings className="h-5 w-5" />,
  Building2: <Building2 className="h-5 w-5" />,
  Tags: <Tags className="h-5 w-5" />,
  Landmark: <Landmark className="h-5 w-5" />,
  Gavel: <Gavel className="h-5 w-5" />,
  Mail: <Mail className="h-5 w-5" />,
  Inbox: <Inbox className="h-5 w-5" />,
}

export default function SidebarAdmin({ open = false, onClose }: { open?: boolean; onClose?: () => void }) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { user } = useCurrentUser()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const client = createClient()
        const { count, error } = await client
          .from("contacto_mensajes")
          .select("id", { count: "exact", head: true })
          .eq("leido", false)
        if (!error && typeof count === "number") setUnreadCount(count)
      } catch {
        setUnreadCount(0)
      }
    }
    fetchUnread()
  }, [])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = ""
      }
    }
  }, [open])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/admin/login")
  }

  const sidebarContent = (
    <div className={cn(
      "flex h-full flex-col liquid-glass border-r border-sidebar-border transition-all duration-300",
      collapsed ? "w-[68px]" : "w-64"
    )}>
      <div className={cn(
        "flex h-16 shrink-0 items-center border-b border-sidebar-border px-4",
        collapsed ? "justify-center" : "justify-between"
      )}>
        {!collapsed && (
          <Link href="/admin/dashboard" className="flex items-center gap-2.5" onClick={onClose}>
            <Image
              src="/images/escudo-mairana.jpg"
              alt="Escudo de Mairana"
              width={36}
              height={36}
              className="h-9 w-9 rounded-lg bg-white object-contain p-0.5 shadow-sm ring-1 ring-border"
            />
            <div className="min-w-0 leading-tight">
              <span className="block text-sm font-semibold text-sidebar-foreground">Administración</span>
              <span className="block text-[10px] text-muted-foreground">G.A.M. Mairana</span>
            </div>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          className="text-sidebar-foreground lg:hidden"
          aria-label="Cerrar menú"
        >
          <X className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex text-sidebar-foreground"
          aria-label="Contraer menú"
        >
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-2.5">
        {ADMIN_NAV.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          if (item.href !== "/admin/dashboard" && !canView(user, item.modulo)) return null
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                collapsed && "justify-center px-2",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
              title={collapsed ? item.label : undefined}
            >
              {isActive && !collapsed && (
                <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary-foreground/70" aria-hidden />
              )}
              <span className={cn("shrink-0 transition-all", !isActive && "text-muted-foreground group-hover:text-primary")}>
                {iconMap[item.icon]}
              </span>
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && item.href === "/admin/mensajes" && unreadCount > 0 && (
                <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
                  {unreadCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="shrink-0 border-t border-sidebar-border p-2.5">
        <Link
          href="/"
          target="_blank"
          rel="noreferrer"
          onClick={onClose}
          title={collapsed ? "Ver sitio" : undefined}
          className={cn(
            "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
            collapsed && "justify-center px-2",
            "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          )}
        >
          <span className="shrink-0 text-muted-foreground transition-all group-hover:text-primary">
            <ExternalLink className="h-5 w-5" />
          </span>
          {!collapsed && <span>Ver sitio</span>}
        </Link>
      </div>

      <div className={cn(
        "shrink-0 border-t border-sidebar-border p-3",
        collapsed && "flex flex-col items-center"
      )}>
        <div className={cn("flex items-center gap-3 rounded-xl bg-muted/40 p-2", collapsed && "flex-col bg-transparent p-0")}>
          <Link href="/admin/perfil" className="shrink-0">
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
          </Link>
          {!collapsed && (
            <Link href="/admin/perfil" className="group min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-sidebar-foreground transition-colors group-hover:text-primary">{user?.nombre || "Usuario"}</p>
              <p className="truncate text-xs text-muted-foreground">{user ? rolLabel(user.rol) : ""}</p>
            </Link>
          )}
        </div>
        {!collapsed && (
          <Button variant="ghost" size="sm" onClick={handleLogout} className="mt-2 w-full justify-start text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar Sesión
          </Button>
        )}
        {collapsed && (
          <Button variant="ghost" size="icon" onClick={handleLogout} className="mt-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
            <LogOut className="h-4 w-4" />
          </Button>
        )}
      </div>

      {DEV_CREDIT.visible && (
        <div className="shrink-0 border-t border-sidebar-border px-3 py-3">
          <div className={cn("flex items-center gap-2", collapsed && "justify-center")}>
            <Code2 className={cn("h-4 w-4 shrink-0 text-primary", collapsed && "h-5 w-5")} />
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-sidebar-foreground">{DEV_CREDIT.nombre}</p>
                <p className="truncate text-[11px] text-muted-foreground">
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

      {/* Drawer móvil */}
      <div
        className={cn(
          "fixed inset-0 z-40 lg:hidden",
          open ? "pointer-events-auto" : "pointer-events-none hidden"
        )}
        aria-hidden={!open}
      >
        <div
          className={cn(
            "fixed inset-0 bg-black/50 transition-opacity duration-300",
            open ? "opacity-100" : "opacity-0"
          )}
          onClick={onClose}
        />
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] transition-transform duration-300 ease-in-out",
            open ? "translate-x-0" : "-translate-x-full",
            "shadow-2xl"
          )}
        >
          {sidebarContent}
        </aside>
      </div>
    </>
  )
}
