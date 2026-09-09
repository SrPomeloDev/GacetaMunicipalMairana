import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { tipoPermisos } from "@/lib/roles"
import { usuarioEditarSchema } from "@/lib/validations/usuarios"

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
  if (body.id !== undefined && body.id !== id) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
  }
  const parsed = usuarioEditarSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
  }
  const admin = createAdminClient()

  const update: Record<string, unknown> = {}
  if (parsed.data.nombre !== undefined) update.nombre = parsed.data.nombre
  if (parsed.data.rol !== undefined) update.rol = parsed.data.rol
  if (parsed.data.activo !== undefined) update.activo = parsed.data.activo
  if (parsed.data.dependencia_id !== undefined) update.dependencia_id = parsed.data.dependencia_id

  const { data: usuario, error } = Object.keys(update).length > 0
    ? await admin
        .from("usuarios")
        .update(update as never)
        .eq("id", id)
        .select()
        .single()
    : { data: null, error: null }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (parsed.data.rol !== undefined || parsed.data.permisos !== undefined) {
    const { data: { user: existing } } = await admin.auth.admin.getUserById(id)
    const currentMeta = (existing?.user_metadata as Record<string, unknown>) ?? {}
    const newMeta: Record<string, unknown> = { ...currentMeta }

    if (parsed.data.rol !== undefined) newMeta.rol = parsed.data.rol
    if (parsed.data.permisos !== undefined) {
      const permisos = tipoPermisos(parsed.data.permisos)
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

  if (parsed.data.password !== undefined) {
    const { error: passError } = await admin.auth.admin.updateUserById(id, {
      password: parsed.data.password,
    })
    if (passError) {
      return NextResponse.json(
        { error: "Usuario actualizado, pero no se pudo cambiar la contraseña: " + passError.message },
        { status: 500 }
      )
    }
  }

  return NextResponse.json(usuario ?? { ok: true })
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
