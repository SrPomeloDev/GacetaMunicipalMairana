import { NextResponse } from "next/server"
import { requireVerModulo, requirePermiso, type PermisosUsuario } from "@/lib/permisos-server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET() {
  let permiso: PermisosUsuario | null
  try {
    permiso = await requireVerModulo("suscripciones")
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }
  if (!permiso) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { data, error } = await permiso.supabase
    .from("suscripciones")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(request: Request) {
  let permiso: PermisosUsuario | null
  try {
    permiso = await requirePermiso("suscripciones", "eliminar")
  } catch {
    return NextResponse.json({ error: "No tienes permiso para eliminar suscripciones" }, { status: 403 })
  }
  if (!permiso) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { ids } = await request.json().catch(() => ({ ids: [] as string[] }))
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "Selecciona al menos una suscripción" }, { status: 400 })
  }

  const admin = createAdminClient()
  const { error } = await admin.from("suscripciones").delete().in("id", ids)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ message: `${ids.length} suscripción(es) eliminada(s)` })
}
