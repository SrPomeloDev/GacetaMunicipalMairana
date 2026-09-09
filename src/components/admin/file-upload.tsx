"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { IconBox } from "@/components/ui/icon-box"
import { useToast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"
import { Loader2, UploadCloud, X, FileText, ImageIcon } from "lucide-react"

interface FileUploadProps {
  bucket: "noticias-imagenes" | "normativa-pdf" | "galeria" | "documentos"
  accept: string
  value: string | null
  onChange: (url: string | null) => void
  label?: string
  id?: string
  multiple?: boolean
}

const MAX_SIZE = 10 * 1024 * 1024

function matchesAccept(file: File, accept: string): boolean {
  const tokens = accept
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
  if (tokens.length === 0) return true
  const name = file.name.toLowerCase()
  const type = file.type.toLowerCase()
  return tokens.some((token) => {
    if (token.endsWith("/*")) return type.startsWith(token.slice(0, -1))
    if (token.startsWith(".")) return name.endsWith(token)
    return type === token
  })
}

function uploadViaXhr(file: File, bucket: string, onProgress: (pct: number) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("bucket", bucket)
    const xhr = new XMLHttpRequest()
    xhr.open("POST", "/api/admin/upload")
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
    }
    xhr.onload = () => {
      let data: { url?: string; error?: string } | null = null
      try {
        data = JSON.parse(xhr.responseText)
      } catch {
        reject(new Error("Error al subir archivo"))
        return
      }
      if (xhr.status >= 200 && xhr.status < 300 && data?.url) resolve(data.url)
      else reject(new Error(data?.error || "Error al subir archivo"))
    }
    xhr.onerror = () => reject(new Error("Error de red al subir archivo"))
    xhr.send(formData)
  })
}

export function FileUpload({ bucket, accept, value, onChange, label = "Archivo", id, multiple = false }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { addToast } = useToast()

  const isImage = bucket === "galeria" || bucket === "noticias-imagenes"

  const uploadFiles = async (files: File[]) => {
    const list = multiple ? files : files.slice(0, 1)
    setUploading(true)
    setError(null)
    setProgress(0)
    try {
      let done = 0
      for (const file of list) {
        if (file.size > MAX_SIZE) {
          const message = `El archivo "${file.name}" supera el tamaño máximo de 10MB`
          setError(message)
          addToast(message, "error")
          continue
        }
        if (!matchesAccept(file, accept)) {
          const message = `El archivo "${file.name}" no es un tipo permitido para ${label.toLowerCase()}`
          setError(message)
          addToast(message, "error")
          continue
        }
        const url = await uploadViaXhr(file, bucket, setProgress)
        onChange(url)
        done += 1
      }
      if (multiple && done > 0) {
        addToast(`${done} archivo(s) subido(s), se conserva la última URL`, "success")
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al subir archivo"
      setError(message)
      addToast(message, "error")
    } finally {
      setUploading(false)
      setProgress(0)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    if (files.length === 0) return
    void uploadFiles(files)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    if (uploading) return
    const files = e.dataTransfer.files ? Array.from(e.dataTransfer.files) : []
    if (files.length === 0) return
    void uploadFiles(files)
  }

  return (
    <div className="space-y-2">
      {value ? (
        <div className="flex items-center gap-3 rounded-lg border border-input bg-muted/40 p-3">
          {isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt={label} className="h-16 w-16 rounded-lg object-cover" />
          ) : (
            <IconBox size="lg">
              <FileText className="h-6 w-6" />
            </IconBox>
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
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/30 p-6 text-center transition-colors hover:border-primary/50 hover:bg-muted/50 disabled:opacity-50",
            dragging && "border-primary bg-primary/5"
          )}
        >
          {uploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          ) : isImage ? (
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          ) : (
            <UploadCloud className="h-8 w-8 text-muted-foreground" />
          )}
          <span className="text-sm font-medium">{uploading ? `Subiendo... ${progress}%` : `Subir ${label.toLowerCase()}`}</span>
          {uploading ? (
            <div className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">Click para seleccionar o arrastra archivos aquí</span>
          )}
        </button>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        multiple={multiple || undefined}
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  )
}
