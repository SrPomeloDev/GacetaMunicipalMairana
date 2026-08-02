import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function PATCH(request: Request) {
  const supabase = await createServerSupabaseClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const body = await request.json()

  const perfil: Record<string, unknown> = {}
  if (body.nombre !== undefined) {
    if (typeof body.nombre !== "string" || !body.nombre.trim()) {
      return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 })
    }
    perfil.nombre = body.nombre.trim()
  }
  if (body.avatar_url !== undefined) perfil.avatar_url = body.avatar_url || null

  if (Object.keys(perfil).length > 0) {
    const { data: usuario, error } = await supabase
      .from("usuarios")
      .update(perfil as never)
      .eq("id", session.user.id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const meta: Record<string, unknown> = {}
  if (body.nombre !== undefined) meta.nombre = (body.nombre as string).trim()
  if (body.avatar_url !== undefined) meta.avatar_url = body.avatar_url || null
  if (body.tema !== undefined) {
    if (body.tema !== "light" && body.tema !== "dark") {
      return NextResponse.json({ error: "Tema inválido" }, { status: 400 })
    }
    meta.tema = body.tema
  }

  if (Object.keys(meta).length > 0) {
    const admin = createAdminClient()
    const { data: { user: existing } } = await admin.auth.admin.getUserById(session.user.id)
    const currentMeta = (existing?.user_metadata as Record<string, unknown>) ?? {}
    const { error: metaError } = await admin.auth.admin.updateUserById(session.user.id, {
      user_metadata: { ...currentMeta, ...meta },
    })
    if (metaError) {
      return NextResponse.json({ error: metaError.message }, { status: 500 })
    }
  }

  return NextResponse.json({ message: "Perfil actualizado" })
}
