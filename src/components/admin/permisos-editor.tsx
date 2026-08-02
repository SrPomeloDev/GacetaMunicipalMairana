"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { ACCIONES, MODULOS, permisosPorRol, type Accion, type Modulo, type Permisos } from "@/lib/roles"

interface PermisosEditorProps {
  permisos: Permisos
  rol: string
  onChange: (permisos: Permisos) => void
}

function toggle(acciones: Accion[] | undefined, accion: Accion): Accion[] {
  if (acciones?.includes(accion)) return acciones.filter((a) => a !== accion)
  return [...(acciones ?? []), accion]
}

export function PermisosEditor({ permisos, rol, onChange }: PermisosEditorProps) {
  const setAccion = (modulo: Modulo, accion: Accion) => {
    onChange({ ...permisos, [modulo]: toggle(permisos[modulo], accion) })
  }

  const setTodo = (modulo: Modulo) => {
    onChange({ ...permisos, [modulo]: ["crear", "editar", "eliminar", "publicar"] })
  }

  const setNada = (modulo: Modulo) => {
    onChange({ ...permisos, [modulo]: [] })
  }

  const aplicarRol = () => {
    onChange(JSON.parse(JSON.stringify(permisosPorRol(rol))))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          Un módulo sin ninguna acción marcada significa{" "}
          <span className="font-medium text-foreground">sin acceso</span> (no aparecerá en su menú).
        </p>
        <Button type="button" variant="outline" size="sm" onClick={aplicarRol}>
          Restablecer permisos del rol
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/70">
        <div className="hidden grid-cols-[1fr_repeat(4,minmax(64px,1fr))_auto] gap-2 border-b bg-muted/40 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground md:grid">
          <span>Módulo</span>
          {ACCIONES.map((a) => (
            <span key={a.value} className="text-center">{a.label}</span>
          ))}
          <span className="text-right">Rápido</span>
        </div>

        {MODULOS.map((modulo) => {
          const acciones = permisos[modulo.value] ?? []
          const sinAcceso = acciones.length === 0
          return (
            <div
              key={modulo.value}
              className={cn(
                "grid grid-cols-2 items-center gap-3 border-b px-4 py-3 last:border-0 md:grid-cols-[1fr_repeat(4,minmax(64px,1fr))_auto]",
                sinAcceso && "opacity-60"
              )}
            >
              <div className="col-span-2 flex items-center justify-between md:col-span-1 md:justify-start">
                <span className="text-sm font-medium">{modulo.label}</span>
                {sinAcceso && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground md:hidden">
                    Sin acceso
                  </span>
                )}
              </div>
              {ACCIONES.map((accion) => (
                <div
                  key={accion.value}
                  className="flex cursor-pointer items-center justify-center gap-1.5 text-xs"
                >
                  <Checkbox
                    aria-label={`${modulo.label}: ${accion.label}`}
                    checked={acciones.includes(accion.value)}
                    onChange={() => setAccion(modulo.value, accion.value)}
                  />
                  <span className="md:hidden">{accion.label}</span>
                </div>
              ))}
              <div className="col-span-2 flex justify-end gap-1 md:col-span-1">
                <Button type="button" variant="ghost" size="sm" onClick={() => setTodo(modulo.value)}>
                  Todo
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setNada(modulo.value)}>
                  Nada
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
