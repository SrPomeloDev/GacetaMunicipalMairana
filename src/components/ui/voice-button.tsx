"use client"

import { cn } from "@/lib/utils"
import { Microphone } from "@/lib/icons"
import { useDictadoVoz } from "@/hooks/use-dictado-voz"

interface VoiceButtonProps {
  onDictado: (texto: string) => void
  onError?: (mensaje: string) => void
  disabled?: boolean
  className?: string
  label?: string
}

export function VoiceButton({ onDictado, onError, disabled, className, label = "Dictar por voz" }: VoiceButtonProps) {
  const { soportado, escuchando, error, alternar } = useDictadoVoz({ onResult: onDictado, onError })

  if (!soportado) return null

  return (
    <button
      type="button"
      onClick={alternar}
      disabled={disabled}
      aria-label={escuchando ? "Detener dictado" : label}
      aria-pressed={escuchando}
      title={error ?? (escuchando ? "Escuchando... tocá para detener" : "Tocá y hablá para escribir")}
      className={cn(
        "inline-flex items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-primary",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
        "disabled:pointer-events-none disabled:opacity-50",
        escuchando && "voice-listening bg-destructive/10 text-destructive hover:bg-destructive/15 hover:text-destructive",
        className
      )}
    >
      <Microphone className="h-4 w-4" />
      <span aria-live="polite" className="sr-only">
        {escuchando ? "Escuchando, hablá ahora" : label}
      </span>
    </button>
  )
}
