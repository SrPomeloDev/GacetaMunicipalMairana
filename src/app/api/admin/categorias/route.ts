import { NextResponse } from "next/server"
import { requireVerModulo, requirePermiso, type PermisosUsuario } from "@/lib/permisos-server"
import { createAdminClient } from "@/lib/supabase/admin"
import { slugify } from "@/lib/utils"
import { categoriaInsertSchema } from "@/lib/validations/categorias"

export async function GET() {
  let permiso: PermisosUsuario | null
  try {
    permiso = await requireVerModulo("categorias")
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }
  if (!permiso) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { data, error } = await permiso.supabase.from("categorias_normativa").select("*").order("orden")
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  let permiso: PermisosUsuario | null
  try {
    permiso = await requirePermiso("categorias", "crear")
  } catch {
    return NextResponse.json({ error: "No tienes permiso para crear categorías" }, { status: 403 })
  }
  if (!permiso) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await request.json()
  const parsed = categoriaInsertSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
  }
  const admin = createAdminClient()

  const { data, error } = await admin
    .from("categorias_normativa")
    .insert({
      nombre: parsed.data.nombre,
      slug: parsed.data.slug || slugify(parsed.data.nombre),
      descripcion: parsed.data.descripcion ?? null,
      color: parsed.data.color || "orange",
      icono: parsed.data.icono ?? null,
      orden: Number(parsed.data.orden ?? 0),
    } as never)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
