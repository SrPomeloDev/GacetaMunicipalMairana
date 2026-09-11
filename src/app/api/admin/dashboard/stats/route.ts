import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getPermisosUsuario } from "@/lib/permisos-server"

export async function GET() {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const permisos = await getPermisosUsuario(supabase)
  if (!permisos) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  const [normativasRes, noticiasRes, usuariosRes, estadosRes, aniosRes] = await Promise.all([
    supabase.from("normativa").select("*", { count: "exact", head: true }),
    supabase.from("noticias").select("*", { count: "exact", head: true }),
    supabase.from("usuarios").select("*", { count: "exact", head: true }),
    supabase.from("normativa").select("estado"),
    supabase.from("normativa").select("fecha_publicacion"),
  ])

  const estados: Record<string, number> = {}
  if (estadosRes.data) {
    for (const item of estadosRes.data) {
      const e = item.estado || "sin_estado"
      estados[e] = (estados[e] || 0) + 1
    }
  }

  const anios: Record<string, number> = {}
  if (aniosRes.data) {
    for (const item of aniosRes.data) {
      if (item.fecha_publicacion) {
        const anio = new Date(item.fecha_publicacion).getFullYear().toString()
        anios[anio] = (anios[anio] || 0) + 1
      }
    }
  }

  return NextResponse.json({
    total_normativas: normativasRes.count || 0,
    total_noticias: noticiasRes.count || 0,
    total_usuarios: usuariosRes.count || 0,
    normativas_por_estado: estados,
    normativas_por_anio: anios,
  })
}
