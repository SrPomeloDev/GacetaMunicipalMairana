import { NextResponse } from "next/server"
import { requireVerModulo, requirePermiso, type PermisosUsuario } from "@/lib/permisos-server"
import { createAdminClient } from "@/lib/supabase/admin"
import { slugify } from "@/lib/utils"
import { dependenciaUpdateSchema } from "@/lib/validations/dependencias"

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
  const parsed = dependenciaUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
  }
  const admin = createAdminClient()

  const update: Record<string, unknown> = {}
  if (parsed.data.nombre !== undefined) {
    update.nombre = parsed.data.nombre
    if (parsed.data.slug === undefined) update.slug = slugify(parsed.data.nombre)
  }
  if (parsed.data.slug !== undefined) update.slug = parsed.data.slug
  if (parsed.data.tipo !== undefined) update.tipo = parsed.data.tipo
  if (parsed.data.descripcion !== undefined) update.descripcion = parsed.data.descripcion ?? null
  if (parsed.data.telefono !== undefined) update.telefono = parsed.data.telefono ?? null
  if (parsed.data.correo !== undefined) update.correo = parsed.data.correo ?? null
  if (parsed.data.horario !== undefined) update.horario = parsed.data.horario ?? null
  if (parsed.data.orden !== undefined) update.orden = Number(parsed.data.orden ?? 0)

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
