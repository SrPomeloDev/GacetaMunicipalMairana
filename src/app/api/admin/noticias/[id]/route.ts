import { NextResponse } from "next/server"
import { requirePermiso, type PermisosUsuario } from "@/lib/permisos-server"
import { noticiaUpdateSchema } from "@/lib/validations/noticias"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  let permiso: PermisosUsuario | null
  try {
    permiso = await requirePermiso("noticias", "editar")
  } catch {
    return NextResponse.json({ error: "No tienes permiso para editar noticias" }, { status: 403 })
  }
  if (!permiso) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const body = await request.json()
  const parsed = noticiaUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
  }

  const { data, error } = await permiso.supabase
    .from("noticias")
    .update(parsed.data as never)
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
    permiso = await requirePermiso("noticias", "eliminar")
  } catch {
    return NextResponse.json({ error: "No tienes permiso para eliminar noticias" }, { status: 403 })
  }
  if (!permiso) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { error } = await permiso.supabase
    .from("noticias")
    .delete()
    .eq("id", id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ message: "Eliminado correctamente" })
}
