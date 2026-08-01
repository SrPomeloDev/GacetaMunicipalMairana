import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from("noticias")
    .select("*")
    .eq("slug", slug)
    .single()

  if (error) return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json(data)
}
