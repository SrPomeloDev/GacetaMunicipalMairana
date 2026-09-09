import { NextResponse } from "next/server"
import { requireVerModulo, requirePermiso, type PermisosUsuario } from "@/lib/permisos-server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET() {
  let permiso: PermisosUsuario | null
  try {
    permiso = await requireVerModulo("autoridades")
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }
  if (!permiso) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { data, error } = await permiso.supabase.from("autoridades").select("*").order("orden")
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  let permiso: PermisosUsuario | null
  try {
    permiso = await requirePermiso("autoridades", "crear")
  } catch {
    return NextResponse.json({ error: "No tienes permiso para crear autoridades" }, { status: 403 })
  }
  if (!permiso) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await request.json()
  const admin = createAdminClient()

  const { data, error } = await admin
    .from("autoridades")
    .insert({
      nombre_completo: body.nombre_completo,
      cargo: body.cargo,
      dependencia_id: body.dependencia_id || null,
      tipo_autoridad: body.tipo_autoridad,
      partido: body.partido || null,
      foto: body.foto || null,
      biografia: body.biografia || null,
      formacion: body.formacion || null,
      funciones: body.funciones || null,
      telefono: body.telefono || null,
      correo: body.correo || null,
      activo: body.activo ?? true,
      orden: Number(body.orden ?? 0),
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
