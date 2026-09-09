import { NextResponse } from "next/server"
import { requireVerModulo, requirePermiso, type PermisosUsuario } from "@/lib/permisos-server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET() {
  let permiso: PermisosUsuario | null
  try {
    permiso = await requireVerModulo("configuracion")
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }
  if (!permiso) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { data, error } = await permiso.supabase.from("configuracion").select("*").eq("id", 1).maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PUT(request: Request) {
  let permiso: PermisosUsuario | null
  try {
    permiso = await requirePermiso("configuracion", "editar")
  } catch {
    return NextResponse.json({ error: "No tienes permiso para editar la configuración" }, { status: 403 })
  }
  if (!permiso) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await request.json()
  const admin = createAdminClient()

  const upsert: Record<string, unknown> = { id: 1 }
  if (body.municipio !== undefined) upsert.municipio = body.municipio
  if (body.lema !== undefined) upsert.lema = body.lema || null
  if (body.direccion !== undefined) upsert.direccion = body.direccion || null
  if (body.telefono !== undefined) upsert.telefono = body.telefono || null
  if (body.email !== undefined) upsert.email = body.email || null
  if (body.facebook !== undefined) upsert.facebook = body.facebook || null
  if (body.twitter !== undefined) upsert.twitter = body.twitter || null
  if (body.youtube !== undefined) upsert.youtube = body.youtube || null
  if (body.instagram !== undefined) upsert.instagram = body.instagram || null
  if (body.color_primario !== undefined) upsert.color_primario = body.color_primario
  if (body.logo_url !== undefined) upsert.logo_url = body.logo_url || null

  const { data, error } = await admin
    .from("configuracion")
    .upsert(upsert as never)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
