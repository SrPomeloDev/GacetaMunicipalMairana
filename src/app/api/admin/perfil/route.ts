import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function PATCH(request: Request) {
  const supabase = await createServerSupabaseClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const body = await request.json()

  const perfil: Record<string, unknown> = {}
  if (body.nombre !== undefined) {
    if (typeof body.nombre !== "string" || !body.nombre.trim() || body.nombre.trim().length > 120) {
      return NextResponse.json({ error: "El nombre es obligatorio (máximo 120 caracteres)" }, { status: 400 })
    }
    perfil.nombre = body.nombre.trim()
  }
  if (body.avatar_url !== undefined) {
    if (body.avatar_url !== null && body.avatar_url !== "") {
      if (typeof body.avatar_url !== "string" || body.avatar_url.length > 2048) {
        return NextResponse.json({ error: "URL de avatar inválida" }, { status: 400 })
      }
      const avatar = body.avatar_url.trim()
      if (!avatar.startsWith("/") && !/^https:\/\//i.test(avatar)) {
        return NextResponse.json({ error: "URL de avatar inválida" }, { status: 400 })
      }
      perfil.avatar_url = avatar
    } else {
      perfil.avatar_url = null
    }
  }

  if (Object.keys(perfil).length > 0) {
    const { error } = await supabase
      .from("usuarios")
      .update(perfil as never)
      .eq("id", authUser.id)
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
    const { data: { user: existing } } = await admin.auth.admin.getUserById(authUser.id)
    const currentMeta = (existing?.user_metadata as Record<string, unknown>) ?? {}
    const { error: metaError } = await admin.auth.admin.updateUserById(authUser.id, {
      user_metadata: { ...currentMeta, ...meta },
    })
    if (metaError) {
      return NextResponse.json({ error: metaError.message }, { status: 500 })
    }
  }

  return NextResponse.json({ message: "Perfil actualizado" })
}
