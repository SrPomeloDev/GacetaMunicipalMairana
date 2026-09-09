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
    permiso = await requireVerModulo("autoridades")
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }
  if (!permiso) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { data, error } = await permiso.supabase.from("autoridades").select("*").eq("id", id).single()
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
    permiso = await requirePermiso("autoridades", "editar")
  } catch {
    return NextResponse.json({ error: "No tienes permiso para editar autoridades" }, { status: 403 })
  }
  if (!permiso) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await request.json()
  const admin = createAdminClient()

  const update: Record<string, unknown> = {}
  if (body.nombre_completo !== undefined) update.nombre_completo = body.nombre_completo
  if (body.cargo !== undefined) update.cargo = body.cargo
  if (body.dependencia_id !== undefined) update.dependencia_id = body.dependencia_id || null
  if (body.tipo_autoridad !== undefined) update.tipo_autoridad = body.tipo_autoridad
  if (body.partido !== undefined) update.partido = body.partido || null
  if (body.foto !== undefined) update.foto = body.foto || null
  if (body.biografia !== undefined) update.biografia = body.biografia || null
  if (body.formacion !== undefined) update.formacion = body.formacion || null
  if (body.funciones !== undefined) update.funciones = body.funciones || null
  if (body.telefono !== undefined) update.telefono = body.telefono || null
  if (body.correo !== undefined) update.correo = body.correo || null
  if (body.activo !== undefined) update.activo = body.activo
  if (body.orden !== undefined) update.orden = Number(body.orden ?? 0)

  const { data, error } = await admin
    .from("autoridades")
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
    permiso = await requirePermiso("autoridades", "eliminar")
  } catch {
    return NextResponse.json({ error: "No tienes permiso para eliminar autoridades" }, { status: 403 })
  }
  if (!permiso) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const admin = createAdminClient()
  const { error } = await admin.from("autoridades").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ message: "Autoridad eliminada" })
}
