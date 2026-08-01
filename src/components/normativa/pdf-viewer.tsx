"use client"

import { FileText, Download, ExternalLink, ShieldCheck } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"

interface PdfViewerProps {
  url?: string | null
  titulo: string
}

export function PdfViewer({ url, titulo }: PdfViewerProps) {
  if (!url) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] bg-muted/30 rounded-2xl border-2 border-dashed border-border p-8 text-center space-y-3">
        <div className="h-16 w-16 rounded-2xl bg-orange-500/10 flex items-center justify-center text-primary">
          <FileText className="h-8 w-8" />
        </div>
        <h4 className="text-base font-bold font-serif text-foreground">Documento digital en proceso de digitalización</h4>
        <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
          El texto completo de <span className="font-semibold">{titulo}</span> se encuentra resguardado en el Archivo Físico de la Gaceta Municipal.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-muted/60 rounded-xl border border-border/80 text-xs">
        <div className="flex items-center gap-2 text-foreground font-semibold">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>Documento Oficial de la Gaceta Municipal</span>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "outline", size: "sm", className: "gap-1.5 text-xs font-semibold" })}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Abrir Visor</span>
          </a>

          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            download
            className={buttonVariants({ size: "sm", className: "gap-1.5 text-xs font-bold shadow-xs" })}
          >
            <Download className="h-3.5 w-3.5" />
            <span>Descargar PDF</span>
          </a>
        </div>
      </div>

      {/* PDF Container */}
      <div className="relative overflow-hidden rounded-2xl border border-border shadow-sm bg-muted">
        <iframe
          src={`${url}#toolbar=1`}
          title={titulo}
          className="w-full h-[650px] border-0"
        />
      </div>
    </div>
  )
}

