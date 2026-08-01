"use client"

import { useState } from "react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Loader2, AlertTriangle } from "lucide-react"

interface ConfirmDialogProps {
  open: boolean
  title?: string
  description?: string
  onConfirm: () => Promise<void> | void
  onCancel: () => void
  confirmLabel?: string
}

export function ConfirmDialog({
  open,
  title = "¿Confirmar acción?",
  description = "Esta acción no se puede deshacer.",
  onConfirm,
  onCancel,
  confirmLabel = "Eliminar",
}: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onCancel} title={title} size="sm">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <p className="pt-2 text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
