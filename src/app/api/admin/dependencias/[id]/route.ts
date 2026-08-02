import { NextResponse } from "next/server"
import { requireVerModulo, requirePermiso, type PermisosUsuario } from "@/lib/permisos-server"
import { createAdminClient } from "@/lib/supabase/admin"
import { slugify } from "@/lib/utils"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  let permiso: PermisosUsuario | null
  try {
    permiso = await requireVerModulo("dependencias")
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }
  if (!permiso) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { data, error } = await permiso.supabase.from("dependencias").select("*").eq("id", id).single()
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
    permiso = await requirePermiso("dependencias", "editar")
  } catch {
    return NextResponse.json({ error: "No tienes permiso para editar dependencias" }, { status: 403 })
  }
  if (!permiso) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await request.json()
  const admin = createAdminClient()

  const update: Record<string, unknown> = {}
  if (body.nombre !== undefined) {
    update.nombre = body.nombre
    if (body.slug === undefined) update.slug = slugify(body.nombre)
  }
  if (body.slug !== undefined) update.slug = body.slug
  if (body.tipo !== undefined) update.tipo = body.tipo
  if (body.descripcion !== undefined) update.descripcion = body.descripcion || null
  if (body.telefono !== undefined) update.telefono = body.telefono || null
  if (body.correo !== undefined) update.correo = body.correo || null
  if (body.horario !== undefined) update.horario = body.horario || null
  if (body.orden !== undefined) update.orden = Number(body.orden ?? 0)

  const { data, error } = await admin
    .from("dependencias")
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
    permiso = await requirePermiso("dependencias", "eliminar")
  } catch {
    return NextResponse.json({ error: "No tienes permiso para eliminar dependencias" }, { status: 403 })
  }
  if (!permiso) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const admin = createAdminClient()
  const { error } = await admin.from("dependencias").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ message: "Dependencia eliminada" })
}
