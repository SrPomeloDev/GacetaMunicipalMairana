"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, UploadCloud, X, FileText, ImageIcon } from "lucide-react"

interface FileUploadProps {
  bucket: "noticias-imagenes" | "normativa-pdf" | "galeria" | "documentos"
  accept: string
  value: string | null
  onChange: (url: string | null) => void
  label?: string
}

export function FileUpload({ bucket, accept, value, onChange, label = "Archivo" }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isImage = bucket === "galeria" || bucket === "noticias-imagenes"

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("bucket", bucket)
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Error al subir archivo")
      onChange(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir archivo")
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-2">
      {value ? (
        <div className="flex items-center gap-3 rounded-lg border border-input bg-muted/40 p-3">
          {isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt={label} className="h-16 w-16 rounded-lg object-cover" />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary-foreground dark:bg-primary/20 dark:text-primary-foreground">
              <FileText className="h-6 w-6" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{value.split("/").pop()}</p>
            <a href={value} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">
              Ver archivo
            </a>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onChange(null)}
            aria-label="Quitar archivo"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/30 p-6 text-center transition-colors hover:border-primary/50 hover:bg-muted/50 disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          ) : isImage ? (
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          ) : (
            <UploadCloud className="h-8 w-8 text-muted-foreground" />
          )}
          <span className="text-sm font-medium">{uploading ? "Subiendo..." : `Subir ${label.toLowerCase()}`}</span>
          <span className="text-xs text-muted-foreground">Click para seleccionar archivo</span>
        </button>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleFile} />
    </div>
  )
}
