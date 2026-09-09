import { NextResponse } from "next/server"
import { requireVerModulo, requirePermiso, type PermisosUsuario } from "@/lib/permisos-server"
import { createAdminClient } from "@/lib/supabase/admin"
import { slugify } from "@/lib/utils"
import { categoriaUpdateSchema } from "@/lib/validations/categorias"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  let permiso: PermisosUsuario | null
  try {
    permiso = await requireVerModulo("categorias")
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }
  if (!permiso) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { data, error } = await permiso.supabase.from("categorias_normativa").select("*").eq("id", id).single()
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
    permiso = await requirePermiso("categorias", "editar")
  } catch {
    return NextResponse.json({ error: "No tienes permiso para editar categorías" }, { status: 403 })
  }
  if (!permiso) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await request.json()
  const parsed = categoriaUpdateSchema.safeParse(body)
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
  if (parsed.data.descripcion !== undefined) update.descripcion = parsed.data.descripcion ?? null
  if (parsed.data.color !== undefined) update.color = parsed.data.color
  if (parsed.data.icono !== undefined) update.icono = parsed.data.icono ?? null
  if (parsed.data.orden !== undefined) update.orden = Number(parsed.data.orden ?? 0)

  const { data, error } = await admin
    .from("categorias_normativa")
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
    permiso = await requirePermiso("categorias", "eliminar")
  } catch {
    return NextResponse.json({ error: "No tienes permiso para eliminar categorías" }, { status: 403 })
  }
  if (!permiso) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const admin = createAdminClient()
  const { error } = await admin.from("categorias_normativa").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ message: "Categoría eliminada" })
}
