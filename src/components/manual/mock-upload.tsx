"use client"

import * as React from "react"
import { Upload, Loader2, AlertTriangle, FileText, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type EstadoMockUpload = "reposo" | "subiendo" | "cargado" | "error"

export interface MockUploadProps {
  estadoInicial?: EstadoMockUpload
  tipoError?: "TAMANO_EXCEDIDO" | "CUOTA_LLENA"
  permitirAlternar?: boolean
}

export function MockUpload({
  estadoInicial = "reposo",
  tipoError = "TAMANO_EXCEDIDO",
  permitirAlternar = true,
}: MockUploadProps) {
  const [estado, setEstado] = React.useState<EstadoMockUpload>(estadoInicial)
  const [errorActual, setErrorActual] = React.useState<"TAMANO_EXCEDIDO" | "CUOTA_LLENA">(tipoError)
  const [progreso, setProgreso] = React.useState(68)

  React.useEffect(() => {
    let timer: NodeJS.Timeout
    if (estado === "subiendo") {
      timer = setInterval(() => {
        setProgreso((prev) => (prev >= 95 ? 45 : prev + 12))
      }, 700)
    }
    return () => clearInterval(timer)
  }, [estado])

  return (
    <>
    <div className="print:hidden">
    <div className="space-y-4 rounded-xl border border-border/80 bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">
            Cómo se ve la carga de archivos
          </span>
          <Badge variant="soft-warning">Demostración</Badge>
        </div>

        {permitirAlternar && (
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-muted-foreground mr-1">Probar estado:</span>
            <Button
              variant={estado === "reposo" ? "default" : "outline"}
              size="sm"
              className="h-7 px-2.5 text-xs"
              onClick={() => setEstado("reposo")}
            >
              1. En Reposo
            </Button>
            <Button
              variant={estado === "subiendo" ? "default" : "outline"}
              size="sm"
              className="h-7 px-2.5 text-xs"
              onClick={() => {
                setEstado("subiendo")
                setProgreso(45)
              }}
            >
              2. Subiendo
            </Button>
            <Button
              variant={estado === "cargado" ? "default" : "outline"}
              size="sm"
              className="h-7 px-2.5 text-xs"
              onClick={() => setEstado("cargado")}
            >
              3. Con Archivo
            </Button>
            <Button
              variant={estado === "error" ? "destructive" : "outline"}
              size="sm"
              className="h-7 px-2.5 text-xs"
              onClick={() => setEstado("error")}
            >
              Aviso de Error
            </Button>
          </div>
        )}
      </div>

      {estado === "cargado" && (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-3">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-background border border-border/60">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              EJ-decreto-edil-014-2026.pdf
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>PDF oficial · 2.1 MB</span>
              <span>·</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                Archivo guardado
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setEstado("reposo")}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            aria-label="Quitar archivo de ejemplo"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )}

      {estado === "subiendo" && (
        <div className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/40 bg-muted/20 px-4 py-8 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-sm font-medium text-foreground">
            Subiendo archivo… {progreso}%
          </span>
          <div className="h-1.5 w-48 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progreso}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">
            Optimizando y guardando…
          </span>
        </div>
      )}

      {estado === "reposo" && (
        <button
          type="button"
          onClick={() => {
            setEstado("subiendo")
            setTimeout(() => setEstado("cargado"), 1800)
          }}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/20 px-4 py-8 text-center transition-colors",
            "hover:border-primary/60 hover:bg-muted/40 cursor-pointer"
          )}
        >
          <Upload className="h-6 w-6 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">
            Haga clic para seleccionar o arrastre un documento
          </span>
          <span className="text-xs text-muted-foreground">
            PDF · máx 4 MB · Documento oficial escaneado
          </span>
        </button>
      )}

      {estado === "error" && (
        <div className="space-y-3">
          <div className="flex gap-2 text-xs">
            <button
              type="button"
              className={cn(
                "rounded px-2 py-1 font-medium border",
                errorActual === "TAMANO_EXCEDIDO" ? "bg-muted border-primary/50 text-foreground" : "border-border text-muted-foreground"
              )}
              onClick={() => setErrorActual("TAMANO_EXCEDIDO")}
            >
              Archivo muy pesado
            </button>
            <button
              type="button"
              className={cn(
                "rounded px-2 py-1 font-medium border",
                errorActual === "CUOTA_LLENA" ? "bg-muted border-primary/50 text-foreground" : "border-border text-muted-foreground"
              )}
              onClick={() => setErrorActual("CUOTA_LLENA")}
            >
              Sin espacio
            </button>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-600 dark:text-yellow-400" />
            <div className="min-w-0 space-y-1">
              <p className="font-medium text-yellow-800 dark:text-yellow-200">
                {errorActual === "TAMANO_EXCEDIDO"
                  ? "El archivo pesa 6.4 MB y el máximo es 4 MB"
                  : "El portal se quedó sin espacio de almacenamiento"}
              </p>
              <p className="text-yellow-700/90 dark:text-yellow-300/90 text-xs leading-relaxed">
                {errorActual === "TAMANO_EXCEDIDO"
                  ? "Los documentos PDF no se achican solos. Escanee en calidad estándar o divida el archivo antes de subirlo."
                  : "El portal se quedó sin espacio. Avise al encargado de sistemas para liberar lugar."}
              </p>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        El portal guarda sus archivos de forma segura y los optimiza cuando es posible.
      </p>
    </div>
    </div>

    <div className="hidden print:block space-y-4 rounded-xl border border-border/80 bg-card p-5">
      <p className="text-sm font-semibold text-foreground">Cómo se ve la carga de archivos (los cuatro momentos)</p>

      <div className="space-y-1.5">
        <p className="text-xs font-semibold text-foreground">1. En reposo: zona de carga</p>
        <div className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border px-4 py-6 text-center">
          <Upload className="h-6 w-6 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Haga clic para seleccionar o arrastre un documento</span>
          <span className="text-xs text-muted-foreground">PDF · máx 4 MB · Documento oficial escaneado</span>
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="text-xs font-semibold text-foreground">2. Subiendo el archivo</p>
        <div className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/40 px-4 py-6 text-center">
          <Loader2 className="h-6 w-6 text-primary" />
          <span className="text-sm font-medium text-foreground">Subiendo archivo… 68%</span>
          <div className="h-1.5 w-48 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: "68%" }} />
          </div>
          <span className="text-xs text-muted-foreground">Optimizando y guardando…</span>
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="text-xs font-semibold text-foreground">3. Archivo cargado</p>
        <div className="flex items-center gap-3 rounded-xl border border-border p-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border/60">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">EJ-decreto-edil-014-2026.pdf</p>
            <p className="text-xs text-muted-foreground">PDF oficial · 2.1 MB · Archivo guardado</p>
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="text-xs font-semibold text-foreground">4. Avisos de error y qué hacer</p>
        <div className="space-y-2">
          <div className="flex items-start gap-3 rounded-xl border border-yellow-500/30 px-4 py-3 text-sm">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-600" />
            <div className="space-y-1">
              <p className="font-medium text-yellow-800">El archivo pesa 6.4 MB y el máximo es 4 MB</p>
              <p className="text-xs leading-relaxed text-yellow-700">Los documentos PDF no se achican solos. Escanee en calidad estándar o divida el archivo antes de subirlo.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-yellow-500/30 px-4 py-3 text-sm">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-600" />
            <div className="space-y-1">
              <p className="font-medium text-yellow-800">El portal se quedó sin espacio de almacenamiento</p>
              <p className="text-xs leading-relaxed text-yellow-700">El portal se quedó sin espacio. Avise al encargado de sistemas para liberar lugar.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
