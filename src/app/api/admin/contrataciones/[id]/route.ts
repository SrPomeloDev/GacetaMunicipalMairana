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
    permiso = await requireVerModulo("contrataciones")
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }
  if (!permiso) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { data, error } = await permiso.supabase.from("contrataciones").select("*").eq("id", id).single()
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
    permiso = await requirePermiso("contrataciones", "editar")
  } catch {
    return NextResponse.json({ error: "No tienes permiso para editar contrataciones" }, { status: 403 })
  }
  if (!permiso) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await request.json()
  const admin = createAdminClient()

  const update: Record<string, unknown> = {}
  if (body.titulo !== undefined) update.titulo = body.titulo
  if (body.slug !== undefined) update.slug = body.slug
  if (body.tipo !== undefined) update.tipo = body.tipo
  if (body.modalidad !== undefined) update.modalidad = body.modalidad || null
  if (body.objeto !== undefined) update.objeto = body.objeto || null
  if (body.monto !== undefined) update.monto = body.monto ?? null
  if (body.empresa_adjudicada !== undefined) update.empresa_adjudicada = body.empresa_adjudicada || null
  if (body.fecha_publicacion !== undefined) update.fecha_publicacion = body.fecha_publicacion
  if (body.fecha_presentacion !== undefined) update.fecha_presentacion = body.fecha_presentacion || null
  if (body.fecha_adjudicacion !== undefined) update.fecha_adjudicacion = body.fecha_adjudicacion || null
  if (body.archivo_pdf !== undefined) update.archivo_pdf = body.archivo_pdf || null
  if (body.estado !== undefined) update.estado = body.estado
  if (body.publicada !== undefined) update.publicada = body.publicada

  const { data, error } = await admin
    .from("contrataciones")
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
    permiso = await requirePermiso("contrataciones", "eliminar")
  } catch {
    return NextResponse.json({ error: "No tienes permiso para eliminar contrataciones" }, { status: 403 })
  }
  if (!permiso) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const admin = createAdminClient()
  const { error } = await admin.from("contrataciones").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ message: "Contratación eliminada" })
}
