"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { NAV_LINKS, MAIRANA } from "@/lib/constants"
import { Menu, X, Search, ShieldCheck, PhoneCall, Clock, Lock, Sparkles, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { toggleTheme } = useTheme()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        if (pathname === "/normativa") {
          document.querySelector<HTMLInputElement>("input[placeholder*='Buscar por título']")?.focus()
        } else {
          router.push("/normativa?buscar=1")
        }
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [pathname, router])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all">
      <div className="bg-primary/5 text-muted-foreground text-[11px] py-1 px-4 hidden sm:block border-b border-primary/10 dark:bg-primary/10">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 font-medium text-primary">
              <ShieldCheck className="h-3.5 w-3.5" />
              Gobierno Autónomo Municipal de Mairana
            </span>
            <span className="text-muted-foreground/50">•</span>
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              Atención: Lunes a Viernes 08:00 - 16:00
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <PhoneCall className="h-3 w-3 text-primary" />
              Telf: {MAIRANA.telefono}
            </span>
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary-foreground font-medium transition-colors bg-primary/10 px-2 py-0.5 rounded border border-primary/20 hover:bg-primary"
            >
              <Lock className="h-3 w-3" />
              Acceso Funcionarios
            </Link>
          </div>
        </div>
      </div>

      {/* Main Glass Header */}
      <div className="liquid-glass shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-3 group">
            <div className="relative h-11 w-11 rounded-xl bg-white p-0.5">
              <img
                src="/images/escudo-mairana.jpg"
                alt="Escudo de Mairana"
                className="h-full w-full rounded-lg object-contain"
              />
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-background" title="Servidor Oficial Activo" />
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-base font-extrabold leading-tight text-foreground group-hover:text-primary transition-colors tracking-tight font-serif">
                Gaceta Municipal
              </span>
              <span className="truncate text-[11px] font-medium leading-tight text-muted-foreground">
                G.A.M. Mairana • Santa Cruz, Bolivia
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-1 bg-white/30 dark:bg-white/5 p-1 rounded-xl border border-white/40 dark:border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href))
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all relative",
                    isActive
                      ? "text-primary-foreground bg-primary shadow-sm shadow-primary/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/80"
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Action Tools & Mobile Toggle */}
          <div className="flex shrink-0 items-center gap-2">
            <Link href="/normativa">
              <Button size="sm" variant="outline" className="gap-2 border-primary/30 hover:bg-primary/10 text-xs font-semibold">
                <Search className="h-3.5 w-3.5 text-primary" />
                <span className="hidden xl:inline">Buscar Ley</span>
                <kbd className="hidden xl:inline-block pointer-events-none text-[10px] font-mono px-1 rounded bg-muted text-muted-foreground border">
                  Ctrl+K
                </kbd>
              </Button>
            </Link>

            <Link href="/asistente" className="hidden xl:inline-flex">
              <Button size="sm" className="gap-1.5 text-xs font-semibold shadow-sm shadow-primary/25">
                <Sparkles className="h-3.5 w-3.5" />
                <span>IA Asistente</span>
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Cambiar tema"
              className="text-muted-foreground hover:text-primary"
            >
              <Sun className="hidden h-5 w-5 dark:block" />
              <Moon className="h-5 w-5 dark:hidden" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="xl:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Abrir menú"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className="liquid-glass xl:hidden shadow-xl">
          <div className="px-4 py-2 border-b bg-muted/40 text-xs text-muted-foreground flex justify-between items-center">
            <span>Gobierno Autónomo Municipal de Mairana</span>
            <Link href="/admin/login" onClick={() => setMobileOpen(false)} className="text-primary font-semibold">
              Acceso Admin
            </Link>
          </div>
          <nav className="grid grid-cols-2 gap-1 p-4">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href))
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center px-3 py-2.5 text-sm font-semibold rounded-lg border shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]",
                    isActive
                      ? "text-primary bg-primary/20 border-primary/40"
                      : "text-muted-foreground hover:text-foreground bg-white/25 dark:bg-white/5 border-white/40 dark:border-white/10 hover:bg-white/40 dark:hover:bg-white/10"
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
          <div className="p-4 pt-0 grid grid-cols-2 gap-2">
            <Link href="/normativa" onClick={() => setMobileOpen(false)}>
              <Button variant="outline" className="w-full justify-center text-xs">
                <Search className="h-3.5 w-3.5 mr-1" /> Normativa
              </Button>
            </Link>
            <Link href="/asistente" onClick={() => setMobileOpen(false)}>
              <Button className="w-full justify-center text-xs">
                <Sparkles className="h-3.5 w-3.5 mr-1" /> Asistente IA
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

