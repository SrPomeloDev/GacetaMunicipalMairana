import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

const ALLOWED_BUCKETS: Record<string, string> = {
  "noticias-imagenes": "image",
  "normativa-pdf": "pdf",
  galeria: "image",
  documentos: "any",
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
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

  const ext = file.name.split(".").pop()?.toLowerCase() || ""
  const allowedExt =
    ALLOWED_BUCKETS[bucket] === "image"
      ? ["png", "jpg", "jpeg", "gif", "webp", "svg"]
      : ALLOWED_BUCKETS[bucket] === "pdf"
        ? ["pdf"]
        : ["pdf", "png", "jpg", "jpeg", "doc", "docx", "xls", "xlsx"]

  if (!allowedExt.includes(ext)) {
    return NextResponse.json({ error: `Extensión no permitida para este tipo de archivo: .${ext}` }, { status: 400 })
  }

  const admin = createAdminClient()
  const timestamp = Date.now()
  const fileName = `${timestamp}_${session.user.id.slice(0, 8)}_${file.name.replace(/[^\w.\-]/g, "_")}`
  const arrayBuffer = await file.arrayBuffer()
  const buffer = new Uint8Array(arrayBuffer)

  const { data, error } = await admin.storage
    .from(bucket)
    .upload(fileName, buffer, {
      contentType: file.type,
      upsert: false,
    })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: { publicUrl } } = admin.storage.from(bucket).getPublicUrl(data.path)

  return NextResponse.json({ url: publicUrl, path: data.path, bucket })
}
