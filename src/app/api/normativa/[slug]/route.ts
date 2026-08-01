import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from("normativa")
    .select("*, categoria:categorias_normativa(*), dependencia:dependencias(*), modificaciones:modificaciones_normativa(*)")
    .eq("slug", slug)
    .single()

  if (error) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await supabase.from("normativa").update({ visitas: (data.visitas || 0) + 1 }).eq("id", data.id)

  return NextResponse.json(data)
}
