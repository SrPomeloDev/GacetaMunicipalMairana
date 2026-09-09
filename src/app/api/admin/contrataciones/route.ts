import { NextResponse } from "next/server"
import { requireVerModulo, requirePermiso, type PermisosUsuario } from "@/lib/permisos-server"
import { createAdminClient } from "@/lib/supabase/admin"
import { slugify } from "@/lib/utils"
import { contratacionInsertSchema } from "@/lib/validations/contrataciones"

export async function GET() {
  let permiso: PermisosUsuario | null
  try {
    permiso = await requireVerModulo("contrataciones")
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }
  if (!permiso) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { data, error } = await permiso.supabase
    .from("contrataciones")
    .select("*")
    .order("fecha_publicacion", { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  let permiso: PermisosUsuario | null
  try {
    permiso = await requirePermiso("contrataciones", "crear")
  } catch {
    return NextResponse.json({ error: "No tienes permiso para crear contrataciones" }, { status: 403 })
  }
  if (!permiso) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await request.json()
  const parsed = contratacionInsertSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
  }
  const admin = createAdminClient()

  const slug = slugify(parsed.data.titulo || "contratacion")

  const { data, error } = await admin
    .from("contrataciones")
    .insert({
      titulo: parsed.data.titulo,
      slug,
      tipo: parsed.data.tipo,
      modalidad: parsed.data.modalidad ?? null,
      objeto: parsed.data.objeto ?? null,
      monto: parsed.data.monto ?? null,
      empresa_adjudicada: parsed.data.empresa_adjudicada ?? null,
      fecha_publicacion: parsed.data.fecha_publicacion ?? null,
      fecha_presentacion: parsed.data.fecha_presentacion ?? null,
      fecha_adjudicacion: parsed.data.fecha_adjudicacion ?? null,
      archivo_pdf: parsed.data.archivo_pdf ?? null,
      estado: parsed.data.estado || "publicada",
      publicada: parsed.data.publicada ?? true,
    } as never)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
