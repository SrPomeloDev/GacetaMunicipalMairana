import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const rawPage = parseInt(searchParams.get("page") || "1")
  const rawLimit = parseInt(searchParams.get("limit") || "50")
  const page = Number.isFinite(rawPage) && rawPage >= 1 ? Math.floor(rawPage) : 1
  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(Math.floor(rawLimit), 1), 50) : 50
  const offset = (page - 1) * limit

  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from("tramites")
    .select("*, dependencia:dependencias(*)")
    .eq("activo", true)
    .order("titulo", { ascending: true })
    .range(offset, offset + limit - 1)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
