import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getPermisosUsuario } from "@/lib/permisos-server"
import { tienePermiso, type Modulo } from "@/lib/roles"
import { checkRateLimit, rateLimitExceededResponse } from "@/lib/rate-limit"
import { checkCuotaStorage } from "@/lib/storage-quota"
import { comprimirImagenWebP } from "@/lib/image-compress"
import {
  BUCKETS,
  MIME_POR_EXT,
  esBucketNombre,
  extensionesPermitidas,
  type BucketNombre,
} from "@/lib/storage-limits"
import type { CodigoUpload } from "@/lib/upload-errors"

const BUCKET_MODULOS: Record<BucketNombre, Modulo[]> = {
  "noticias-imagenes": ["noticias", "autoridades", "usuarios", "configuracion"],
  "normativa-pdf": ["normativa", "concejo"],
  galeria: ["galeria"],
  documentos: ["tramites", "transparencia", "contrataciones"],
}

const UPLOADS_POR_MINUTO = 10
const UPLOAD_WINDOW_MS = 60_000
const MAX_BODY_EXTRA = 64 * 1024

function fallo(
  codigo: CodigoUpload,
  error: string,
  status: number,
  extra: Record<string, unknown> = {}
) {
  return NextResponse.json({ error, codigo, ...extra }, { status })
}

function detectKind(bytes: Uint8Array): string | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg"
  if (
    bytes.length >= 4 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  )
    return "png"
  if (
    bytes.length >= 4 &&
    bytes[0] === 0x47 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x38
  )
    return "gif"
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  )
    return "webp"
  if (
    bytes.length >= 4 &&
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46
  )
    return "pdf"
  return null
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) {
    return fallo("NO_AUTORIZADO", "No autorizado", 401)
  }

  const permisos = await getPermisosUsuario(supabase)
  if (!permisos) {
    return fallo(
      "SIN_PERMISOS",
      "No tienes permisos para subir archivos",
      403
    )
  }

  const rl = checkRateLimit(`upload:${authUser.id}`, {
    limit: UPLOADS_POR_MINUTO,
    windowMs: UPLOAD_WINDOW_MS,
  })
  if (!rl.ok) {
    return rateLimitExceededResponse(rl.retryAfter, {
      codigo: "RATE_LIMIT",
      reintentarEnSeg: rl.retryAfter,
    })
  }

  const declaredLength = Number(request.headers.get("content-length") ?? 0)
  const maxBodyBytes = Math.max(...Object.values(BUCKETS).map((b) => b.bytes)) + MAX_BODY_EXTRA
  if (Number.isFinite(declaredLength) && declaredLength > maxBodyBytes) {
    return fallo(
      "TAMANO_EXCEDIDO",
      "El archivo es demasiado grande para procesarlo",
      413,
      {
        limiteMb: Math.max(...Object.values(BUCKETS).map((b) => b.mb)),
        pesoMb: Math.round((declaredLength / 1048576) * 10) / 10,
      }
    )
  }

  const formData = await request.formData()
  const file = formData.get("file") as File | null
  const bucketRaw = (formData.get("bucket") as string | null) || "noticias-imagenes"

  if (!file) {
    return fallo("SIN_ARCHIVO", "No se envió ningún archivo", 400)
  }

  if (!esBucketNombre(bucketRaw)) {
    return fallo("ERROR_SISTEMA", "Destino de almacenamiento no permitido", 400)
  }
  const bucket = bucketRaw
  const config = BUCKETS[bucket]

  const modulos = BUCKET_MODULOS[bucket] ?? []
  if (!modulos.some((m) => tienePermiso(permisos.permisos, m, "crear"))) {
    return fallo(
      "SIN_PERMISOS",
      "No tienes permisos para subir archivos",
      403
    )
  }

  const dot = file.name.lastIndexOf(".")
  const ext = dot >= 0 ? file.name.slice(dot + 1).toLowerCase() : ""

  const allowedExt = extensionesPermitidas(config.mime)

  if (ext === "svg" || file.type === "image/svg+xml") {
    return fallo(
      "TIPO_NO_PERMITIDO",
      "Los archivos .svg no se permiten por seguridad",
      415,
      { formatos: allowedExt }
    )
  }

  if (!allowedExt.includes(ext)) {
    return fallo(
      "TIPO_NO_PERMITIDO",
      `Este campo no admite archivos .${ext || "sin extensión"}`,
      400,
      { formatos: allowedExt }
    )
  }

  if (file.size > config.bytes) {
    return fallo(
      "TAMANO_EXCEDIDO",
      `El archivo supera el tamaño máximo de ${config.mb}MB`,
      413,
      {
        limiteMb: config.mb,
        pesoMb: Math.round((file.size / 1048576) * 10) / 10,
      }
    )
  }

  const admin = createAdminClient()

  let buffer = new Uint8Array(await file.arrayBuffer())
  let extFinal = ext
  let mimeFinal = MIME_POR_EXT[ext] ?? "application/octet-stream"
  let optimizado = false

  if (config.comprimir) {
    const comprimido = await comprimirImagenWebP(buffer)
    if (comprimido) {
      buffer = comprimido
      extFinal = "webp"
      mimeFinal = MIME_POR_EXT.webp
      optimizado = true
    }
  }

  const detected = detectKind(buffer)
  const esperado = extFinal === "jpeg" ? "jpg" : extFinal
  if (["jpg", "png", "gif", "webp", "pdf"].includes(esperado) && detected !== esperado) {
    return fallo(
      "FORMATO_INVALIDO",
      "El contenido del archivo no coincide con su extensión",
      415
    )
  }

  const cuota = await checkCuotaStorage(buffer.length)
  if (!cuota.ok) {
    return fallo("CUOTA_LLENA", cuota.error, cuota.status, {
      limiteMb: cuota.limiteMb,
      restanteMb: cuota.restanteMb,
    })
  }

  const timestamp = Date.now()
  const fileName = `${timestamp}_${authUser.id.slice(0, 8)}_${crypto.randomUUID()}.${extFinal}`

  const { data, error } = await admin.storage
    .from(bucket)
    .upload(fileName, buffer, {
      contentType: mimeFinal,
      upsert: false,
    })

  if (error) {
    return fallo("ERROR_SISTEMA", `No se pudo guardar el archivo: ${error.message}`, 500)
  }

  const { data: { publicUrl } } = admin.storage.from(bucket).getPublicUrl(data.path)

  return NextResponse.json({
    url: publicUrl,
    path: data.path,
    bucket,
    bytes: buffer.length,
    optimizado,
    pesoOriginal: file.size,
  })
}
