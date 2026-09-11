import { NextResponse } from "next/server"
import { requirePermiso, type PermisosUsuario } from "@/lib/permisos-server"
import { normativaInsertSchema } from "@/lib/validations/normativa"
import { sanitizeHtml } from "@/lib/sanitize"

export async function POST(request: Request) {
  let permiso: PermisosUsuario | null
  try {
    permiso = await requirePermiso("normativa", "crear")
  } catch {
    return NextResponse.json({ error: "No tienes permiso para crear normativa" }, { status: 403 })
  }
  if (!permiso) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const body = await request.json()
  const parsed = normativaInsertSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
  }

  const { data, error } = await permiso.supabase
    .from("normativa")
    .insert({
      ...parsed.data,
      contenido_texto: parsed.data.contenido_texto
        ? sanitizeHtml(parsed.data.contenido_texto)
        : parsed.data.contenido_texto,
      created_by: permiso.id,
    } as never)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
