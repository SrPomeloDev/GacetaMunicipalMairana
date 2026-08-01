"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { NAV_LINKS, MAIRANA } from "@/lib/constants"
import { Menu, X, Search, ShieldCheck, PhoneCall, Clock, Lock, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

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
      {/* Top Banner: Bandera de Mairana */}
      <img
        src="/images/mairana-bandera.svg"
        alt="Bandera de Mairana"
        className="h-2 w-full object-cover"
      />
      <div className="bg-orange-50 text-slate-600 text-[11px] py-1 px-4 hidden sm:block border-b border-orange-100">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 font-medium text-orange-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              Gobierno Autónomo Municipal de Mairana
            </span>
            <span className="text-slate-400">•</span>
            <span className="inline-flex items-center gap-1 text-slate-500">
              <Clock className="h-3 w-3" />
              Atención: Lunes a Viernes 08:00 - 16:00
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1 text-slate-600">
              <PhoneCall className="h-3 w-3 text-orange-600" />
              Telf: {MAIRANA.telefono}
            </span>
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1 text-xs text-orange-700 hover:text-orange-900 font-medium transition-colors bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20"
            >
              <Lock className="h-3 w-3" />
              Acceso Funcionarios
            </Link>
          </div>
        </div>
      </div>

      {/* Main Glass Header */}
      <div className="border-b border-primary/15 bg-background/85 backdrop-blur-xl transition-colors shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative h-11 w-11 rounded-xl bg-white p-0.5 shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <img
                src="/images/escudo-mairana.jpg"
                alt="Escudo de Mairana"
                className="h-full w-full rounded-lg object-contain"
              />
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-background" title="Servidor Oficial Activo" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold leading-tight text-foreground group-hover:text-primary transition-colors tracking-tight font-serif">
                Gaceta Municipal
              </span>
              <span className="text-[11px] font-medium leading-tight text-muted-foreground">
                G.A.M. Mairana • Santa Cruz, Bolivia
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 bg-muted/50 p-1 rounded-xl border border-border/50">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href))
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all relative",
                    isActive
                      ? "text-primary-foreground bg-primary shadow-sm shadow-orange-500/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/80"
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Action Tools & Mobile Toggle */}
          <div className="flex items-center gap-2">
            <Link href="/normativa">
              <Button size="sm" variant="outline" className="gap-2 border-orange-500/30 hover:bg-orange-500/10 text-xs font-semibold">
                <Search className="h-3.5 w-3.5 text-primary" />
                <span className="hidden sm:inline">Buscar Ley</span>
                <kbd className="hidden md:inline-block pointer-events-none text-[10px] font-mono px-1 rounded bg-muted text-muted-foreground border">
                  Ctrl+K
                </kbd>
              </Button>
            </Link>

            <Link href="/asistente" className="hidden sm:inline-flex">
              <Button size="sm" className="gap-1.5 text-xs font-semibold shadow-sm shadow-orange-500/25">
                <Sparkles className="h-3.5 w-3.5" />
                <span>IA Asistente</span>
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
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
        <div className="border-b border-border bg-background/95 backdrop-blur-2xl lg:hidden shadow-xl animate-in slide-in-from-top-2 duration-200">
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
                    "flex items-center px-3 py-2.5 text-sm font-semibold rounded-lg transition-colors border",
                    isActive
                      ? "text-primary bg-primary/15 border-primary/30"
                      : "text-muted-foreground hover:text-foreground border-transparent hover:bg-accent"
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

