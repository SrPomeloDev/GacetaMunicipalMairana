import { NextResponse } from "next/server"
import { requireVerModulo, requirePermiso, type PermisosUsuario } from "@/lib/permisos-server"
import { createAdminClient } from "@/lib/supabase/admin"
import { contratacionUpdateSchema } from "@/lib/validations/contrataciones"

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
  const parsed = contratacionUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
  }
  const admin = createAdminClient()

  const update: Record<string, unknown> = {}
  if (parsed.data.titulo !== undefined) update.titulo = parsed.data.titulo
  if (parsed.data.slug !== undefined) update.slug = parsed.data.slug
  if (parsed.data.tipo !== undefined) update.tipo = parsed.data.tipo
  if (parsed.data.modalidad !== undefined) update.modalidad = parsed.data.modalidad ?? null
  if (parsed.data.objeto !== undefined) update.objeto = parsed.data.objeto ?? null
  if (parsed.data.monto !== undefined) update.monto = parsed.data.monto ?? null
  if (parsed.data.empresa_adjudicada !== undefined) update.empresa_adjudicada = parsed.data.empresa_adjudicada ?? null
  if (parsed.data.fecha_publicacion !== undefined) update.fecha_publicacion = parsed.data.fecha_publicacion
  if (parsed.data.fecha_presentacion !== undefined) update.fecha_presentacion = parsed.data.fecha_presentacion ?? null
  if (parsed.data.fecha_adjudicacion !== undefined) update.fecha_adjudicacion = parsed.data.fecha_adjudicacion ?? null
  if (parsed.data.archivo_pdf !== undefined) update.archivo_pdf = parsed.data.archivo_pdf ?? null
  if (parsed.data.estado !== undefined) update.estado = parsed.data.estado
  if (parsed.data.publicada !== undefined) update.publicada = parsed.data.publicada

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
