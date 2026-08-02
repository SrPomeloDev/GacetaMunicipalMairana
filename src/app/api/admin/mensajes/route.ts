import { NextResponse } from "next/server"
import { requireVerModulo, requirePermiso, type PermisosUsuario } from "@/lib/permisos-server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(request: Request) {
  let permiso: PermisosUsuario | null
  try {
    permiso = await requireVerModulo("mensajes")
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }
  if (!permiso) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const soloNoLeidos = searchParams.get("no_leidos") === "true"
  const categoria = searchParams.get("categoria")
  const estado = searchParams.get("estado")

  let query = permiso.supabase.from("contacto_mensajes").select("*")
  if (soloNoLeidos) query = query.eq("leido", false)
  if (categoria) query = query.eq("categoria", categoria)
  if (estado) query = query.eq("estado", estado)
  query = query.order("created_at", { ascending: false })

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(request: Request) {
  let permiso: PermisosUsuario | null
  try {
    permiso = await requirePermiso("mensajes", "eliminar")
  } catch {
    return NextResponse.json({ error: "No tienes permiso para eliminar mensajes" }, { status: 403 })
  }
  if (!permiso) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { ids } = await request.json().catch(() => ({ ids: [] as string[] }))
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "Debes seleccionar al menos un mensaje" }, { status: 400 })
  }

  const admin = createAdminClient()
  const { error } = await admin.from("contacto_mensajes").delete().in("id", ids)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ message: `${ids.length} mensaje(s) eliminado(s)` })
}