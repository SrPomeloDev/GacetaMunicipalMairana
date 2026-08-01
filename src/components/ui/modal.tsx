"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
}

export interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: keyof typeof sizeClasses
  className?: string
}

const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  ({ open, onClose, title, children, size = "md", className }, ref) => {
    React.useEffect(() => {
      if (open) {
        document.body.style.overflow = "hidden"
      } else {
        document.body.style.overflow = ""
      }
      return () => {
        document.body.style.overflow = ""
      }
    }, [open])

    React.useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose()
      }
      if (open) {
        document.addEventListener("keydown", handleEscape)
        return () => document.removeEventListener("keydown", handleEscape)
      }
    }, [open, onClose])

    if (!open) return null

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="fixed inset-0 bg-black/60 animate-in fade-in duration-200"
          onClick={onClose}
        />
        <div
          ref={ref}
          className={cn(
            "relative z-50 w-full rounded-xl border bg-background p-6 shadow-2xl",
            "animate-in zoom-in-95 fade-in duration-200",
            "mx-4",
            sizeClasses[size],
            className
          )}
        >
          <div className="flex items-center justify-between mb-4">
            {title && (
              <h2 className="text-lg font-semibold leading-none tracking-tight">
                {title}
              </h2>
            )}
            <button
              onClick={onClose}
              className="ml-auto rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {children}
        </div>
      </div>
    )
  }
)
Modal.displayName = "Modal"

export { Modal }
