import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import type { Normativa } from "@/types"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const supabase = await createServerSupabaseClient()

  const categoria = searchParams.get("categoria")
  const estado = searchParams.get("estado")
  const query = searchParams.get("q")
  const rawPage = parseInt(searchParams.get("page") || "1")
  const rawLimit = parseInt(searchParams.get("limit") || "20")
  const page = Number.isFinite(rawPage) && rawPage >= 1 ? Math.floor(rawPage) : 1
  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(Math.floor(rawLimit), 1), 50) : 20
  const offset = (page - 1) * limit

  const buildBaseQuery = () => {
    let dbQuery = supabase
      .from("normativa")
      .select("*, categoria:categorias_normativa(*), dependencia:dependencias(*)", { count: "exact" })
      .eq("publicada", true)
      .order("fecha_publicacion", { ascending: false })
      .range(offset, offset + limit - 1)

    if (categoria) dbQuery = dbQuery.eq("categoria_id", categoria)
    if (estado) dbQuery = dbQuery.eq("estado", estado as Normativa["estado"])
    return dbQuery
  }

  let data = null
  let count = null
  let error = null

  if (query) {
    const attempted = await buildBaseQuery().textSearch("search_vector", query, { config: "spanish" })
    if (!attempted.error) {
      data = attempted.data
      count = attempted.count
    } else {
      const safe = query
        .replace(/\\/g, "\\\\")
        .replace(/%/g, "\\%")
        .replace(/_/g, "\\_")
        .replace(/[,()]/g, " ")
        .trim()
        .slice(0, 100)
      const pattern = `%${safe}%`
      const fallback = await buildBaseQuery().or(
        `titulo.ilike.${pattern},numero.ilike.${pattern},resumen.ilike.${pattern}`
      )
      data = fallback.data
      count = fallback.count
      error = fallback.error
    }
  } else {
    const result = await buildBaseQuery()
    data = result.data
    count = result.count
    error = result.error
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data, count, page, limit })
}
