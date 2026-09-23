"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { NAV_LINKS, isGacetaPath, MAIRANA, telHref, whatsappUrl } from "@/lib/constants"
import { Menu, X, ShieldCheck, Phone, Clock, Lock, Sun, Moon, ScrollText, MessageCircle, Headset, TextAa, WhatsApp } from "@/lib/icons"
import { Button } from "@/components/ui/button"
import { StorageImage } from "@/components/ui/storage-image"
import { useTheme } from "@/components/theme-provider"
import { useAccessibility } from "@/components/accesibilidad/accessibility-provider"
import type { Configuracion } from "@/types"

type HeaderConfig = Pick<Configuracion, "telefono" | "whatsapp" | "horario" | "logo_url"> | null

export default function Header({ config }: { config?: HeaderConfig }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const router = useRouter()
  const { toggleTheme } = useTheme()
  const { senior, toggleSenior } = useAccessibility()
  const isGaceta = isGacetaPath(pathname)

  const telefono = config?.telefono || MAIRANA.telefono
  const horario = config?.horario || "Lun a Vie 08:00 - 16:00"
  const telLink = telHref(config?.telefono)
  const waLink = whatsappUrl(config?.whatsapp)

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

  useEffect(() => {
    if (!mobileOpen) return
    const previousActive = document.activeElement as HTMLElement | null
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false)
        return
      }
      if (e.key !== "Tab") return
      const panel = mobileMenuRef.current
      if (!panel) return
      const focusables = Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      )
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first || !panel.contains(document.activeElement)) {
          e.preventDefault()
          last.focus()
        }
      } else if (document.activeElement === last || !panel.contains(document.activeElement)) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener("keydown", handler)
    return () => {
      document.removeEventListener("keydown", handler)
      previousActive?.focus?.()
    }
  }, [mobileOpen])

  useEffect(() => {
    if (!mobileOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [mobileOpen])

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
              Atención: {horario}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden lg:inline-flex items-center gap-1.5">
              <Phone className="h-3 w-3 text-primary" />
              {telLink ? (
                <a href={telLink} className="transition-colors hover:text-primary hover:underline">
                  Telf: {telefono}
                </a>
              ) : (
                <span>Telf: {telefono}</span>
              )}
            </span>
            {waLink && (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full p-1 text-current transition-all hover:text-[#25D366]"
                aria-label="Escribinos por WhatsApp"
                title="Escribinos por WhatsApp"
              >
                <WhatsApp className="h-3.5 w-3.5" />
              </a>
            )}
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1.5 rounded-full border border-primary bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground transition-all hover:opacity-90"
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
            {config?.logo_url ? (
              <StorageImage
                src={config.logo_url}
                alt="Logo del Municipio"
                width={56}
                height={56}
                className="h-12 w-auto max-w-[140px] shrink-0 object-contain sm:h-14"
              />
            ) : (
              <Image
                src="/images/mairana-corazon-valles.png"
                alt="Mairana, Corazón de los Valles"
                width={1405}
                height={1037}
                className="h-12 w-auto shrink-0 object-contain sm:h-14"
              />
            )}
            <div className="flex min-w-0 flex-col leading-tight">
              <span className="truncate font-serif text-base font-extrabold tracking-tight text-foreground transition-colors group-hover:text-primary">
                Gaceta Municipal
              </span>
              <span className="truncate text-[11px] font-medium text-muted-foreground">
                {isGaceta
                  ? "Publicación oficial • G.A.M. Mairana"
                  : "Web del G.A.M. Mairana"}
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 xl:flex">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href))
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground after:absolute after:bottom-1 after:left-3.5 after:right-3.5 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-primary after:transition-transform after:duration-200 hover:after:scale-x-100"
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <Link href="/gaceta" className="hidden xl:inline-flex">
              <Button size="sm" className="gap-1.5 text-xs font-semibold shadow-sm shadow-primary/25">
                <ScrollText className="h-3.5 w-3.5" />
                <span>Gaceta Oficial</span>
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Cambiar tema"
              className="text-muted-foreground hover:text-primary [&_svg]:transition-transform [&_svg]:duration-500 hover:[&_svg]:rotate-90"
            >
              <Sun className="hidden h-5 w-5 transition-transform duration-500 hover:rotate-90 dark:block" />
              <Moon className="h-5 w-5 transition-transform duration-500 hover:-rotate-90 dark:hidden" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSenior}
              aria-label={senior ? "Restablecer tamaño de letra" : "Aumentar tamaño de letra"}
              aria-pressed={senior}
              title={senior ? "Restablecer tamaño de letra" : "Aumentar tamaño de letra"}
              className={cn(
                "text-muted-foreground hover:text-primary",
                senior && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
              )}
            >
              <TextAa className="h-5 w-5" />
            </Button>

            <Link
              href="/ayuda"
              aria-label="Ayuda"
              title="Ayuda"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
            >
              <Headset className="h-5 w-5" />
            </Link>

            <Button
              variant="ghost"
              size="icon"
              className="xl:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Abrir menú"
              aria-expanded={mobileOpen}
              aria-controls="menu-movil"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div id="menu-movil" ref={mobileMenuRef} tabIndex={-1} className="liquid-glass xl:hidden max-h-[calc(100dvh-5rem)] overflow-y-auto shadow-xl outline-none">
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
          <div className="p-4 pb-0">
            <button
              type="button"
              onClick={toggleSenior}
              aria-pressed={senior}
              aria-label={senior ? "Restablecer tamaño de letra" : "Aumentar tamaño de letra"}
              className={cn(
                "inline-flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold",
                senior
                  ? "border-primary/40 bg-primary text-primary-foreground"
                  : "border-primary/30 bg-primary/10 text-foreground"
              )}
            >
              <TextAa className="h-6 w-6" />
              <span className="sr-only">{senior ? "Restablecer tamaño de letra" : "Aumentar tamaño de letra"}</span>
            </button>
          </div>
          <nav className="grid grid-cols-2 gap-1.5 p-4">
            {NAV_LINKS.map((link) => {
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
          <div className="grid grid-cols-2 gap-2 p-4 pt-0">
            <Link href="/gaceta" onClick={() => setMobileOpen(false)}>
              <Button className="w-full justify-center text-xs">
                <ScrollText className="h-3.5 w-3.5" /> Gaceta Oficial
              </Button>
            </Link>
            <Link href="/asistente" onClick={() => setMobileOpen(false)}>
              <Button variant="outline" className="w-full justify-center text-xs">
                <MessageCircle className="h-3.5 w-3.5" /> Consulta
              </Button>
            </Link>
          </div>
          <div className="px-4 pb-4 text-center">
            <Link
              href="/ayuda"
              onClick={() => setMobileOpen(false)}
              className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
            >
              ¿Necesitás ayuda?
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 border-t border-border/50 px-4 py-3">
            {telLink && (
              <a href={telLink} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:text-primary">
                <Phone className="h-3.5 w-3.5" />
                {telefono}
              </a>
            )}
            {waLink && (
              <a href={waLink} target="_blank" rel="noopener noreferrer" aria-label="Escribinos por WhatsApp" title="Escribinos por WhatsApp" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 bg-background text-foreground transition-colors hover:border-[#25D366] hover:text-[#25D366]">
                <WhatsApp className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
