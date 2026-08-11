"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { NAV_LINKS, GACETA_NAV, isGacetaPath, MAIRANA } from "@/lib/constants"
import { Menu, X, ShieldCheck, PhoneCall, Clock, Lock, Sparkles, Sun, Moon, ScrollText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { toggleTheme } = useTheme()
  const isGaceta = isGacetaPath(pathname)
  const navLinks = isGaceta ? GACETA_NAV : NAV_LINKS

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        if (pathname === "/gaceta") {
          document.querySelector<HTMLInputElement>("input[placeholder*='Buscar por Ley']")?.focus()
        } else {
          router.push("/gaceta?buscar=1")
        }
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [pathname, router])

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="hidden border-b border-primary/10 bg-[linear-gradient(to_right,color-mix(in_oklab,var(--primary)_8%,transparent),transparent_40%,color-mix(in_oklab,var(--primary)_8%,transparent))] text-muted-foreground sm:block">
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-4 text-[11px] sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 font-medium">
            <span className="inline-flex items-center gap-1.5 text-primary">
              <ShieldCheck className="h-3.5 w-3.5" />
              Gobierno Autónomo Municipal de Mairana
            </span>
            <span className="hidden text-muted-foreground/40 md:inline-flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              Atención: Lunes a Viernes 08:00 - 16:00
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden lg:inline-flex items-center gap-1.5">
              <PhoneCall className="h-3 w-3 text-primary" />
              Telf: {MAIRANA.telefono}
            </span>
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary transition-all hover:bg-primary hover:text-primary-foreground"
            >
              <Lock className="h-3 w-3" />
              Acceso Funcionarios
            </Link>
          </div>
        </div>
      </div>

      <div className="border-b border-border/60 bg-background/90 backdrop-blur-md xl:border-b-0 xl:bg-transparent xl:backdrop-blur-none">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 xl:mt-3 xl:h-14 xl:w-fit xl:max-w-none xl:gap-7 xl:rounded-full xl:border xl:border-border/60 xl:bg-background/80 xl:px-5 xl:shadow-lg xl:backdrop-blur-md">
          <Link href="/" className="group flex min-w-0 items-center gap-3">
            <div className="relative h-11 w-11 shrink-0 rounded-xl bg-white p-0.5 shadow-sm ring-1 ring-border">
              <img
                src="/images/escudo-mairana.jpg"
                alt="Escudo de Mairana"
                className="h-full w-full rounded-lg object-contain"
              />
              <div
                className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background bg-emerald-500"
                title="Servidor Oficial Activo"
              />
            </div>
            <div className="flex min-w-0 flex-col leading-tight">
              <span className="truncate font-serif text-base font-extrabold tracking-tight text-foreground transition-colors group-hover:text-primary">
                Gaceta Municipal
              </span>
              <span className="truncate text-[11px] font-medium text-muted-foreground">
                G.A.M. Mairana • Santa Cruz, Bolivia
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 xl:flex">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href))
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative rounded-xl px-3.5 py-2 text-xs font-semibold transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            {!isGaceta && (
              <Link href="/gaceta" className="hidden xl:inline-flex">
                <Button size="sm" className="gap-1.5 text-xs font-semibold shadow-sm shadow-primary/25">
                  <ScrollText className="h-3.5 w-3.5" />
                  <span>Gaceta Oficial</span>
                </Button>
              </Link>
            )}

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

      {mobileOpen && (
        <div className="liquid-glass xl:hidden shadow-xl">
          <div className="flex items-center justify-between border-b border-border/50 bg-muted/40 px-4 py-2.5 text-xs">
            <span className="font-medium text-muted-foreground">Gobierno Autónomo Municipal de Mairana</span>
            <Link
              href="/admin/login"
              onClick={() => setMobileOpen(false)}
              className="inline-flex items-center gap-1 font-semibold text-primary"
            >
              <Lock className="h-3 w-3" />
              Acceso Admin
            </Link>
          </div>
          <nav className="grid grid-cols-2 gap-1.5 p-4">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href))
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center rounded-xl border px-3 py-2.5 text-sm font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]",
                    isActive
                      ? "border-primary/40 bg-primary text-primary-foreground"
                      : "border-white/40 bg-white/25 text-muted-foreground hover:bg-white/40 hover:text-foreground dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
          {!isGaceta && (
            <div className="grid grid-cols-2 gap-2 p-4 pt-0">
              <Link href="/gaceta" onClick={() => setMobileOpen(false)}>
                <Button className="w-full justify-center text-xs">
                  <ScrollText className="h-3.5 w-3.5" /> Gaceta Oficial
                </Button>
              </Link>
              <Link href="/asistente" onClick={() => setMobileOpen(false)}>
                <Button className="w-full justify-center text-xs">
                  <Sparkles className="h-3.5 w-3.5" /> Asistente IA
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}