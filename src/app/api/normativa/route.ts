import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const supabase = await createServerSupabaseClient()

  const categoria = searchParams.get("categoria")
  const estado = searchParams.get("estado")
  const query = searchParams.get("q")
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "20")
  const offset = (page - 1) * limit

  let dbQuery = supabase
    .from("normativa")
    .select("*, categoria:categorias_normativa(*), dependencia:dependencias(*)", { count: "exact" })
    .eq("publicada", true)
    .order("fecha_publicacion", { ascending: false })
    .range(offset, offset + limit - 1)

  if (categoria) dbQuery = dbQuery.eq("categoria_id", categoria)
  if (estado) dbQuery = dbQuery.eq("estado", estado)
  if (query) dbQuery = dbQuery.textSearch("search_vector", query, { config: "spanish" })

  const { data, count, error } = await dbQuery

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data, count, page, limit })
}
