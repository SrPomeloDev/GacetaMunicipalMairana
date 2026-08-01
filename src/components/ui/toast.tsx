"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react"

type ToastVariant = "default" | "success" | "error" | "warning"

interface ToastData {
  id: string
  message: string
  variant: ToastVariant
}

interface ToastContextValue {
  addToast: (message: string, variant?: ToastVariant) => void
  removeToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextValue | null>(null)

function useToast() {
  const ctx = React.useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within a ToastProvider")
  return ctx
}

const variantStyles: Record<ToastVariant, string> = {
  default: "bg-background border text-foreground",
  success: "bg-green-600 text-white border-green-700",
  error: "bg-red-600 text-white border-red-700",
  warning: "bg-yellow-500 text-white border-yellow-600",
}

const variantIcons: Record<ToastVariant, React.ReactNode> = {
  default: <Info className="h-5 w-5" />,
  success: <CheckCircle className="h-5 w-5" />,
  error: <AlertCircle className="h-5 w-5" />,
  warning: <AlertTriangle className="h-5 w-5" />,
}

function ToastItem({ toast, onRemove }: { toast: ToastData; onRemove: (id: string) => void }) {
  return (
    <div
      className={cn(
        "pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg",
        "animate-in slide-in-from-right-full fade-in duration-300",
        variantStyles[toast.variant]
      )}
    >
      <span className="mt-0.5 shrink-0">{variantIcons[toast.variant]}</span>
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="shrink-0 rounded-md p-0.5 opacity-70 transition-opacity hover:opacity-100"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

interface ToastProviderProps {
  children: React.ReactNode
}

function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = React.useState<ToastData[]>([])
  const timersRef = React.useRef<Map<string, NodeJS.Timeout>>(new Map())

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    const timer = timersRef.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timersRef.current.delete(id)
    }
  }, [])

  const addToast = React.useCallback(
    (message: string, variant: ToastVariant = "default") => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
      const toast: ToastData = { id, message, variant }
      setToasts((prev) => [...prev, toast])

      const timer = setTimeout(() => removeToast(id), 5000)
      timersRef.current.set(id, timer)
    },
    [removeToast]
  )

  React.useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer))
      timersRef.current.clear()
    }
  }, [])

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export { ToastProvider, useToast }
export type { ToastVariant }
