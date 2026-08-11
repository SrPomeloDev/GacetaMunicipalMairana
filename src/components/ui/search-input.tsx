"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Search, X } from "lucide-react"

export interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value?: string
  onChange?: (value: string) => void
  onClear?: () => void
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, value = "", onChange, onClear, placeholder = "Buscar...", ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.value)
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
            "flex h-10 w-full rounded-lg border border-input bg-background pl-10 pr-8 py-2 text-sm shadow-sm shadow-black/[0.02] transition-all",
            "ring-offset-background",
            "focus-visible:outline-none focus-visible:border-ring/70 focus-visible:ring-2 focus-visible:ring-ring/25 focus-visible:ring-offset-0",
            "placeholder:text-muted-foreground/80",
            className
          )}
          {...props}
        />
        {value && (
          <button
            onClick={() => {
              onChange?.("")
              onClear?.()
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
