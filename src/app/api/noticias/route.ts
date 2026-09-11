import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import type { Noticia } from "@/types"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const supabase = await createServerSupabaseClient()

  const categoria = searchParams.get("categoria")
  const destacada = searchParams.get("destacada")
  const rawPage = parseInt(searchParams.get("page") || "1")
  const rawLimit = parseInt(searchParams.get("limit") || "20")
  const page = Number.isFinite(rawPage) && rawPage >= 1 ? Math.floor(rawPage) : 1
  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(Math.floor(rawLimit), 1), 50) : 20
  const offset = (page - 1) * limit

  let dbQuery = supabase
    .from("noticias")
    .select("*", { count: "exact" })
    .eq("publicada", true)
    .order("fecha_publicacion", { ascending: false })
    .range(offset, offset + limit - 1)

  if (categoria) dbQuery = dbQuery.eq("categoria", categoria as Noticia["categoria"])
  if (destacada === "true") dbQuery = dbQuery.eq("destacada", true)

  const { data, count, error } = await dbQuery

  if (error) return NextResponse.json({ error: "No se pudo cargar la información" }, { status: 500 })
  return NextResponse.json({ data, count, page, limit })
}
