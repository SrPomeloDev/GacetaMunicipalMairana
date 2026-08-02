"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getEstadoColor, getEstadoLabel, formatDate, cn } from "@/lib/utils"
import { FileText, Calendar, ArrowRight } from "lucide-react"

interface NormativaCardProps {
  normativa: {
    numero: string
    titulo: string
    slug: string
    estado: string
    categoria?: { nombre: string } | null
    fecha_publicacion: string
    resumen?: string | null
    archivo_pdf?: string | null
  }
}

export function NormativaCard({ normativa }: NormativaCardProps) {
  const isVigente = normativa.estado?.toLowerCase() === "vigente"

  return (
    <Card className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-primary/40 flex flex-col justify-between">
      {/* Top Left Accent Line */}
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-1.5 transition-colors",
          isVigente ? "bg-emerald-500" : "bg-amber-500"
        )}
      />

      <div className="pl-2">
        {/* Header Metadata: Status + Category */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Badge className={cn("px-2.5 py-0.5 text-[11px] font-bold border rounded-full gap-1.5 shadow-2xs", getEstadoColor(normativa.estado))}>
              <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse", isVigente ? "bg-emerald-500" : "bg-amber-500")} />
              {getEstadoLabel(normativa.estado)}
            </Badge>

            {normativa.categoria && (
              <span className="inline-flex items-center gap-1 rounded-md bg-muted/80 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground border">
                <FileText className="h-3 w-3 text-primary" />
                {normativa.categoria.nombre}
              </span>
            )}
          </div>

          <span className="text-[11px] font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
            {normativa.numero}
          </span>
        </div>

        {/* Title */}
        <Link
          href={`/normativa/${normativa.slug}`}
          className="block text-base font-bold font-serif leading-snug text-card-foreground group-hover:text-primary transition-colors line-clamp-2"
        >
          {normativa.titulo}
        </Link>

        {/* Abstract */}
        {normativa.resumen && (
          <p className="text-xs text-muted-foreground mt-2 line-clamp-3 leading-relaxed">
            {normativa.resumen}
          </p>
        )}
      </div>

      {/* Footer Meta & Actions */}
      <div className="mt-5 pl-2 pt-4 border-t border-border/40 flex items-center justify-between gap-3 text-xs">
        <span className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
          <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
          {formatDate(normativa.fecha_publicacion)}
        </span>

        <div className="flex items-center gap-2">
          <Link
            href={`/normativa/${normativa.slug}`}
            className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
          >
            <span>Ver Texto</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </Card>
  )
}

