import { NextResponse } from "next/server"

export function pgStatus(code?: string | null): number {
  switch (code) {
    case "23505":
      return 409
    case "42501":
      return 403
    case "PGRST116":
      return 404
    default:
      return 500
  }
}

function extractCode(error: unknown): string | null {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code?: unknown }).code
    return typeof code === "string" ? code : null
  }
  return null
}

export function apiError(error: unknown, fallback = "Error interno del servidor") {
  console.error(error)
  const status = pgStatus(extractCode(error))
  if (status === 409) return NextResponse.json({ error: "Registro duplicado" }, { status })
  if (status === 403) return NextResponse.json({ error: "Sin permiso" }, { status })
  if (status === 404) return NextResponse.json({ error: "No encontrado" }, { status })
  return NextResponse.json({ error: fallback }, { status: 500 })
}
