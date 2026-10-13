import { cn } from "@/lib/utils"

export interface PasoProps {
  numero: number
  titulo: string
  descripcion: string
  consejo?: string
  className?: string
}

export function Paso({ numero, titulo, descripcion, consejo, className }: PasoProps) {
  return (
    <div className={cn("relative flex items-start gap-4 pb-6 last:pb-0", className)}>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground shadow-sm">
        {numero}
      </div>

      <div className="min-w-0 flex-1 space-y-1 pt-0.5">
        <h4 className="text-base font-semibold text-foreground">
          {titulo}
        </h4>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {descripcion}
        </p>

        {consejo && (
          <div className="mt-2 rounded-lg border border-border/80 bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">Recomendación: </span>
            {consejo}
          </div>
        )}
      </div>
    </div>
  )
}
