"use client"

import { Badge } from "@/components/ui/badge"
import { formatDate, cn } from "@/lib/utils"
import { Clock, GitCommit, FileSpreadsheet } from "lucide-react"

interface Modificacion {
  id: string
  tipo_modificacion: string
  descripcion: string
  fecha: string
  normativa_modificadora_id?: string | null
}

interface NormativaTimelineProps {
  modificaciones: Modificacion[]
}

const tipoColores: Record<string, string> = {
  modificacion: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  derogacion: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
  suspension: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
  prorroga: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
  actualizacion: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
}

const tipoLabels: Record<string, string> = {
  modificacion: "Modificación Parcial",
  derogacion: "Derogación",
  suspension: "Suspensión Temporal",
  prorroga: "Prórroga",
  actualizacion: "Actualización Reglamentaria",
}

export function NormativaTimeline({ modificaciones }: NormativaTimelineProps) {
  if (!modificaciones || modificaciones.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2 rounded-2xl border border-dashed p-6 text-center">
        <FileSpreadsheet className="h-10 w-10 text-muted-foreground/40" />
        <p className="text-sm font-semibold text-foreground">Sin historial de modificaciones</p>
        <p className="text-xs text-muted-foreground">Esta norma se mantiene en su texto original de promulgación.</p>
      </div>
    )
  }

  return (
    <div className="relative space-y-0 pl-2">
      <div className="absolute left-[19px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-orange-500 via-amber-500 to-slate-400 opacity-30" />
      {modificaciones.map((mod) => (
        <div key={mod.id} className="relative flex gap-5 pb-8 last:pb-0 group">
          <div className="relative z-10 flex-shrink-0 mt-1">
            <div className="h-9 w-9 rounded-full border-2 border-primary bg-background flex items-center justify-center shadow-md shadow-orange-500/10 group-hover:scale-110 transition-transform">
              <GitCommit className="h-4 w-4 text-primary" />
            </div>
          </div>
          <div className="flex-1 min-w-0 pt-1 bg-card/60 p-4 rounded-xl border border-border/70 shadow-2xs backdrop-blur-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <Badge className={cn("px-2.5 py-0.5 text-[11px] font-bold border rounded-full", tipoColores[mod.tipo_modificacion] || "bg-muted text-muted-foreground")}>
                {tipoLabels[mod.tipo_modificacion] || mod.tipo_modificacion}
              </Badge>
              <span className="text-xs font-mono font-semibold text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3 text-primary" />
                {formatDate(mod.fecha)}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-foreground font-medium">{mod.descripcion}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

