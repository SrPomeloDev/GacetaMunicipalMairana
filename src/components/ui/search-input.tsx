"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Search, X } from "lucide-react"
import { VoiceButton } from "@/components/ui/voice-button"
import { useDictadoSoportado } from "@/hooks/use-dictado-voz"

export interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value?: string
  onChange?: (value: string) => void
  onClear?: () => void
  voice?: boolean
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, value = "", onChange, onClear, voice = false, placeholder = "Buscar...", ...props }, ref) => {
    const soportado = useDictadoSoportado()
    const vozVisible = voice && soportado

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.value)
    }

    const handleDictado = (texto: string) => {
      onChange?.(value ? `${value} ${texto}` : texto)
    }

    return (
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className={cn(
            "flex h-10 w-full rounded-lg border border-input bg-background pl-10 py-2 text-sm shadow-sm shadow-black/[0.02] transition-all",
            vozVisible ? "pr-16" : "pr-8",
            "ring-offset-background",
            "focus-visible:outline-none focus-visible:border-ring/70 focus-visible:ring-2 focus-visible:ring-ring/25 focus-visible:ring-offset-0",
            "placeholder:text-muted-foreground/80",
            className
          )}
          {...props}
        />
        {vozVisible && (
          <VoiceButton
            onDictado={handleDictado}
            className="absolute right-1.5 top-1/2 h-8 w-8 -translate-y-1/2"
          />
        )}
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange?.("")
              onClear?.()
            }}
            aria-label="Limpiar búsqueda"
            className={cn(
              "absolute top-1/2 -translate-y-1/2 rounded text-muted-foreground hover:text-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              vozVisible ? "right-10" : "right-3"
            )}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    )
  }
)
SearchInput.displayName = "SearchInput"

export { SearchInput }
