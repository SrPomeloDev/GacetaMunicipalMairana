import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const supabase = await createServerSupabaseClient()

  const categoria = searchParams.get("categoria")

  let dbQuery = supabase
    .from("transparencia")
    .select("*")
    .eq("publicada", true)
    .order("fecha", { ascending: false })

  if (categoria) dbQuery = dbQuery.eq("categoria", categoria)

  const { data, error } = await dbQuery

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
