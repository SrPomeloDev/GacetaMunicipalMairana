import { NextResponse } from "next/server"
import { requirePermiso } from "@/lib/permisos-server"
import { createAdminClient } from "@/lib/supabase/admin"
import { storageRefDesdeUrl } from "@/lib/storage-path"
import { invalidarCacheStorage } from "@/lib/storage-quota"

const COLUMNAS_ARCHIVO: Record<string, string[]> = {
  noticias: ["imagen_principal"],
  normativa: ["archivo_pdf"],
  autoridades: ["foto"],
  usuarios: ["avatar_url"],
  configuracion: ["logo_url", "alcalde_foto", "fondo_url"],
  galeria: ["imagen"],
  tramites: ["formulario_pdf"],
  transparencia: ["archivo_pdf"],
  contrataciones: ["archivo_pdf"],
  concejo_sesiones: ["acta_pdf"],
  concejo_comisiones: ["acta_pdf", "documento_pdf"],
}

async function urlEstaEnUso(url: string, ignorar: { tabla: string; id: string } | null): Promise<boolean> {
  const admin = createAdminClient()

  for (const [tabla, columnas] of Object.entries(COLUMNAS_ARCHIVO)) {
    for (const columna of columnas) {
      let q = admin.from(tabla).select("id").eq(columna, url).limit(1)
      if (ignorar && ignorar.tabla === tabla) q = q.neq("id", ignorar.id)
      const { data } = await q
      if (data && data.length > 0) return true
    }
  }

  return false
}

export async function DELETE(request: Request) {
  let permiso
  try {
    permiso = await requirePermiso("galeria", "eliminar")
  } catch {
    return NextResponse.json({ error: "No tienes permiso para eliminar archivos" }, { status: 403 })
  }
  if (!permiso) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const url = searchParams.get("url")

  if (!url) {
    return NextResponse.json({ error: "Falta la url del archivo" }, { status: 400 })
  }

  const ref = storageRefDesdeUrl(url)
  if (!ref) {
    return NextResponse.json({ error: "La url no pertenece al almacenamiento del portal" }, { status: 400 })
  }

  const enUso = await urlEstaEnUso(url, null)
  if (enUso) {
    return NextResponse.json(
      { error: "El archivo está siendo usado por otro registro. Actualiza o elimina ese registro primero." },
      { status: 409 }
    )
  }

  const admin = createAdminClient()
  const { error } = await admin.storage.from(ref.bucket).remove([ref.path])
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  invalidarCacheStorage()
  return NextResponse.json({ message: "Archivo eliminado", bucket: ref.bucket, path: ref.path })
}
