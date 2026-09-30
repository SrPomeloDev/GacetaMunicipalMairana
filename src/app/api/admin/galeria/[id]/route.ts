import { NextResponse } from "next/server"
import { requireVerModulo, requirePermiso, type PermisosUsuario } from "@/lib/permisos-server"
import { createAdminClient } from "@/lib/supabase/admin"
import { borrarArchivoStorage } from "@/lib/storage-cleanup"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  let permiso: PermisosUsuario | null
  try {
    permiso = await requireVerModulo("galeria")
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }
  if (!permiso) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { data, error } = await permiso.supabase.from("galeria").select("*").eq("id", id).single()
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
    permiso = await requirePermiso("galeria", "editar")
  } catch {
    return NextResponse.json({ error: "No tienes permiso para editar imágenes" }, { status: 403 })
  }
  if (!permiso) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await request.json()
  const admin = createAdminClient()

  const update: Record<string, unknown> = {}
  if (body.titulo !== undefined) update.titulo = body.titulo
  if (body.descripcion !== undefined) update.descripcion = body.descripcion || null
  if (body.imagen !== undefined) update.imagen = body.imagen
  if (body.album !== undefined) update.album = body.album || "General"
  if (body.fecha !== undefined) update.fecha = body.fecha || null
  if (body.orden !== undefined) update.orden = Number(body.orden ?? 0)

  const { data, error } = await admin
    .from("galeria")
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
    permiso = await requirePermiso("galeria", "eliminar")
  } catch {
    return NextResponse.json({ error: "No tienes permiso para eliminar imágenes" }, { status: 403 })
  }
  if (!permiso) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const admin = createAdminClient()

  const { data: row } = await admin.from("galeria").select("imagen").eq("id", id).single()
  const imagen = (row as { imagen: string } | null)?.imagen

  const { error } = await admin.from("galeria").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await borrarArchivoStorage(imagen)

  return NextResponse.json({ message: "Imagen eliminada" })
}
