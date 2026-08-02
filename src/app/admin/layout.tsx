"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import SidebarAdmin from "@/components/layout/sidebar-admin"
import AdminHeader from "@/components/layout/admin-header"
import { ToastProvider } from "@/components/ui/toast"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  const isLoginPage = pathname === "/admin/login"

  useEffect(() => {
    if (isLoginPage) return

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push("/admin/login")
      } else {
        setAuthenticated(true)
      }
    }
    checkAuth()
  }, [router, supabase, isLoginPage])

  if (isLoginPage) {
    return <>{children}</>
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
      <div className="flex min-h-screen bg-background antialiased">
        <SidebarAdmin open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex flex-1 flex-col lg:pl-64">
          <AdminHeader onMenuToggle={() => setSidebarOpen(true)} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  )
}
