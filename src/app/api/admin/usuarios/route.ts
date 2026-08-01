import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { data: rol } = await supabase.rpc("current_user_role")
  if (rol !== "admin") {
    return NextResponse.json({ error: "Solo un administrador puede crear usuarios" }, { status: 403 })
  }

  const body = await request.json()
  const { nombre, email, password, rol: nuevoRol, dependencia_id } = body

  if (!nombre || !email || !password || !nuevoRol) {
    return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 })
  }

  const admin = createAdminClient()

  const { data: user, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nombre, rol: nuevoRol },
  })

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 })
  }

  const { error } = await admin
    .from("usuarios")
    .upsert({
      id: user.id,
      nombre,
      email,
      rol: nuevoRol,
      dependencia_id: dependencia_id || null,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(user, { status: 201 })
}
