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
    const titleId = React.useId()
    const panelRef = React.useRef<HTMLDivElement>(null)

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
      if (!open) return
      const previousActive = document.activeElement as HTMLElement | null
      panelRef.current?.focus()

      const handleKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose()
          return
        }
        if (e.key !== "Tab") return
        const panel = panelRef.current
        if (!panel) return
        const focusables = Array.from(
          panel.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        )
        if (focusables.length === 0) return
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        if (e.shiftKey) {
          if (document.activeElement === first || !panel.contains(document.activeElement)) {
            e.preventDefault()
            last.focus()
          }
        } else if (document.activeElement === last || !panel.contains(document.activeElement)) {
          e.preventDefault()
          first.focus()
        }
      }

      document.addEventListener("keydown", handleKey)
      return () => {
        document.removeEventListener("keydown", handleKey)
        previousActive?.focus?.()
      }
    }, [open, onClose])

    if (!open) return null

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
        <div
          className="fixed inset-0 bg-black/60 animate-in fade-in duration-200"
          onClick={onClose}
          aria-hidden
        />
        <div
          ref={(node) => {
            panelRef.current = node
            if (typeof ref === "function") ref(node)
            else if (ref) ref.current = node
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          tabIndex={-1}
          className={cn(
            "relative z-50 w-full rounded-2xl border border-border/60 bg-background p-6 shadow-2xl",
            "animate-in zoom-in-95 fade-in duration-200",
            "mx-4 my-auto max-h-[calc(100dvh-2rem)] overflow-y-auto outline-none",
            sizeClasses[size],
            className
          )}
        >
          <div className="mb-4 flex items-center justify-between border-b border-border/50 pb-4">
            {title && (
              <h2 id={titleId} className="text-lg font-semibold leading-none tracking-tight">
                {title}
              </h2>
            )}
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="ml-auto rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
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
