import { NextResponse } from "next/server"
import { requirePermiso, type PermisosUsuario } from "@/lib/permisos-server"
import { noticiaInsertSchema } from "@/lib/validations/noticias"
import { sanitizeHtml } from "@/lib/sanitize"

export async function POST(request: Request) {
  let permiso: PermisosUsuario | null
  try {
    permiso = await requirePermiso("noticias", "crear")
  } catch {
    return NextResponse.json({ error: "No tienes permiso para crear noticias" }, { status: 403 })
  }
  if (!permiso) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const body = await request.json()
  const parsed = noticiaInsertSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
  }

  const { data, error } = await permiso.supabase
    .from("noticias")
    .insert({
      ...parsed.data,
      contenido: parsed.data.contenido
        ? sanitizeHtml(parsed.data.contenido)
        : parsed.data.contenido,
      autor_id: permiso.id,
    } as never)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
