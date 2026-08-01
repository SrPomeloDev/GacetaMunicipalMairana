import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const supabase = await createServerSupabaseClient()

  const categoria = searchParams.get("categoria")
  const destacada = searchParams.get("destacada")
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "20")
  const offset = (page - 1) * limit

  let dbQuery = supabase
    .from("noticias")
    .select("*", { count: "exact" })
    .eq("publicada", true)
    .order("fecha_publicacion", { ascending: false })
    .range(offset, offset + limit - 1)

  if (categoria) dbQuery = dbQuery.eq("categoria", categoria)
  if (destacada === "true") dbQuery = dbQuery.eq("destacada", true)

  const { data, count, error } = await dbQuery

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data, count, page, limit })
}
