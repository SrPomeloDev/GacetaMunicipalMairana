import { NextResponse } from "next/server"
import { requireVerModulo, requirePermiso, type PermisosUsuario } from "@/lib/permisos-server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  let permiso: PermisosUsuario | null
  try {
    permiso = await requireVerModulo("transparencia")
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }
  if (!permiso) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { data, error } = await permiso.supabase.from("transparencia").select("*").eq("id", id).single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  let permiso: PermisosUsuario | null
  try {
    permiso = await requirePermiso("transparencia", "editar")
  } catch {
    return NextResponse.json({ error: "No tienes permiso para editar documentos de transparencia" }, { status: 403 })
  }
  if (!permiso) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await request.json()
  const admin = createAdminClient()

  const update: Record<string, unknown> = {}
  if (body.titulo !== undefined) update.titulo = body.titulo
  if (body.categoria !== undefined) update.categoria = body.categoria
  if (body.descripcion !== undefined) update.descripcion = body.descripcion || null
  if (body.archivo_pdf !== undefined) update.archivo_pdf = body.archivo_pdf || null
  if (body.fecha !== undefined) update.fecha = body.fecha || null
  if (body.publicada !== undefined) update.publicada = body.publicada

  const { data, error } = await admin
    .from("transparencia")
    .update(update as never)
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
    permiso = await requirePermiso("transparencia", "eliminar")
  } catch {
    return NextResponse.json({ error: "No tienes permiso para eliminar documentos de transparencia" }, { status: 403 })
  }
  if (!permiso) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const admin = createAdminClient()
  const { error } = await admin.from("transparencia").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ message: "Documento eliminado" })
}
