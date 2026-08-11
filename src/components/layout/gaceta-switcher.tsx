"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ScrollText, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { isGacetaPath } from "@/lib/constants"

export function GacetaSwitcher() {
  const pathname = usePathname()
  const isGaceta = isGacetaPath(pathname)

  if (isGaceta) {
    return (
      <Link
        href="/"
        aria-label="Ir al Portal Municipal"
        className={cn(
          "fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-5 z-40",
          "flex items-center gap-2 rounded-full px-4 py-3",
          "bg-card border border-primary/30 shadow-lifted text-foreground",
          "text-xs font-bold transition-all duration-200",
          "hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-glow",
          "active:scale-95"
        )}
      >
        <Building2 className="h-4 w-4 shrink-0" />
        <span className="hidden sm:inline">Portal Municipal</span>
      </Link>
    )
  }

  return (
    <Link
      href="/gaceta"
      aria-label="Ir a la Gaceta Oficial"
      className={cn(
        "fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-5 z-40",
        "flex items-center gap-2 rounded-full px-4 py-3",
        "bg-primary text-primary-foreground shadow-md shadow-primary/30",
        "text-xs font-bold transition-all duration-200",
        "hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/40",
        "active:scale-95"
      )}
    >
      <ScrollText className="h-4 w-4 shrink-0" />
      <span className="hidden sm:inline">Gaceta Oficial</span>
    </Link>
  )
}
