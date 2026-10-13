"use client"

import * as React from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { FileText } from "lucide-react"
import type { MockFormField } from "@/lib/manual-contenido"

export interface MockFormProps {
  titulo: string
  subtitulo: string
  campos: MockFormField[]
  botonTexto?: string
}

export function MockForm({ titulo, subtitulo, campos, botonTexto = "Guardar Cambios" }: MockFormProps) {
  const [formState, setFormState] = React.useState<Record<string, string | boolean>>(() => {
    const inicial: Record<string, string | boolean> = {}
    for (const c of campos) {
      inicial[c.name] = c.value ?? ""
    }
    return inicial
  })

  return (
    <Card className="border-border/80 shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-serif text-lg">{titulo}</CardTitle>
          <Badge variant="soft-warning">Ejemplo interactivo</Badge>
        </div>
        <CardDescription>{subtitulo}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {campos.map((campo) => {
          if (campo.type === "checkbox") {
            const isChecked = Boolean(formState[campo.name])
            return (
              <div key={campo.name} className="pt-2">
                <Checkbox
                  id={`mock-${campo.name}`}
                  label={campo.label}
                  checked={isChecked}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, [campo.name]: e.target.checked }))
                  }
                />
              </div>
            )
          }

          if (campo.type === "select") {
            return (
              <div key={campo.name} className="space-y-1.5">
                <Select
                  id={`mock-${campo.name}`}
                  label={campo.label}
                  options={campo.options ?? []}
                  value={String(formState[campo.name] ?? "")}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, [campo.name]: e.target.value }))
                  }
                />
              </div>
            )
          }

          if (campo.type === "textarea") {
            return (
              <div key={campo.name} className="space-y-1.5">
                <label htmlFor={`mock-${campo.name}`} className="text-sm font-medium text-foreground">
                  {campo.label}
                </label>
                <Textarea
                  id={`mock-${campo.name}`}
                  value={String(formState[campo.name] ?? "")}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, [campo.name]: e.target.value }))
                  }
                  rows={3}
                />
              </div>
            )
          }

          if (campo.type === "file-stub") {
            return (
              <div key={campo.name} className="space-y-1.5">
                <span className="text-sm font-medium text-foreground">{campo.label}</span>
                <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-2.5">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="min-w-0 flex-1 truncate font-mono text-xs text-foreground">
                    {String(formState[campo.name] ?? "archivo.pdf")}
                  </span>
                  <Badge variant="outline" className="text-[10px]">Documento cargado</Badge>
                </div>
              </div>
            )
          }

          return (
            <div key={campo.name} className="space-y-1.5">
              <label htmlFor={`mock-${campo.name}`} className="text-sm font-medium text-foreground">
                {campo.label}
              </label>
              <Input
                id={`mock-${campo.name}`}
                value={String(formState[campo.name] ?? "")}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, [campo.name]: e.target.value }))
                }
              />
            </div>
          )
        })}
      </CardContent>

      <CardFooter className="flex justify-end gap-2 border-t border-border/50 bg-muted/20 px-6 py-3">
        <Button
          type="button"
          onClick={() => {}}
          className="text-xs"
        >
          {botonTexto}
        </Button>
      </CardFooter>
    </Card>
  )
}
