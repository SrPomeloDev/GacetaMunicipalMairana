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
    permiso = await requireVerModulo("tramites")
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }
  if (!permiso) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { data, error } = await permiso.supabase.from("tramites").select("*").eq("id", id).single()
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
    permiso = await requirePermiso("tramites", "editar")
  } catch {
    return NextResponse.json({ error: "No tienes permiso para editar trámites" }, { status: 403 })
  }
  if (!permiso) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await request.json()
  const admin = createAdminClient()

  const update: Record<string, unknown> = {}
  if (body.titulo !== undefined) {
    update.titulo = body.titulo
    if (body.slug === undefined) update.slug = slugify(body.titulo)
  }
  if (body.slug !== undefined) update.slug = body.slug
  if (body.descripcion !== undefined) update.descripcion = body.descripcion || null
  if (body.requisitos !== undefined) update.requisitos = body.requisitos
  if (body.dependencia_id !== undefined) update.dependencia_id = body.dependencia_id || null
  if (body.tiempo_estimado !== undefined) update.tiempo_estimado = body.tiempo_estimado || null
  if (body.costo !== undefined) update.costo = body.costo || null
  if (body.formulario_pdf !== undefined) update.formulario_pdf = body.formulario_pdf || null
  if (body.activo !== undefined) update.activo = body.activo

  const { data, error } = await admin
    .from("tramites")
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
    permiso = await requirePermiso("tramites", "eliminar")
  } catch {
    return NextResponse.json({ error: "No tienes permiso para eliminar trámites" }, { status: 403 })
  }
  if (!permiso) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const admin = createAdminClient()
  const { error } = await admin.from("tramites").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ message: "Trámite eliminado" })
}
