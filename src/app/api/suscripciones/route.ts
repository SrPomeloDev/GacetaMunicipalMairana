import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : ""

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Ingresa un correo electrónico válido" }, { status: 400 })
  }

  const categorias = Array.isArray(body?.categorias)
    ? body.categorias.filter((c: unknown) => typeof c === "string")
    : []

  const admin = createAdminClient()

  const { data: existingData } = await admin
    .from("suscripciones")
    .select("id,activo")
    .eq("email", email)
    .maybeSingle()
  const existing = existingData as { id: string; activo: boolean } | null

  if (existing) {
    if (existing.activo) {
      return NextResponse.json({ message: "Este correo ya está suscrito a la Gaceta" }, { status: 200 })
    }
    const { data, error } = await admin
      .from("suscripciones")
      .update({ activo: true, categorias: categorias.length ? categorias : null } as never)
      .eq("id", existing.id)
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ message: "Suscripción reactivada", data }, { status: 200 })
  }

  const { data, error } = await admin
    .from("suscripciones")
    .insert({ email, categorias: categorias.length ? categorias : null } as never)
    .select()
    .single()

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ message: "Este correo ya está suscrito a la Gaceta" }, { status: 200 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: "¡Suscripción exitosa! Recibirás las novedades de la Gaceta Municipal.", data }, { status: 201 })
}
