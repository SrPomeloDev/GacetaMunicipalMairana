import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const tipo = searchParams.get("tipo")

  const supabase = await createServerSupabaseClient()

  let query = supabase
    .from("contrataciones")
    .select("*")
    .eq("publicada", true)
    .order("fecha_publicacion", { ascending: false, nullsFirst: false })

  if (tipo) query = query.eq("tipo", tipo)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
