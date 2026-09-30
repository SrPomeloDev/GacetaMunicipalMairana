export type BucketNombre = "noticias-imagenes" | "normativa-pdf" | "galeria" | "documentos"

export interface ConfigBucket {
  mb: number
  bytes: number
  mime: "image" | "pdf" | "any"
  comprimir: boolean
  mimeTypes: string[]
  accept: string
}

const MB = 1024 * 1024

const IMAGE_MIME = ["image/png", "image/jpeg", "image/webp"]
const PDF_MIME = ["application/pdf"]
const DOC_MIME = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]

export const STORAGE_QUOTA_BYTES = 200 * MB
export const STORAGE_AVISO_BYTES = 150 * MB

export const BUCKETS: Record<BucketNombre, ConfigBucket> = {
  "noticias-imagenes": {
    mb: 2,
    bytes: 2 * MB,
    mime: "image",
    comprimir: true,
    mimeTypes: IMAGE_MIME,
    accept: IMAGE_MIME.join(","),
  },
  galeria: {
    mb: 3,
    bytes: 3 * MB,
    mime: "image",
    comprimir: true,
    mimeTypes: IMAGE_MIME,
    accept: IMAGE_MIME.join(","),
  },
  "normativa-pdf": {
    mb: 4,
    bytes: 4 * MB,
    mime: "pdf",
    comprimir: false,
    mimeTypes: PDF_MIME,
    accept: PDF_MIME.join(","),
  },
  documentos: {
    mb: 4,
    bytes: 4 * MB,
    mime: "any",
    comprimir: false,
    mimeTypes: DOC_MIME,
    accept: "application/pdf,.doc,.docx,.xls,.xlsx",
  },
}

export const BUCKET_NAMES = Object.keys(BUCKETS) as BucketNombre[]

export function esBucketNombre(valor: string): valor is BucketNombre {
  return Object.prototype.hasOwnProperty.call(BUCKETS, valor)
}

export function configBucket(bucket: BucketNombre): ConfigBucket {
  return BUCKETS[bucket]
}

export function extensionesPermitidas(mime: ConfigBucket["mime"]): string[] {
  if (mime === "image") return ["png", "jpg", "jpeg", "webp"]
  if (mime === "pdf") return ["pdf"]
  return ["pdf", "png", "jpg", "jpeg", "doc", "docx", "xls", "xlsx"]
}

export const MIME_POR_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.document",
}

export function formatearMB(bytes: number): string {
  const mb = bytes / MB
  if (mb >= 1024) return `${(mb / 1024).toFixed(2)} GB`
  if (mb >= 100) return `${Math.round(mb)} MB`
  if (mb >= 10) return `${mb.toFixed(0)} MB`
  return `${mb.toFixed(1)} MB`
}
