"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import SidebarAdmin, { useSidebarCollapsed } from "@/components/layout/sidebar-admin"
import AdminHeader from "@/components/layout/admin-header"
import CommandPalette from "@/components/admin/command-palette"
import { ToastProvider } from "@/components/ui/toast"
import { BookOpen } from "lucide-react"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed] = useSidebarCollapsed()
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  const isLoginPage = pathname === "/admin/login"

  useEffect(() => {
    if (isLoginPage) return

    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/admin/login")
      } else {
        setAuthenticated(true)
      }
    }
    checkAuth()
  }, [router, supabase, isLoginPage])

  if (isLoginPage) {
    return <ToastProvider>{children}</ToastProvider>
  }

  if (authenticated === null) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!authenticated) return null

  return (
    <ToastProvider>
      <CommandPalette />
      <div className="flex min-h-screen bg-background antialiased">
        <SidebarAdmin open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className={cn(
          "flex min-w-0 flex-1 flex-col transition-[padding] duration-300",
          sidebarCollapsed ? "lg:pl-[68px]" : "lg:pl-64"
        )}>
          <AdminHeader onMenuToggle={() => setSidebarOpen(true)} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto w-full max-w-7xl">{children}</div>
          </main>
        </div>

        {/* Botón flotante de ayuda / manual para funcionarios */}
        <Link
          href="/manual"
          target="_blank"
          rel="noreferrer"
          aria-label="Ayuda al funcionario: Manual del administrador"
          title="Ayuda al funcionario"
          className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-105 active:scale-95 print:hidden"
        >
          <BookOpen className="h-4 w-4" />
          <span className="hidden sm:inline">Ayuda al funcionario</span>
          <span className="sm:hidden">Ayuda</span>
        </Link>
      </div>
    </ToastProvider>
  )
}
