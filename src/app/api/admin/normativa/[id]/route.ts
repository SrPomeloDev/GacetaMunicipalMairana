import { NextResponse } from "next/server"
import { requirePermiso, type PermisosUsuario } from "@/lib/permisos-server"
import { normativaUpdateSchema } from "@/lib/validations/normativa"
import { sanitizeHtml } from "@/lib/sanitize"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  let permiso: PermisosUsuario | null
  try {
    permiso = await requirePermiso("normativa", "editar")
  } catch {
    return NextResponse.json({ error: "No tienes permiso para editar normativa" }, { status: 403 })
  }
  if (!permiso) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const body = await request.json()
  const parsed = normativaUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
  }

  const { data, error } = await permiso.supabase
    .from("normativa")
    .update({
      ...parsed.data,
      ...(parsed.data.contenido_texto !== undefined && parsed.data.contenido_texto !== null
        ? { contenido_texto: sanitizeHtml(parsed.data.contenido_texto) }
        : {}),
    } as never)
    .eq("id", id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  let permiso: PermisosUsuario | null
  try {
    permiso = await requirePermiso("normativa", "eliminar")
  } catch {
    return NextResponse.json({ error: "No tienes permiso para eliminar normativa" }, { status: 403 })
  }
  if (!permiso) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { error } = await permiso.supabase
    .from("normativa")
    .delete()
    .eq("id", id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ message: "Eliminado correctamente" })
}
