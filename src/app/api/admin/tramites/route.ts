import { NextResponse } from "next/server"
import { requireVerModulo, requirePermiso, type PermisosUsuario } from "@/lib/permisos-server"
import { createAdminClient } from "@/lib/supabase/admin"
import { slugify } from "@/lib/utils"

export async function GET() {
  let permiso: PermisosUsuario | null
  try {
    permiso = await requireVerModulo("tramites")
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }
  if (!permiso) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { data, error } = await permiso.supabase
    .from("tramites")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  let permiso: PermisosUsuario | null
  try {
    permiso = await requirePermiso("tramites", "crear")
  } catch {
    return NextResponse.json({ error: "No tienes permiso para crear trámites" }, { status: 403 })
  }
  if (!permiso) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await request.json()
  const admin = createAdminClient()

  const { data, error } = await admin
    .from("tramites")
    .insert({
      titulo: body.titulo,
      slug: body.slug || slugify(body.titulo),
      descripcion: body.descripcion || null,
      requisitos: body.requisitos ?? [],
      dependencia_id: body.dependencia_id || null,
      tiempo_estimado: body.tiempo_estimado || null,
      costo: body.costo || null,
      formulario_pdf: body.formulario_pdf || null,
      activo: body.activo ?? true,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
