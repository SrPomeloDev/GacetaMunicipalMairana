import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import type { Normativa } from "@/types"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const supabase = await createServerSupabaseClient()

  const categoriaParam = searchParams.get("categoria")
  const estado = searchParams.get("estado")
  const query = searchParams.get("q")
  const fechaDesde = searchParams.get("desde")
  const fechaHasta = searchParams.get("hasta")
  const rawPage = parseInt(searchParams.get("page") || "1")
  const rawLimit = parseInt(searchParams.get("limit") || "20")
  const page = Number.isFinite(rawPage) && rawPage >= 1 ? Math.floor(rawPage) : 1
  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(Math.floor(rawLimit), 1), 50) : 20
  const offset = (page - 1) * limit

  let categoriaId: string | null = null
  if (categoriaParam) {
    const { data: catData } = await supabase
      .from("categorias_normativa")
      .select("id")
      .eq("slug", categoriaParam)
      .maybeSingle()
    if (catData) {
      categoriaId = catData.id
    } else {
      return NextResponse.json({ data: [], count: 0, page, limit })
    }
  }

  const buildBaseQuery = () => {
    let dbQuery = supabase
      .from("normativa")
      .select("id, numero, slug, titulo, resumen, categoria_id, dependencia_id, estado, fecha_aprobacion, fecha_publicacion, fecha_vigencia, numero_paginas, archivo_pdf, firma_digital, codigo_qr, visitas, publicada, categoria:categorias_normativa(*), dependencia:dependencias(*)", { count: "exact" })
      .eq("publicada", true)
      .order("fecha_publicacion", { ascending: false, nullsFirst: false })
      .range(offset, offset + limit - 1)

    if (categoriaId) dbQuery = dbQuery.eq("categoria_id", categoriaId)
    if (estado) dbQuery = dbQuery.eq("estado", estado as Normativa["estado"])
    if (fechaDesde) dbQuery = dbQuery.gte("fecha_publicacion", fechaDesde)
    if (fechaHasta) dbQuery = dbQuery.lte("fecha_publicacion", fechaHasta)
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

  if (error) return NextResponse.json({ error: "No se pudo cargar la información" }, { status: 500 })
  return NextResponse.json({ data, count, page, limit })
}