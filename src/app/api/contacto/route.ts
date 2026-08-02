import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

const CATEGORIAS = ["general", "tramite", "reclamo", "denuncia", "sugerencia", "informacion_publica", "normativa"]

export async function POST(request: Request) {
  const body = await request.json()
  const categoria = CATEGORIAS.includes(body.categoria) ? body.categoria : "general"
  const anonimo = Boolean(body.anonimo)

  const nombre = typeof body.nombre === "string" ? body.nombre.trim() : ""
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
  const asunto = typeof body.asunto === "string" ? body.asunto.trim() : ""
  const mensaje = typeof body.mensaje === "string" ? body.mensaje.trim() : ""

  if (!mensaje) {
    return NextResponse.json({ error: "El mensaje es obligatorio" }, { status: 400 })
  }

  if (!anonimo) {
    if (!nombre || !email) {
      return NextResponse.json({ error: "Nombre y correo son obligatorios para mensajes no anónimos" }, { status: 400 })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Correo electrónico inválido" }, { status: 400 })
    }
  }

  const admin = createAdminClient()
  const { error } = await admin.from("contacto_mensajes").insert({
    nombre: anonimo ? "Anónimo" : nombre,
    email: anonimo ? "" : email,
    asunto: asunto || null,
    mensaje,
    categoria,
    anonimo,
    leido: false,
  } as never)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ message: anonimo && categoria === "denuncia"
    ? "Denuncia recibida. Agradecemos tu confianza."
    : "Mensaje enviado correctamente" }, { status: 201 })
}