import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from("autoridades")
    .select("*, dependencia:dependencias(*)")
    .eq("activo", true)
    .order("orden", { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
