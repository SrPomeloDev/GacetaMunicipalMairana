import { NextResponse } from "next/server"
import { requireVerModulo, requirePermiso, type PermisosUsuario } from "@/lib/permisos-server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET() {
  let permiso: PermisosUsuario | null
  try {
    permiso = await requireVerModulo("concejo")
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }
  if (!permiso) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { data, error } = await permiso.supabase
    .from("concejales_comisiones")
    .select("*, autoridad:autoridades(nombre_completo)")
    .order("comision")
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  let permiso: PermisosUsuario | null
  try {
    permiso = await requirePermiso("concejo", "crear")
  } catch {
    return NextResponse.json({ error: "No tienes permiso para crear comisiones" }, { status: 403 })
  }
  if (!permiso) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await request.json()
  const admin = createAdminClient()

  const autoridad_id = typeof body.autoridad_id === "string" ? body.autoridad_id : ""
  const comision = typeof body.comision === "string" ? body.comision.trim() : ""
  const cargo = typeof body.cargo_comision === "string" ? body.cargo_comision.trim().toLowerCase() : ""
  if (!autoridad_id || !comision) {
    return NextResponse.json({ error: "El concejal y la comisión son obligatorios" }, { status: 400 })
  }
  if (!["presidente", "secretario", "vocal", "miembro"].includes(cargo)) {
    return NextResponse.json({ error: "Cargo inválido: debe ser Presidente, Secretario, Vocal o Miembro" }, { status: 400 })
  }

  const { data, error } = await admin
    .from("concejales_comisiones")
    .insert({
      autoridad_id,
      comision,
      cargo_comision: cargo,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
