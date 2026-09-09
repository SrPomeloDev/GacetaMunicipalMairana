import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { checkRateLimit, getClientIp, rateLimitExceededResponse } from "@/lib/rate-limit"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: Request) {
  const rl = checkRateLimit(`suscripciones:${getClientIp(request)}`, { limit: 10, windowMs: 60000 })
  if (!rl.ok) return rateLimitExceededResponse(rl.retryAfter)

  const body = await request.json().catch(() => null)
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : ""

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Ingresa un correo electrónico válido" }, { status: 400 })
  }

  const categorias = Array.isArray(body?.categorias)
    ? body.categorias.filter((c: unknown) => typeof c === "string")
    : []

  if (categorias.length > 10) {
    return NextResponse.json({ error: "Máximo 10 categorías permitidas" }, { status: 400 })
  }
  if (categorias.some((c: string) => c.length > 40)) {
    return NextResponse.json({ error: "Cada categoría no puede superar los 40 caracteres" }, { status: 400 })
  }

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
