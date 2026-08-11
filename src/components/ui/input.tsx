"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm shadow-black/[0.02] transition-all",
            "ring-offset-background placeholder:text-muted-foreground/80 file:border-0 file:bg-transparent file:text-sm file:font-medium",
            "focus-visible:outline-none focus-visible:border-ring/70 focus-visible:ring-2 focus-visible:ring-ring/25 focus-visible:ring-offset-0",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus-visible:ring-destructive/25",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-destructive">{error}</p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
