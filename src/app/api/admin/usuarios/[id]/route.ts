import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { data: rol } = await supabase.rpc("current_user_role")
  if (rol !== "admin") {
    return NextResponse.json({ error: "Solo un administrador puede modificar usuarios" }, { status: 403 })
  }

  const body = await request.json()
  const admin = createAdminClient()

  const update: Record<string, unknown> = {}
  if (body.nombre !== undefined) update.nombre = body.nombre
  if (body.rol !== undefined) update.rol = body.rol
  if (body.activo !== undefined) update.activo = body.activo
  if (body.dependencia_id !== undefined) update.dependencia_id = body.dependencia_id

  const { data: usuario, error } = await admin
    .from("usuarios")
    .update(update)
    .eq("id", id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(usuario)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { data: rol } = await supabase.rpc("current_user_role")
  if (rol !== "admin") {
    return NextResponse.json({ error: "Solo un administrador puede eliminar usuarios" }, { status: 403 })
  }

  if (session.user.id === id) {
    return NextResponse.json({ error: "No puedes eliminar tu propia cuenta" }, { status: 400 })
  }

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.deleteUser(id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ message: "Usuario eliminado" })
}
