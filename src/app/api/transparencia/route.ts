import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import type { Transparencia } from "@/types"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const supabase = await createServerSupabaseClient()

  const categoria = searchParams.get("categoria")
  const rawPage = parseInt(searchParams.get("page") || "1")
  const rawLimit = parseInt(searchParams.get("limit") || "50")
  const page = Number.isFinite(rawPage) && rawPage >= 1 ? Math.floor(rawPage) : 1
  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(Math.floor(rawLimit), 1), 50) : 50
  const offset = (page - 1) * limit

  let dbQuery = supabase
    .from("transparencia")
    .select("*")
    .eq("publicada", true)
    .order("fecha", { ascending: false })
    .range(offset, offset + limit - 1)

  if (categoria) dbQuery = dbQuery.eq("categoria", categoria as Transparencia["categoria"])

  const { data, error } = await dbQuery

  if (error) return NextResponse.json({ error: "No se pudo cargar la información" }, { status: 500 })
  return NextResponse.json(data)
}
