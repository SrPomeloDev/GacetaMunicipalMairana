import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { tipoPermisos } from "@/lib/roles"

export async function GET(
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
    return NextResponse.json({ error: "Solo un administrador puede ver usuarios" }, { status: 403 })
  }

  const admin = createAdminClient()
  const { data: { user }, error: authError } = await admin.auth.admin.getUserById(id)
  if (authError) return NextResponse.json({ error: authError.message }, { status: 500 })

  const { data: usuario, error } = await admin
    .from("usuarios")
    .select("*")
    .eq("id", id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    usuario,
    permisos: (user?.user_metadata?.permisos as Record<string, unknown> | undefined) ?? null,
  })
}

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
    .update(update as never)
    .eq("id", id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (body.rol !== undefined || body.permisos !== undefined) {
    const { data: { user: existing } } = await admin.auth.admin.getUserById(id)
    const currentMeta = (existing?.user_metadata as Record<string, unknown>) ?? {}
    const newMeta: Record<string, unknown> = { ...currentMeta }

    if (body.rol !== undefined) newMeta.rol = body.rol
    if (body.permisos !== undefined) {
      const permisos = tipoPermisos(body.permisos)
      if (!permisos) {
        return NextResponse.json({ error: "Formato de permisos inválido" }, { status: 400 })
      }
      newMeta.permisos = permisos
    }

    const { error: metaError } = await admin.auth.admin.updateUserById(id, {
      user_metadata: newMeta,
    })
    if (metaError) {
      return NextResponse.json(
        { error: "Usuario actualizado, pero no se pudieron guardar los permisos: " + metaError.message },
        { status: 500 }
      )
    }
  }

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
