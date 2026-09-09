import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

const ALLOWED_BUCKETS: Record<string, string> = {
  "noticias-imagenes": "image",
  "normativa-pdf": "pdf",
  galeria: "image",
  documentos: "any",
}

const BUCKET_SIZE_LIMITS: Record<string, number> = {
  "noticias-imagenes": 5242880,
  "normativa-pdf": 15728640,
  galeria: 10485760,
  documentos: 20971520,
}

const MIME_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
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
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { data: rol } = await supabase.rpc("current_user_role")
  if (!rol || !["admin", "editor"].includes(rol)) {
    return NextResponse.json({ error: "No tienes permisos para subir archivos" }, { status: 403 })
  }

  const formData = await request.formData()
  const file = formData.get("file") as File | null
  const bucket = (formData.get("bucket") as string | null) || "noticias-imagenes"

  if (!file) {
    return NextResponse.json({ error: "No se envió ningún archivo" }, { status: 400 })
  }

  if (!ALLOWED_BUCKETS[bucket]) {
    return NextResponse.json({ error: "Bucket no permitido" }, { status: 400 })
  }

  const dot = file.name.lastIndexOf(".")
  const ext = dot >= 0 ? file.name.slice(dot + 1).toLowerCase() : ""

  if (ext === "svg" || file.type === "image/svg+xml") {
    return NextResponse.json({ error: "Tipo de archivo no permitido por seguridad: .svg" }, { status: 415 })
  }

  const allowedExt =
    ALLOWED_BUCKETS[bucket] === "image"
      ? ["png", "jpg", "jpeg", "gif", "webp"]
      : ALLOWED_BUCKETS[bucket] === "pdf"
        ? ["pdf"]
        : ["pdf", "png", "jpg", "jpeg", "doc", "docx", "xls", "xlsx"]

  if (!allowedExt.includes(ext)) {
    return NextResponse.json({ error: `Extensión no permitida para este tipo de archivo: .${ext}` }, { status: 400 })
  }

  const limit = BUCKET_SIZE_LIMITS[bucket]
  if (file.size > limit) {
    return NextResponse.json(
      { error: `Archivo excede el límite de ${Math.round(limit / 1048576)}MB para este bucket` },
      { status: 413 }
    )
  }

  const admin = createAdminClient()
  const arrayBuffer = await file.arrayBuffer()
  const buffer = new Uint8Array(arrayBuffer)

  const detected = detectKind(buffer)
  const expected = ext === "jpeg" ? "jpg" : ext
  if (["jpg", "png", "gif", "webp", "pdf"].includes(expected) && detected !== expected) {
    return NextResponse.json({ error: "El contenido del archivo no coincide con su extensión" }, { status: 415 })
  }

  const timestamp = Date.now()
  const fileName = `${timestamp}_${authUser.id.slice(0, 8)}_${crypto.randomUUID()}.${ext}`

  const { data, error } = await admin.storage
    .from(bucket)
    .upload(fileName, buffer, {
      contentType: MIME_BY_EXT[ext],
      upsert: false,
    })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: { publicUrl } } = admin.storage.from(bucket).getPublicUrl(data.path)

  return NextResponse.json({ url: publicUrl, path: data.path, bucket })
}
