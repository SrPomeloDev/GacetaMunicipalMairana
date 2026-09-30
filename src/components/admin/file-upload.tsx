"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { Upload, Loader2, AlertTriangle, ImageIcon, FileText, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { BUCKETS, type BucketNombre } from "@/lib/storage-limits"
import { comprimirImagenWebP } from "@/lib/image-compress"
import { useToast } from "@/components/ui/toast"
import {
  esRespuestaUploadError,
  formatearTamano,
  sugerenciaParaCodigo,
  tituloParaCodigo,
  type RespuestaUploadError,
} from "@/lib/upload-errors"

interface FileUploadProps {
  id?: string
  bucket: BucketNombre
  value: string | null
  onChange: (url: string | null) => void
  label?: string
  accept?: string
  className?: string
  multiple?: boolean
  disabled?: boolean
}

type AvisoUpload = {
  titulo: string
  sugerencia: string
  conEnlaceConfig?: boolean
}

function validarTipo(file: File, config: (typeof BUCKETS)[BucketNombre]): boolean {
  if (file.type && config.mimeTypes.includes(file.type)) return true
  const ext = file.name.slice(file.name.lastIndexOf(".") + 1).toLowerCase()
  return config.mimeTypes.length === 0 ? false : extensionEnMimes(ext, config)
}

function extensionEnMimes(ext: string, config: (typeof BUCKETS)[BucketNombre]): boolean {
  const mapa: Record<string, string[]> = {
    png: ["image/png"],
    jpg: ["image/jpeg"],
    jpeg: ["image/jpeg"],
    webp: ["image/webp"],
    pdf: ["application/pdf"],
    doc: ["application/msword"],
    docx: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
    xls: ["application/vnd.ms-excel"],
    xlsx: ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
  }
  const mimes = mapa[ext]
  return Boolean(mimes && mimes.some((m) => config.mimeTypes.includes(m)))
}

function extensionReal(file: File): string {
  const ext = file.name.slice(file.name.lastIndexOf(".") + 1).toLowerCase()
  return ext === "jpg" ? "jpeg" : ext
}

type ResultadoPreparacion = {
  file: File
  comprimidoBytes: number | null
  motivoFallo: "sin-soporte" | "sin-ganancia" | null
}

async function prepararImagen(
  file: File,
  config: (typeof BUCKETS)[BucketNombre]
): Promise<ResultadoPreparacion> {
  if (!config.comprimir) return { file, comprimidoBytes: null, motivoFallo: null }
  if (extensionReal(file) === "gif") return { file, comprimidoBytes: null, motivoFallo: null }

  const comprimido = await comprimirImagenWebP(new Uint8Array(await file.arrayBuffer()))
  if (!comprimido) {
    const soporta =
      typeof createImageBitmap === "function" && typeof OffscreenCanvas !== "undefined"
    return {
      file,
      comprimidoBytes: null,
      motivoFallo: soporta ? "sin-ganancia" : "sin-soporte",
    }
  }

  const nombre = file.name.replace(/\.[^.]+$/, "") + ".webp"
  const nuevo = new File([comprimido], nombre, { type: "image/webp" })
  return { file: nuevo, comprimidoBytes: comprimido.length, motivoFallo: null }
}

function mensajeDeErrorServer(
  data: RespuestaUploadError,
  config: (typeof BUCKETS)[BucketNombre]
): AvisoUpload {
  let sugerencia = sugerenciaParaCodigo(data)

  if (data.codigo === "TAMANO_EXCEDIDO" && config.comprimir) {
    sugerencia = `Ya intentamos optimizarla automáticamente a WebP y no alcanzó el límite. Reduce las dimensiones a 1600 px de ancho o expórtala como JPG de menor calidad. El máximo de este campo es ${config.mb} MB.`
  }

  return {
    titulo: tituloParaCodigo(data),
    sugerencia,
    conEnlaceConfig: data.codigo === "CUOTA_LLENA",
  }
}

export function FileUpload({
  id,
  bucket,
  value,
  onChange,
  label,
  accept,
  className,
  multiple = false,
  disabled = false,
}: FileUploadProps) {
  const config = BUCKETS[bucket]
  const { addToast } = useToast()
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [error, setError] = React.useState<AvisoUpload | null>(null)
  const [preview, setPreview] = React.useState<string | null>(null)

  const abrirSelector = () => {
    if (!uploading && !disabled) inputRef.current?.click()
  }

  const eliminarArchivoRemoto = async (url: string) => {
    try {
      const res = await fetch(`/api/admin/storage?url=${encodeURIComponent(url)}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        if (data?.error) addToast(data.error, "warning")
      }
    } catch {
      // el archivo ya está desvinculado del formulario; no bloqueamos la UI
    }
  }

  const uploadFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setError(null)
    setUploading(true)

    for (const raw of files) {
      let file = raw
      let preparado: ResultadoPreparacion = {
        file: raw,
        comprimidoBytes: null,
        motivoFallo: null,
      }

      try {
        if (!validarTipo(file, config)) {
          setError({
            titulo: `"${file.name}" no es un tipo de archivo admitido`,
            sugerencia: `Este campo solo admite ${extensionesLegibles(config)}. Exporta el archivo a uno de esos formatos e inténtalo de nuevo.`,
          })
          continue
        }

        if (config.comprimir) preparado = await prepararImagen(file, config)
        file = preparado.file

        if (file.size > config.bytes) {
          setError(mensajePesoExcedido(file, preparado, config))
          continue
        }

        const form = new FormData()
        form.append("file", file)
        form.append("bucket", bucket)

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest()
          xhr.open("POST", "/api/admin/upload")

          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const pct = Math.round((e.loaded / e.total) * 100)
              setProgress(pct)
            }
          }

          xhr.onload = () => {
            let data: unknown = null
            try {
              data = JSON.parse(xhr.responseText)
            } catch {
              // respuesta no-JSON
            }

            if (xhr.status >= 200 && xhr.status < 300 && data && typeof data === "object" && "url" in data) {
              const d = data as { url: string; optimizado?: boolean; pesoOriginal?: number; bytes?: number }
              onChange(d.url)
              setPreview(d.url)
              if (d.optimizado) {
                const antes = d.pesoOriginal ? formatearTamano(d.pesoOriginal) : null
                const despues = d.bytes ? formatearTamano(d.bytes) : null
                addToast(
                  antes && despues ? `Imagen optimizada: ${antes} → ${despues}` : "Imagen optimizada",
                  "default"
                )
              }
              resolve()
            } else if (esRespuestaUploadError(data)) {
              reject(new Error(JSON.stringify(data)))
            } else {
              reject(new Error("No se pudo subir el archivo"))
            }
          }

          xhr.onerror = () => reject(new Error("Error de red al subir el archivo"))
          xhr.send(form)
        })
      } catch (e) {
        if (e instanceof Error && e.message.startsWith("{")) {
          try {
            const data = JSON.parse(e.message) as RespuestaUploadError
            setError(mensajeDeErrorServer(data, config))
            continue
          } catch {
            setError({ titulo: "No se pudo subir el archivo", sugerencia: "Inténtalo de nuevo en unos segundos." })
            continue
          }
        }
        setError({
          titulo: "No se pudo subir el archivo",
          sugerencia:
            e instanceof Error && e.message.includes("red")
              ? "Revisa tu conexión a internet e inténtalo otra vez."
              : "Inténtalo de nuevo en unos segundos. Si el problema persiste, avisa al administrador.",
        })
      }
    }

    setUploading(false)
    setProgress(0)
    if (inputRef.current) inputRef.current.value = ""
  }

  const handleQuitar = () => {
    const anterior = value
    onChange(null)
    setPreview(null)
    setError(null)
    if (anterior) void eliminarArchivoRemoto(anterior)
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && <span className="text-sm font-medium">{label}</span>}

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept ?? config.accept}
        multiple={multiple || undefined}
        onChange={(e) => void uploadFiles(e.target.files)}
        className="hidden"
        disabled={disabled || uploading}
      />

      {value ? (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-3">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-background">
            {preview ? (
              <Image src={preview} alt="Vista previa" fill className="object-cover" unoptimized />
            ) : config.mime === "image" ? (
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
            ) : (
              <FileText className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">Archivo cargado</p>
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate text-xs text-muted-foreground hover:underline"
            >
              Ver archivo
            </a>
          </div>
          <button
            type="button"
            onClick={handleQuitar}
            disabled={uploading || disabled}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
            aria-label="Quitar archivo"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={abrirSelector}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            void uploadFiles(e.dataTransfer.files)
          }}
          disabled={uploading || disabled}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/20 px-4 py-8 text-center transition-colors",
            "hover:border-primary/60 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "disabled:cursor-not-allowed disabled:opacity-60"
          )}
        >
          {uploading ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-sm font-medium">Subiendo… {progress}%</span>
              <div className="h-1.5 w-40 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </>
          ) : (
            <>
              <Upload className="h-6 w-6 text-muted-foreground" />
              <span className="text-sm font-medium">Subir archivo</span>
              <span className="text-xs text-muted-foreground">
                {config.mime === "image" && config.comprimir
                  ? `Imágenes (JPG, PNG o WebP) · máx ${config.mb} MB · se optimizan automáticamente`
                  : config.mime === "pdf"
                    ? `PDF · máx ${config.mb} MB`
                    : `${extensionesLegibles(config)} · máx ${config.mb} MB`}
              </span>
            </>
          )}
        </button>
      )}

      {error && <PanelAviso aviso={error} />}

      <p className="text-xs text-muted-foreground">
        {config.mime === "image" && config.comprimir
          ? `Las imágenes se convierten a WebP automáticamente y se reducen a 1600 px si hace falta. Tamaño máximo: ${config.mb} MB.`
          : `Tamaño máximo: ${config.mb} MB. Formatos: ${extensionesLegibles(config)}.`}
      </p>
    </div>
  )
}

function extensionesLegibles(config: (typeof BUCKETS)[BucketNombre]): string {
  if (config.mime === "image") return "JPG, PNG o WebP"
  if (config.mime === "pdf") return "PDF"
  return "PDF, DOC, DOCX, XLS o XLSX"
}

function mensajePesoExcedido(
  file: File,
  preparado: ResultadoPreparacion,
  config: (typeof BUCKETS)[BucketNombre]
): AvisoUpload {
  const peso = formatearTamano(file.size)
  const limite = `${config.mb} MB`

  if (preparado.comprimidoBytes !== null) {
    return {
      titulo: `El archivo pesa ${peso} y el máximo es ${limite}`,
      sugerencia: `Lo optimizamos automáticamente y quedó en ${formatearTamano(
        preparado.comprimidoBytes
      )}, todavía por encima del límite. Reduce la imagen a 1600 px de ancho o expórtala como JPG de menor calidad.`,
    }
  }

  if (preparado.motivoFallo === "sin-soporte") {
    return {
      titulo: `El archivo pesa ${peso} y el máximo es ${limite}`,
      sugerencia:
        "Tu navegador no admite la optimización automática. Reduce la imagen a 1600 px de ancho o expórtala como JPG de menor calidad antes de subirla.",
    }
  }

  if (config.comprimir) {
    return {
      titulo: `El archivo pesa ${peso} y el máximo es ${limite}`,
      sugerencia: `La optimización automática no redujo lo suficiente el peso. Reduce las dimensiones de la imagen o bájala de calidad al exportarla.`,
    }
  }

  if (config.mime === "pdf") {
    return {
      titulo: `El PDF pesa ${peso} y el máximo es ${limite}`,
      sugerencia:
        "Los PDF no se comprimen automáticamente. Reduce la calidad de las imágenes que contiene o divídelo en partes antes de subirlo.",
    }
  }

  return {
    titulo: `El archivo pesa ${peso} y el máximo es ${limite}`,
    sugerencia: "Reduce el tamaño del documento o divídelo en partes antes de subirlo.",
  }
}

function PanelAviso({ aviso }: { aviso: AvisoUpload }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm animate-in fade-in duration-200">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-600 dark:text-yellow-400" />
      <div className="min-w-0 space-y-1">
        <p className="font-medium text-yellow-800 dark:text-yellow-200">{aviso.titulo}</p>
        <p className="text-yellow-700/90 dark:text-yellow-300/90">{aviso.sugerencia}</p>
        {aviso.conEnlaceConfig && (
          <Link
            href="/admin/configuracion"
            className="inline-block text-xs font-medium text-yellow-800 underline underline-offset-2 hover:text-yellow-900 dark:text-yellow-200 dark:hover:text-yellow-100"
          >
            Ir a Configuración para revisar el espacio
          </Link>
        )}
      </div>
    </div>
  )
}

FileUpload.displayName = "FileUpload"
